import { vec3, vec4, vec2 } from "gl-matrix";
 
export class Vertex {
    position: number[];
    normal: vec3;
    texCoords: vec2;
    edge: Halfedge;
    mesh_index: number;
    offset: number;
    index: number;
    pos: vec4;
    indicesOrder: number[];

    constructor(position: number[], normal: vec3, texCoords: vec2, edge: Halfedge = null) {
        this.position = position;
        this.normal = normal;
        this.texCoords = texCoords;
        this.edge = edge;
    }
}

export class Halfedge {
    vertex: Vertex;
    face: Face;
    next: Halfedge;
    opposite: Halfedge;
    index: number;
    i: number;

    constructor(vertex: Vertex, face: Face) {
        this.vertex = vertex;
        this.face = face;
    }
}

export class Face {
    indices: number[];
    edge: Halfedge;

    constructor(indices: number[], edge: Halfedge = null) {
        this.indices = indices;
        this.edge = edge;
    }
}