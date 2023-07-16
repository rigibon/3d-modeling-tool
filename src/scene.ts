import { Model } from "./model";
import { Light } from "./light";
import { Camera } from "./cameras/camera";
import { Gizmo } from "./gizmo";
import { Entity } from "./entity";
import { Shader } from "./shader";
import { Skybox } from "./skybox";
import { vec3, mat4, glMatrix } from "gl-matrix";
import { ThirdPersonCamera } from "./cameras/thirdPersonCamera";
import Primitives from "./test/primitives.js";
import { TrackballCamera } from "./trackballRotator";

export class Scene {
    entities: Entity[] = [];
    models: Model[] = [];
    lights: Light[] = [];
    cameras: Camera[] = [];
    gizmos: Gizmo[] = [];
    selectedEntities: Entity[] = [];
    selectedEntity: Entity;
    mode: number = 0;
    name: String;
    activeCamera: number = -1;
    activeCam: any = null;
    lastCamera: number = -1;
    thirdPersonCamera: Camera = null;
    trackballCamera: any = null;
    editorCamera: any = null;
    sculptCamera: any = null;
    skyboxInit: any;
    skybox: any;

    constructor(name?: String) {
        this.name = name ? name : "NewScene";
    }

    draw(
        gl: any,
        shader: Shader,
        altShader: Shader,
        outlineShader: Shader,
        wireframeShader: Shader,
        skybox: Skybox,
        properties: any
    ): void {
        var currentCamera = this.getActiveCamera();

        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].isSelected =
                this.entities[i] == this.selectedEntity;

            if (this.activeCamera != -1) {
                this.entities[i].render(
                    gl,
                    shader,
                    altShader,
                    outlineShader,
                    wireframeShader,
                    currentCamera.viewMatrix,
                    currentCamera.projectionMatrix,
                    skybox,
                    properties
                );
            }
        }
    }

    renderLights() {
        for (var i = 0; i < this.lights.length; i++) {}
    }

    drawModels(
        gl: any,
        shader: Shader,
        viewMatrix: any,
        projectionMatrix: any,
        outlineShader: Shader = null,
        wireframeShader: Shader = null,
        pointShader: Shader = null,
        properties: any = null
    ) {
        for (var i = 0; i < this.models.length; i++) {
            shader.use();
            shader.setMat4("viewMatrix", viewMatrix);
            shader.setMat4("worldMatrix", this.models[i].worldMatrix);

            if (properties.selectedMode === "Edit") {
                if (
                    properties.selectedEntity === this.models[i] &&
                    properties.selectedMeshFromEntity
                ) {
                    shader.setMat4("projectionMatrix", projectionMatrix);

                    if (properties.selectedRenderingMode === "Wireframe") {
                        this.models[i].drawMesh(
                            gl,
                            properties.selectedMeshFromEntity,
                            true,
                            properties,
                            shader,
                            this.skybox
                        );

                        wireframeShader.use();

                        wireframeShader.setMat4(
                            "projectionMatrix",
                            this.activeCam.projectionMatrix
                        );
                        wireframeShader.setMat4(
                            "viewMatrix",
                            this.activeCam.viewMatrix
                        );
                        wireframeShader.setMat4(
                            "worldMatrix",
                            this.models[i].worldMatrix
                        );
    
                        this.models[i].drawWireframe(
                            gl,
                            properties.selectedMeshFromEntity
                        );

                        pointShader.use();

                        pointShader.setMat4(
                            "projectionMatrix",
                            this.activeCam.projectionMatrix
                        );
                        pointShader.setMat4(
                            "viewMatrix",
                            this.activeCam.viewMatrix
                        );
                        pointShader.setMat4(
                            "worldMatrix",
                            this.models[i].worldMatrix
                        );

                        this.models[i].drawPoints(
                            gl,
                            properties.selectedMeshFromEntity
                        )
                    } else {
                        this.models[i].drawMesh(
                            gl,
                            properties.selectedMeshFromEntity,
                            true,
                            properties,
                            shader,
                            this.skybox
                        );
                    }
                }
            } else if (properties.selectedMode === "Scene") {
                if (outlineShader) {
                    outlineShader.use();
                    var worldMatrixScaled = mat4.create();
                    mat4.scale(
                        worldMatrixScaled,
                        this.models[i].worldMatrix,
                        vec3.fromValues(1.018, 1.018, 1.018)
                    );
                    outlineShader.setMat4("worldMatrix", worldMatrixScaled);
                    outlineShader.setMat4("viewMatrix", viewMatrix);
                    outlineShader.setMat4("projectionMatrix", projectionMatrix);
                    outlineShader.setVec3("lineColor", 1.0, 0.5, 0.0);
                }

                gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
                gl.stencilFunc(gl.ALWAYS, 1, 0xff); // all fragments should pass the stencil test
                gl.stencilMask(0xff); // enable writing to the stencil buffer

                shader.use();
                shader.setMat4("viewMatrix", viewMatrix);
                shader.setMat4("worldMatrix", this.models[i].worldMatrix);
                shader.setMat4("projectionMatrix", projectionMatrix);
                this.models[i].drawMeshes(gl, true, properties, shader);

                if (this.models[i].isSelected) {
                    // gl.clear(gl.DEPTH_BUFFER_BIT);

                    gl.stencilFunc(gl.GREATER, 1, 0xff);
                    gl.stencilMask(0x00); // disable writing to the stencil buffer
                    gl.disable(gl.DEPTH_TEST);

                    outlineShader.use();
                    this.models[i].drawMeshes(gl, true, properties, shader, this.skybox, true);

                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
                    gl.stencilFunc(gl.ALWAYS, 1, 0xff); // all fragments should pass the stencil test
                    gl.stencilMask(0xff); // enable writing to the stencil buffer

                    if (properties.selectedMeshFromEntity && properties.selectedEntity.topMeshes.length > 1) {
                        outlineShader.setVec3("lineColor", 1.0, 0.28, 0.0);
                        this.models[i].drawMesh(
                            gl,
                            properties.selectedMeshFromEntity,
                            false,
                            properties,
                            shader,
                            this.skybox,
                            true
                        );
                    }

                    gl.stencilMask(0xff);
                    gl.stencilFunc(gl.ALWAYS, 1, 0xff);
                    gl.enable(gl.DEPTH_TEST);
                }
            } else if (properties.selectedMode === "Sculpt") {
                if (properties.selectedEntity === this.models[i] && properties.selectedMeshFromEntity) {
                    properties.selectedEntity.drawSculptMesh(
                        gl,
                        properties.selectedMeshFromEntity,
                        shader,
                    );
                }
            }

            shader.use();
        }
    }

    addModel(model: Model): void {
        this.entities.push(model);
        this.models.push(model);
        model.id = this.entities.length - 1;
    }

    addLight(light: Light): void {
        light.id = this.lights.length;
        this.entities.push(light);
        this.lights.push(light);
        light.id = this.lights.length - 1;
    }

    addCamera(camera: Camera): void {
        this.cameras.push(camera);
        this.entities.push(camera);
        camera.id = this.entities.length - 1;
    }

    addCube(gl: any) {
        var mesh = Primitives.createCube(gl);

        var newCube: Model = new Model(
            gl,
            "Cube" + this.models.length,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            mesh,
            true,
            null
        );

        this.addModel(newCube);
    }

    addSphere(gl: any) {
        var mesh = Primitives.createCube(gl);
        var isSphere = true;

        var newSphere: Model = new Model(
            gl,
            "Sphere" + this.models.length,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            mesh,
            true,
            null,
            isSphere
        );

        this.addModel(newSphere);
    }

    addPlane(gl: any) {
        var mesh = Primitives.createPlane(gl);

        var newPlane: Model = new Model(
            gl,
            "Plane" + this.models.length,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            mesh,
            true,
            null,
            false
        );

        this.addModel(newPlane);
    }

    addArrow(gl: any) {
        var mesh = Primitives.createArrow(gl);

        var newArrow: Model = new Model(
            gl,
            "Arrow" + this.models.length,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            mesh,
            true,
            null,
            false
        );

        this.addModel(newArrow);
    }

    addCylinder(gl: any) {
        var mesh = Primitives.createCylinder(gl);

        var newCylinder: Model = new Model(
            gl,
            "Cylinder" + this.models.length,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            mesh,
            true,
            null,
            false
        );

        this.addModel(newCylinder);
    }

    addTorus(gl: any) {
        var mesh = Primitives.createTorus(gl);

        var newTorus: Model = new Model(
            gl,
            "Torus" + this.models.length,
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            mesh,
            true,
            null,
            false
        );

        this.addModel(newTorus);
    }

    removeEntity(entity: Entity): void {
        if (entity.type) {
            for (var i = 0; i < this.cameras.length; i++) {
                if (entity.name == this.cameras[i].name) {
                    if (i == this.activeCamera) {
                        this.activeCamera = -1;
                        this.lastCamera = -1;
                    } else if (i < this.activeCamera) {
                        this.activeCamera--;
                    }

                    this.cameras.splice(i, 1);

                    break;
                }
            }
        }

        this.entities.splice(entity.id, 1);
    }

    isRendering() {
        return this.activeCamera !== -1;
    }

    getActiveCamera() {
        return this.cameras[this.activeCamera];
    }

    getLastCamera() {
        return this.cameras[this.lastCamera];
    }

    setFirstActiveCamera(properties: any) {
        this.activeCamera = 0;
        this.cameras[0].active = true;
        properties.activeCamera = 0;
        properties.newCameraSelected = true;
    }

    setCameras(gl: any, canvas: any, modelPosition: any, ui: any) {
        var proj = mat4.create();

        mat4.perspective(
            proj,
            (45.0 * Math.PI) / 180.0,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            100.0
        );

        var worldMatrix = mat4.create();
        mat4.translate(
            worldMatrix,
            worldMatrix,
            vec3.fromValues(0.0, 0.0, 0.0)
        );
        var viewMatrix = mat4.create();
        mat4.lookAt(
            viewMatrix,
            vec3.fromValues(15.0, 15.0, 15.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0)
        );

        var initViewMatrix = mat4.create();
        mat4.lookAt(
            initViewMatrix,
            vec3.fromValues(15.0, 15.0, 15.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0)
        );

        var projectionMatrix = mat4.create();
        mat4.perspective(
            projectionMatrix,
            glMatrix.toRadian(40),
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            1.0,
            100.0
        );

        this.trackballCamera = new TrackballCamera(
            gl,
            "newCamera",
            vec3.fromValues(5.0, 5.0, 5.0),
            canvas,
            viewMatrix,
            projectionMatrix,
            modelPosition,
            12.0
        );

        this.thirdPersonCamera = new ThirdPersonCamera(
            gl,
            "thirdPersonCamera",
            vec3.fromValues(-5.0, 0.0, 0.0),
            ui.io,
            canvas,
            viewMatrix,
            projectionMatrix
        );

        this.editorCamera = new TrackballCamera(
            gl,
            "editorCamera",
            vec3.fromValues(0.0, 0.0, 0.0),
            canvas,
            viewMatrix,
            projectionMatrix,
            modelPosition,
            5.0
        );

        this.sculptCamera = new TrackballCamera(
            gl,
            "sculptCamera",
            vec3.fromValues(2.8, 2.8, 2.8),
            canvas,
            viewMatrix,
            projectionMatrix,
            modelPosition,
            4.0
        );

        this.activeCam = this.trackballCamera;
    }
}
