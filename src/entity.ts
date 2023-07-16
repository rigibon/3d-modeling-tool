import { vec3, mat4 } from "gl-matrix";
import { Shader } from "./Shader";
import { Material } from "./material";
import { Skybox } from "./skybox";

export class Entity {
    isSelected: boolean;
    position: vec3;
    rotation: vec3;
    scale?: vec3;
    worldMatrix: mat4;
    viewMatrix?: mat4;
    show: boolean;
    type?: string;
    name: string;
    octree?: any;
    edges?: any;
    material?: Material;
    id: number;

    render(gl: any, shader: Shader, altShader: Shader, outlineShader: Shader, wireframeShader: Shader, viewMatrix?: mat4, projectionMatrix?: mat4, skybox?: Skybox, properties?: any) {};
}