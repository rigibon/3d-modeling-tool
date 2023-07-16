import { vec3, mat4, mat3, vec4 } from "gl-matrix";

var cubeSize = 0.01;

var cubeVerticesHighlight = [
    // Cara delantera
    -cubeSize,
    -cubeSize,
    cubeSize,
    cubeSize,
    -cubeSize,
    cubeSize,
    cubeSize,
    cubeSize,
    cubeSize,
    -cubeSize,
    cubeSize,
    cubeSize,

    // Cara trasera
    -cubeSize,
    -cubeSize,
    -cubeSize,
    -cubeSize,
    cubeSize,
    -cubeSize,
    cubeSize,
    cubeSize,
    -cubeSize,
    cubeSize,
    -cubeSize,
    -cubeSize,

    // Top face
    -cubeSize,
    cubeSize,
    -cubeSize,
    -cubeSize,
    cubeSize,
    cubeSize,
    cubeSize,
    cubeSize,
    cubeSize,
    cubeSize,
    cubeSize,
    -cubeSize,

    // Bottom face
    -cubeSize,
    -cubeSize,
    -cubeSize,
    cubeSize,
    -cubeSize,
    -cubeSize,
    cubeSize,
    -cubeSize,
    cubeSize,
    -cubeSize,
    -cubeSize,
    cubeSize,

    // Right face
    cubeSize,
    -cubeSize,
    -cubeSize,
    cubeSize,
    cubeSize,
    -cubeSize,
    cubeSize,
    cubeSize,
    cubeSize,
    cubeSize,
    -cubeSize,
    cubeSize,

    // Left face
    -cubeSize,
    -cubeSize,
    -cubeSize,
    -cubeSize,
    -cubeSize,
    cubeSize,
    -cubeSize,
    cubeSize,
    cubeSize,
    -cubeSize,
    cubeSize,
    -cubeSize,
];

var cubeIndicesHighlight = [
    0,
    1,
    2,
    0,
    2,
    3, // enfrente
    4,
    5,
    6,
    4,
    6,
    7, // atrás
    8,
    9,
    10,
    8,
    10,
    11, // arriba
    12,
    13,
    14,
    12,
    14,
    15, // fondo
    16,
    17,
    18,
    16,
    18,
    19, // derecha
    20,
    21,
    22,
    20,
    22,
    23, // izquierda
];

export class TopHighlight {
    indexBuffer = null;
    edgeVertexBuffer = null;

    constructor() {}

    HighlightVertex(gl, meshWorldMatrix, vertexShader, vertexPosition) {
        vertexShader.use();

        var tempMatrix = mat4.create();
        vec3.transformMat4(vertexPosition, vertexPosition, meshWorldMatrix);
        mat4.translate(
            tempMatrix,
            tempMatrix,
            vec3.fromValues(
                vertexPosition[0],
                vertexPosition[1],
                vertexPosition[2]
            )
        );
        vertexShader.setMat4("worldMatrix", tempMatrix);

        gl.enableVertexAttribArray(0);
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertexPosition),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.clear(gl.DEPTH_BUFFER_BIT);

        // gl.drawElements(gl.TRIANGLES, cubeIndicesHighlight.length, gl.UNSIGNED_INT, 0);
        gl.drawArrays(gl.POINTS, 0, 1);
    }

    HighlightFaceNormal(gl, normal, normalShader) {
        normalShader.use();
        var normalVector = vec3.fromValues(normal[0], normal[1], normal[2]);

        var normalFirstPoint = vec3.create();
        vec3.scale(normalFirstPoint, normalVector, -25);

        var normalLastPoint = vec3.create();
        vec3.scale(normalLastPoint, normalVector, 25);

        var vertices = [
            normalFirstPoint[0],
            normalFirstPoint[1],
            normalFirstPoint[2],
            normalLastPoint[0],
            normalLastPoint[1],
            normalLastPoint[2],
        ];

        gl.enableVertexAttribArray(0);
        var edgeVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, edgeVertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.LINES, 0, 2);
    }

    HighlightFace(gl, mesh, faceShader, face) {
        faceShader.use();
        var vAr = mesh.getVertices();

        var vertices = [];

        var verticesInFace = mesh.getVerticesFromFaces([face]);

        vertices.push(vAr[verticesInFace[0] * 3 + 0]);
        vertices.push(vAr[verticesInFace[0] * 3 + 1]);
        vertices.push(vAr[verticesInFace[0] * 3 + 2]);

        vertices.push(vAr[verticesInFace[1] * 3 + 0]);
        vertices.push(vAr[verticesInFace[1] * 3 + 1]);
        vertices.push(vAr[verticesInFace[1] * 3 + 2]);

        vertices.push(vAr[verticesInFace[2] * 3 + 0]);
        vertices.push(vAr[verticesInFace[2] * 3 + 1]);
        vertices.push(vAr[verticesInFace[2] * 3 + 2]);

        vertices.push(vAr[verticesInFace[0] * 3 + 0]);
        vertices.push(vAr[verticesInFace[0] * 3 + 1]);
        vertices.push(vAr[verticesInFace[0] * 3 + 2]);

        vertices.push(vAr[verticesInFace[2] * 3 + 0]);
        vertices.push(vAr[verticesInFace[2] * 3 + 1]);
        vertices.push(vAr[verticesInFace[2] * 3 + 2]);

        vertices.push(vAr[verticesInFace[3] * 3 + 0]);
        vertices.push(vAr[verticesInFace[3] * 3 + 1]);
        vertices.push(vAr[verticesInFace[3] * 3 + 2]);

        var indices = [0, 1, 2, 0, 2, 3];

        // var indexBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        // gl.bufferData(
        //     gl.ELEMENT_ARRAY_BUFFER,
        //     new Uint32Array(indices),
        //     gl.STATIC_DRAW
        // );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.enableVertexAttribArray(0);
        var edgeVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, edgeVertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    HighlightEdge(gl, mesh, edgeShader, edges) {
        edgeShader.use();
        var vAr = mesh.getVertices();
        var vertices = [];

        if (edges) {
            vertices = [
                vAr[edges[0] * 3 + 0],
                vAr[edges[0] * 3 + 1],
                vAr[edges[0] * 3 + 2],
                vAr[edges[1] * 3 + 0],
                vAr[edges[1] * 3 + 1],
                vAr[edges[1] * 3 + 2],
            ];
        }

        gl.enableVertexAttribArray(0);
        var edgeVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, edgeVertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(vertices),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.LINES, 0, 2);
    }

    HighlightCoordinatePlaneFacing() {}
}
