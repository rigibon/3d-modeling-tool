import { Entity } from "./entity";
import { vec3, mat4 } from "gl-matrix";
import { Shader } from "./shader";

export class Light implements Entity {
    name: string;
    position: vec3;
    rotation: vec3 = vec3.fromValues(0.0, 0.0, 0.0);
    isSelected: boolean = false;
    worldMatrix: mat4 = mat4.create();
    show: boolean = true;
    id: number = 0;
    color: vec3 = vec3.fromValues(1.0, 1.0, 1.0);
    intensity: number = 30.0;
    aconst: number = 1;
    alin: number = 1;
    aquad: number = 1;
    type: string = "Light";

    constructor(
        name: string, 
        position: vec3, 
        color: vec3 = vec3.fromValues(1.0, 1.0, 1.0),
        intensity: number = 30.0,
        aconst: number = 1,
        alin: number = 1,
        aquad: number = 1
        ) {
        this.name = name;
        this.position = position;
        this.color = color;
        this.intensity = intensity;
        this.aconst = aconst;
        this.alin = alin;
        this.aquad = aquad;
    }

    render(gl: any, shader: Shader, altShader: Shader, outlineShader: Shader, wireframeShader: Shader, viewMatrix: mat4): void {
        // console.log("       Rendering light: " + this.name + " in position " + this.position);
    }
}

export class PhongLight extends Light {
    show: boolean = true;
    id: number = 0;
    position: vec3;
    rotation: vec3 = vec3.fromValues(0.0, 0.0, 0.0);
    color: vec3 = vec3.fromValues(1.0, 1.0, 1.0);
    intensity: number = 30.0;
    aconst: number = 1;
    alin: number = 1;
    aquad: number = 1;
    worldMatrix: mat4 = mat4.create();
    type: string = "PhongLight";

    constructor(
        name: string, 
        position: vec3, 
        color: vec3 = vec3.fromValues(1.0, 1.0, 1.0), 
        intensity: number = 30.0,
        aconst: number = 1,
        alin: number = 1,
        aquad: number = 1
    ) {
        super(name, position, color, intensity, aconst, alin, aquad);
    }

    instantiate(gl: any, shader: Shader, id: number) {
        shader.use();
        shader.setVec3("lights[" + id + "].position", this.position[0], this.position[1], this.position[2]);
        shader.setVec3("lights[" + id + "].color", this.color[0], this.color[1], this.color[2]);
        shader.setFloat("lights[" + id + "].intensity", this.intensity);
        shader.setFloat("lights[" + id + "].aconst", this.aconst);
        shader.setFloat("lights[" + id + "].alin", this.alin);
        shader.setFloat("lights[" + id + "].aquad", this.aquad);
    }

    render = (gl: any, shader: Shader, altShader: Shader, outlineShader: Shader, wireframeShader: Shader, viewMatrix: mat4): void => {
        shader.use();
        // shader.setVec3("lights[" + this.id + "].position", this.position[0], this.position[1], this.position[2]);
    }
}