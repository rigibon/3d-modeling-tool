import { Entity } from "../entity";
import { glMatrix, vec3, mat4 } from "gl-matrix";
import { Shader } from "../shader";

export class Camera implements Entity {
    name: string;
    position: vec3;
    rotation: vec3; // rotation with ui not working
    scale: vec3;
    worldMatrix: mat4 = mat4.create();
    viewMatrix: any;
    projectionMatrix: mat4;
    isSelected: boolean;
    show: boolean = true;
    type: string = "Free";
    active: boolean = false;
    wantCaptureMouse: boolean = false; // ARREGLAR
    renderWindow: boolean = false;
    id: number = 0;

    constructor(name: string, position: vec3, viewMatrix?: mat4, projectionMatrix?: mat4) {
        this.name = name;
        this.position = position;
        this.viewMatrix = viewMatrix;
        this.projectionMatrix = projectionMatrix;
    }

    setNormalMatrix(worldMatrix: mat4, shader: Shader): void {} // Esta funcion tendria que estar en cada entidad o modelo cada vez que se dibuje

    render(gl: any, shader: Shader): void {
        // shader.use();

        // shader.setMat4("viewMatrix", this.viewMatrix);
        // shader.setMat4("projectionMatrix", this.projectionMatrix);
    }

    getPosition(): any {

    }

    mouseMoveCallback(event: any): void {}

    mouseUpCallback(event: any): void {}

    mousePressCallback(event: any): void {}

    zoomCallback(event: any): void {}
}