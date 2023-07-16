import { Texture } from "./texture.js";
import {
    generate_skybox_vertex_shader,
    generate_skybox_fragment_shader,
} from "./shadersPrueba/generate_skybox_vertex_shader";
import { generate_irradiance_map_fragment_shader } from "./shadersPrueba/generate_irradiance_map_fragment_shader";
import {
    skybox_vertex_shader,
    skybox_fragment_shader,
    generate_prefilter_map_fragment_shader,
    integrate_brdf_vertex_shader,
    integrate_brdf_fragment_shader,
    depth_vertex_shader,
    depth_fragment_shader,
} from "./shadersPrueba/skybox_vertex_shader";
import { Camera } from "./cameras/camera";
import { TrackballCamera } from "./cameras/trackballCamera";
import { Model } from "./model";
import { vec3, mat4, glMatrix } from "gl-matrix";
import { Shader } from "./shader";

export class Skybox {
    envCubemap: any;
    irradianceMap: any;
    prefilterMap: any;
    brdfLUTTexture: any;
    camera: Camera;
    mesh: Model;
    res: number = 1024;
    shader: Shader;
    rendering = {
        exposure: { value: 1.0, uniform: undefined as any },
        gamma: { value: 1.8, uniform: undefined as any },
        ambientIntensity: { value: 1.0, uniform: undefined as any },
        hasChanged: false,
    };
    depthShader: any;

    // Shadowmap size
    shadowSize = { SHADOW_WIDTH: 128, SHADOW_HEIGHT: 128 }; // 640 * 480
    // Shadowmap FBO
    depthMapFBO: any;
    // Shadowmap texture
    depthMap: any;
    // Uniform to update shadow map location in fragment shader
    shadowMapUniform: any;

    constructor(gl: any, src: any, isHDR: any, canvas: any) {
        this.camera = new TrackballCamera(
            gl,
            "SkyboxCamera",
            vec3.fromValues(4.0, 4.0, 4.0),
            canvas
        );
        this.initSkybox(gl, src, isHDR);
    }

    initSkybox(gl: any, src: any, isHDR: any) {
        new Texture(
            gl,
            src,
            isHDR,
            gl.CLAMP_TO_EDGE,
            gl.LINEAR,
            (texture: any) => {
                this.createSkybox(gl, texture, isHDR);
            }
        );

        this.irradianceMap = this.initializeCubeMap(gl);

        this.prefilterMap = this.initializeCubeMap(gl);
        this.brdfLUTTexture = Texture.generateTextureFromData(
            gl,
            new Uint8Array([0.0, 0.0, 0.0]),
            1,
            1,
            false,
            gl.REPEAT,
            gl.NEAREST
        );

        this.initShadowMapFrameBuffer(gl);
    }

    render(gl: any, viewMatrix: mat4) {
        this.drawSkybox(gl, viewMatrix);
    }

    initializeCubeMap(gl: any) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        var data = new Uint8Array([255.0, 255.0, 255.0]);
        for (var i = 0; i < 6; ++i) {
            // This is probably poorly done, could be optimized
            gl.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                gl.RGB,
                1,
                1,
                0,
                gl.RGB,
                gl.UNSIGNED_BYTE,
                data
            );
        }
        return texture;
    }

    createSkybox(gl: any, texture: any, isHDR: any) {
        var skyboxModel = new Model(
            gl,
            "Skybox",
            vec3.fromValues(0.0, 0.0, 0.0),
            null
        );
        skyboxModel.load(gl, 0);

        this.mesh = skyboxModel;

        var generateSkyboxShader = new Shader(
            generate_skybox_vertex_shader,
            generate_skybox_fragment_shader,
            gl
        );
        generateSkyboxShader.use();
        generateSkyboxShader.setInt("isHDR", isHDR);

        this.envCubemap = this.renderToCubeMap(
            gl,
            generateSkyboxShader,
            texture,
            gl.TEXTURE_2D,
            this.res
        );
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envCubemap);
        gl.texParameteri(
            gl.TEXTURE_CUBE_MAP,
            gl.TEXTURE_MIN_FILTER,
            gl.LINEAR_MIPMAP_LINEAR
        );
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        this.initSkyboxShader(gl);
        this.initIrradianceMap(gl);
        this.initSpecularMaps(gl);
    }

    initIrradianceMap(gl: any) {
        var irradianceMapRes = 32;
        var generateIrradianceMapShader: Shader = new Shader(
            generate_skybox_vertex_shader,
            generate_irradiance_map_fragment_shader,
            gl
        );
        generateIrradianceMapShader.use();
        this.irradianceMap = this.renderToCubeMap(
            gl,
            generateIrradianceMapShader,
            this.envCubemap,
            gl.TEXTURE_CUBE_MAP,
            irradianceMapRes
        );
    }

    initSkyboxShader(gl: any) {
        this.shader = new Shader(
            skybox_vertex_shader,
            skybox_fragment_shader,
            gl
        );
        this.shader.use();

        this.shader.setMat4("projectionMatrix", this.camera.projectionMatrix);
        this.shader.setInt("environmentMap", 0);
        this.shader.setFloat("exposure", this.rendering.exposure.value);
        this.shader.setFloat("gamma", this.rendering.gamma.value);
        this.shader.setFloat(
            "ambientIntensity",
            this.rendering.ambientIntensity.value
        );
    }

    renderToCubeMap(gl: any, shader: Shader, src: any, srcType: any, res: any) {
        // Setup cubemap texture parameters
        var cubeMap = this.generateCubemapTexture(gl, res, gl.LINEAR);

        shader.use();
        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, 90.0, 1.0, 0.48, 10.0);
        shader.setMat4("projectionMatrix", projectionMatrix);
        shader.setInt("environmentMap", 0);

        // Init frame buffers and source texture
        this.configureFramebufferAndContext(gl, res, src, srcType);
        // Actual render on each face
        this.renderCubeMapFaces(gl, shader, cubeMap, 0);
        // Restore context
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.enable(gl.CULL_FACE);
        return cubeMap;
    }

    generateCubemapTexture(gl: any, res: any, minFilter: any) {
        var cubeMap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
        for (var i = 0; i < 6; ++i) {
            // This is probably poorly done, could be optimized
            gl.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                gl.RGB,
                res,
                res,
                0,
                gl.RGB,
                gl.UNSIGNED_BYTE,
                null
            );
        }
        gl.texParameteri(
            gl.TEXTURE_CUBE_MAP,
            gl.TEXTURE_WRAP_S,
            gl.CLAMP_TO_EDGE
        );
        gl.texParameteri(
            gl.TEXTURE_CUBE_MAP,
            gl.TEXTURE_WRAP_T,
            gl.CLAMP_TO_EDGE
        );
        gl.texParameteri(
            gl.TEXTURE_CUBE_MAP,
            gl.TEXTURE_WRAP_R,
            gl.CLAMP_TO_EDGE
        );
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, minFilter);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        return cubeMap;
    }

    configureFramebufferAndContext(gl: any, res: any, src: any, srcType: any) {
        // Just frame buffer things => render to a render buffer
        var captureFBO = gl.createFramebuffer();
        var captureRBO = gl.createRenderbuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, captureFBO);
        gl.bindRenderbuffer(gl.RENDERBUFFER, captureRBO);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, res, res);
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            captureRBO
        );

        // Configure context for cube rendering
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(srcType, src);
        gl.viewport(0, 0, res, res); // don't forget to configure the viewport to the capture dimensions.
        gl.bindFramebuffer(gl.FRAMEBUFFER, captureFBO);
        gl.disable(gl.CULL_FACE);
        return captureRBO;
    }

    renderCubeMapFaces(gl: any, shader: any, cubeMap: any, mip: any) {
        var m0 = mat4.create();
        var m1 = mat4.create();
        var m2 = mat4.create();
        var m3 = mat4.create();
        var m4 = mat4.create();
        var m5 = mat4.create();

        mat4.lookAt(
            m0,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(1.0, 0.0, 0.0),
            vec3.fromValues(0.0, -1.0, 0.0)
        );
        mat4.lookAt(
            m1,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(-1.0, 0.0, 0.0),
            vec3.fromValues(0.0, -1.0, 0.0)
        );
        mat4.lookAt(
            m2,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0),
            vec3.fromValues(0.0, 0.0, 1.0)
        );
        mat4.lookAt(
            m3,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, -1.0, 0.0),
            vec3.fromValues(0.0, 0.0, -1.0)
        );
        mat4.lookAt(
            m4,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, 1.0),
            vec3.fromValues(0.0, -1.0, 0.0)
        );
        mat4.lookAt(
            m5,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, -1.0),
            vec3.fromValues(0.0, -1.0, 0.0)
        );

        var captDir = [m0, m1, m2, m3, m4, m5];

        var captProj = mat4.create();
        mat4.perspective(captProj, glMatrix.toRadian(90), 1.0, 0.1, 10.0);

        shader.use();

        for (var i = 0; i < 6; ++i) {
            shader.setMat4("viewMatrix", captDir[i]);
            shader.setMat4("projectionMatrix", captProj);
            gl.framebufferTexture2D(
                gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                cubeMap,
                mip
            );
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            this.mesh.renderAlt(gl, shader, null, captDir[i], captProj);
        }
    }

    initSpecularMaps(gl: any) {
        // Create shader program
        // var generatePrefilterMapProgram = initShaders(generate_skybox_vertex_shader, generate_prefilter_map_fragment_shader);
        var generatePrefilterMapShader: Shader = new Shader(
            generate_skybox_vertex_shader,
            generate_prefilter_map_fragment_shader,
            gl
        );
        generatePrefilterMapShader.use();

        // Generate texture and mip_maps
        var res = 256;
        this.prefilterMap = this.generateCubemapTexture(
            gl,
            res,
            gl.LINEAR_MIPMAP_LINEAR
        );
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        generatePrefilterMapShader.setFloat("resolution", this.res);

        var captureRBO = this.configureFramebufferAndContext(
            gl,
            res,
            this.envCubemap,
            gl.TEXTURE_CUBE_MAP
        );

        var maxMipLevels = 5;
        for (var mip = 0; mip < maxMipLevels; ++mip) {
            // reisze framebuffer according to mip-level size.
            var mipRes = res * Math.pow(0.5, mip);
            gl.bindRenderbuffer(gl.RENDERBUFFER, captureRBO);
            gl.renderbufferStorage(
                gl.RENDERBUFFER,
                gl.DEPTH_COMPONENT24,
                mipRes,
                mipRes
            );
            gl.viewport(0, 0, mipRes, mipRes);

            var roughness = mip / (maxMipLevels - 1);
            generatePrefilterMapShader.setFloat("roughness", roughness);
            this.renderCubeMapFaces(
                gl,
                generatePrefilterMapShader,
                this.prefilterMap,
                mip
            );
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.enable(gl.CULL_FACE);

        this.brdfLUTTexture = this.initBrdfLut(gl);
    }

    initBrdfLut(gl: any) {
        var brdfLUTShader: Shader = new Shader(
            integrate_brdf_vertex_shader,
            integrate_brdf_fragment_shader,
            gl
        );
        brdfLUTShader.use();

        // Create 2D texture with attributes
        var res = 512;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            res,
            res,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            null
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Just frame buffer things => render to a texture here
        var captureFBO = gl.createFramebuffer();
        var captureRBO = gl.createRenderbuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, captureFBO);
        gl.bindRenderbuffer(gl.RENDERBUFFER, captureRBO);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, res, res);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0
        );

        // Update context, frame buffer writes to a texture
        gl.viewport(0, 0, res, res);
        gl.disable(gl.CULL_FACE);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0
        );
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var quad: Model = new Model(
            gl,
            "quad",
            vec3.fromValues(0.0, 0.0, 0.0),
            null
        );
        quad.load(gl, 0);

        quad.meshes[0].indices = [2, 0, 1, 2, 1, 3];
        quad.meshes[0].bVertices = [-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0];
        quad.meshes[0].bTexCoords = [0, 1, 0, 0, 1, 1, 1, 0];

        quad.renderAlt(
            gl,
            brdfLUTShader,
            null,
            this.camera.viewMatrix,
            this.camera.projectionMatrix
        );

        // Restore context
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.enable(gl.CULL_FACE);

        // At last, bind texture
        return texture;
    }

    drawSkybox(gl: any, viewMatrix: any) {
        this.shader.use();

        gl.cullFace(gl.FRONT);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.envCubemap);

        this.shader.setMat4("viewMatrix", viewMatrix);
        this.shader.setMat4("projectionMatrix", this.camera.projectionMatrix);

        // if(rendering.hasChanged){
        //     gl.uniform1f(skybox.exposureUniform, rendering.exposure.value);
        //     gl.uniform1f(skybox.gammaUniform, rendering.gamma.value);
        // }

        this.mesh.renderAlt(
            gl,
            this.shader,
            null,
            viewMatrix,
            this.camera.projectionMatrix
        );

        gl.cullFace(gl.BACK);
    }

    initShadowMapFrameBuffer(gl: any) {
        this.depthShader = new Shader(
            depth_vertex_shader,
            depth_fragment_shader,
            gl
        );

        this.depthMap = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.depthMap);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.DEPTH_COMPONENT32F,
            this.shadowSize.SHADOW_WIDTH,
            this.shadowSize.SHADOW_HEIGHT,
            0,
            gl.DEPTH_COMPONENT,
            gl.FLOAT,
            null
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_COMPARE_MODE,
            gl.COMPARE_REF_TO_TEXTURE
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);

        this.depthMapFBO = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthMapFBO);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D,
            this.depthMap,
            0
        );
        gl.drawBuffers([gl.NONE]);
        gl.readBuffer(gl.NONE);

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status != gl.FRAMEBUFFER_COMPLETE) {
            // console.log("fb status: " + status.toString(16));
            return;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}
