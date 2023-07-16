import { Vertex, Halfedge, Face } from "./geometry/structures";
import { Buffers } from "./buffer";
import { Shader } from "./shader";
import { vec3 } from "gl-matrix";
import { vOutline, fOutline } from "./shaders/outline";

export class Meshs {
    vertices: Vertex[];
    indices: number[];
    faces: number[][];
    name: string;

    // BUFFERS
    positionBuffer: Buffers;
    indexBuffer: Buffers;
    normalBuffer: Buffers;
    texCoordsBuffer: Buffers;

    // BUFFER DATA
    bVertices: number[];
    bNormals: number[];
    bTexCoords: number[];
    bNormalsDynamic: number[];

    setupDone: boolean = false;

    constructor(name: string, vertices: Vertex[], indices: number[], faces?: number[][]) {
        this.name = name;
        this.vertices = vertices;
        this.indices = indices;
        this.faces = faces;

        this.initializeBufferData();
    }

    initializeBufferData(): any {
        var vertices: number[][] = new Array();
        var normals: number[] = new Array();
        var texCoords: number[] = new Array();

        for (var i = 0; i < this.vertices.length; i++) {
            vertices.push(this.vertices[i].position);
            normals.push(this.vertices[i].normal[0]);
            normals.push(this.vertices[i].normal[1]);
            normals.push(this.vertices[i].normal[2]);
            texCoords.push(this.vertices[i].texCoords[0]);
            texCoords.push(this.vertices[i].texCoords[1]);
        }

        this.bVertices = [].concat([].concat.apply([], vertices));
        this.bNormals = normals;
        this.bNormalsDynamic = normals;
        this.bTexCoords = texCoords;

        // console.log(this.bVertices.length);
    }

    setupMesh(gl: any): void {
        if (!this.setupDone) {
            this.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), gl.DYNAMIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

            gl.enableVertexAttribArray(0);
            this.positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.bVertices), gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(1);
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.bNormals), gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(2);
            this.texCoordsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.bTexCoords), gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

            this.setupDone = true;
        }
    }

    draw(gl: any, shader: Shader, outlineShader: Shader, isSelected: boolean): void {
        shader.use();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indexBuffer), gl.STATIC_DRAW);
        // gl.clear(gl.STENCIL_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(1);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(2);

        // gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
        // gl.stencilFunc(gl.ALWAYS, 1, 0xFF); // all fragments should pass the stencil test
        // gl.stencilMask(0xFF); // enable writing to the stencil buffer
        
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
        // gl.drawArrays(gl.TRIANGLES, 0, 100);

        // if (isSelected) {
        //     gl.stencilFunc(gl.GREATER, 1, 0xFF);
        //     gl.stencilMask(0x00); // disable writing to the stencil buffer
        //     gl.disable(gl.DEPTH_TEST);
        //     outlineShader.use();
        //     gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
        // }

        // gl.stencilMask(0xFF);
        // gl.stencilFunc(gl.ALWAYS, 1, 0xFF);   
        // gl.enable(gl.DEPTH_TEST);

        // shader.use();
    }

    updateVertex(gl: any, vertexIndex: number, position: vec3) {
        var data = [position[0], position[1], position[2]];
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, vertexIndex * 12, new Float32Array(data));
        this.vertices[vertexIndex].position = [data[0], data[1], data[2]];
    }

    updateNormal(gl: any, vertexIndex: number, normal: vec3) {
        var data = [normal[0], normal[1], normal[2]];
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, vertexIndex * 12, new Float32Array(data));
    }
}