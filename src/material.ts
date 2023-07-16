import { vec3 } from "gl-matrix";
import { Shader } from "./shader";
import { Skybox } from "./skybox";
import { loadTexture } from "./texture";

export class Material {
    gl: any;
    albedo: any;
    normal: any;
    metallic: any;
    roughness: any;
    ao: any;
    aT: any;
    nT: any;
    mT: any;
    rT: any;
    aoT: any;
    bindTextureTargets: boolean = false;

    constructor() {
        
    }

    initMaterial(gl: any) {
        this.albedo = loadTexture(gl, null);
        this.normal = loadTexture(gl, null);
        this.metallic = loadTexture(gl, null);
        this.roughness = loadTexture(gl, null);
        this.ao = loadTexture(gl, null);

        this.aT = this.albedo;
        this.nT = this.normal;
        this.mT = this.metallic;
        this.rT = this.roughness;
        this.aoT = this.ao;
    }

    render(gl: any, shader: Shader, properties: any, skybox: Skybox) {
        shader.use();

        if (!this.bindTextureTargets) {
            this.initMaterial(gl);
            shader.setInt("albedoMap", 0);
            shader.setInt("normalMap", 1);
            shader.setInt("metallicMap", 2);
            shader.setInt("roughnessMap", 3);
            shader.setInt("aoMap", 4);

            if (skybox) {
                shader.setInt("environmentMap", 5);
                shader.setInt("prefilterMap", 6);
                shader.setInt("brdfLUT", 7);
            }
            
            this.bindTextureTargets = true;
        }

        shader.setFloat("exposure", 1.0);
        shader.setFloat("gamma", 1.5);
        shader.setFloat("ambientIntensity", 1.0);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.aT);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.nT);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D,  this.mT);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.rT);
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.aoT);

        if (properties.iblEnabled && skybox) {
            gl.activeTexture(gl.TEXTURE5);  
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, properties.irradianceMap ? skybox.irradianceMap : null);

            gl.activeTexture(gl.TEXTURE6);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, properties.prefilterMap ? skybox.prefilterMap : null);

            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_2D, properties.brdfLUTTexture ? skybox.brdfLUTTexture : null);
        } else {
            gl.activeTexture(gl.TEXTURE5);  
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

            gl.activeTexture(gl.TEXTURE6);
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }
}