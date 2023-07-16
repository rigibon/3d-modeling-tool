import { Shader } from "./shader";
// import { vBasic, fBasic, vEdge, fEdge, vMatcapShader, fMatcapShader, vWireframeShader, fWireframeShader } from "./shaderSource.js";
import { mat4, vec3, glMatrix } from "gl-matrix";
import Mesh from "./test/mesh.js";
import MeshStatic from "./test/meshStatic.js";
import Picking from "./test/picking.js";
import Primitives, { createMesh } from "./test/primitives.js";
import MultiMesh from "./test/multimesh.js";
import Subdivision from "./test/subdivision.js";
import { GLU } from "./GLU.js";
import { TrackballCamera } from "./trackballRotator.js";
import { Utils } from "./test/utils.js";
// import Subdivision from "./test/dynamic/subdivision.js";
// import MeshDynamic from "./test/meshDynamic.js";
import { TopEditor } from "./topEditor.js";
import { vTransformGizmo, fTransformGizmo } from "./shaders/transformGizmo";
import {
    vCursorEditingShader,
    fCursorEditingShader,
} from "./shaders/cursorEditing";

export class CursorEditingGizmo {
    _vertices;
    _indices;
    _radiusPoints = [];
    _shader = null;
    _worldMatrix = mat4.create();
    _viewMatrix = mat4.create();
    _projectionMatrix = mat4.create();
    _indexBuffer = null;
    _positionBuffer = null;
    _xPos = 0;
    _yPos = 0;
    _widthFace = 0.035;
    _heightFace = 0.0035;

    constructor(gl) {
        this._vertices = [
            -this._widthFace,
            this._heightFace,
            0.0,
            -this._widthFace,
            -this._heightFace,
            -0.0,
            -this._heightFace,
            -this._heightFace,
            -0.0,
            -this._heightFace,
            this._heightFace,
            0.0,
            -this._heightFace,
            this._widthFace,
            0.0,
            -this._heightFace,
            this._heightFace,
            0.0,
            this._heightFace,
            this._heightFace,
            0.0,
            this._heightFace,
            this._widthFace,
            0.0,
            this._heightFace,
            this._heightFace,
            0.0,
            this._heightFace,
            -this._heightFace,
            -0.0,
            this._widthFace,
            -this._heightFace,
            0.0,
            this._widthFace,
            this._heightFace,
            0.0,
            -this._heightFace,
            -this._heightFace,
            0.0,
            -this._heightFace,
            -this._widthFace,
            0.0,
            this._heightFace,
            -this._widthFace,
            0.0,
            this._heightFace,
            -this._heightFace,
            0.0,
        ];

        this._indices = [
            0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14,
            12, 14, 15,
        ];

        for (var i = 0.0; i <= 360; i += 1) {
            var j = (i * Math.PI) / 180;
            var vert1 = [
                0.1 * Math.sin(j) + this._xPos,
                0.1 * Math.cos(j) + this._yPos,
                0,
            ];
            var vert2 = [0, 0, 0];

            this._radiusPoints.push(
                0.1 * Math.sin(j) + this._xPos,
                0.1 * Math.cos(j) + this._yPos,
                0
            );
        }

        // console.log(this._radiusPoints);

        this._shader = new Shader(
            vCursorEditingShader,
            fCursorEditingShader,
            gl
        );

        this._shader.use();

        mat4.translate(
            this._worldMatrix,
            this._worldMatrix,
            vec3.fromValues(0.0, 0.0, 0.0)
        );
        mat4.lookAt(
            this._viewMatrix,
            vec3.fromValues(5.0, 5.0, 5.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0)
        );
        mat4.perspective(
            this._projectionMatrix,
            glMatrix.toRadian(40),
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            1.0,
            100.0
        );

        this._shader.setMat4("worldMatrix", this._worldMatrix);
        this._shader.setMat4("viewMatrix", this._viewMatrix);
        this._shader.setMat4("projectionMatrix", this._projectionMatrix);

        this._indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(this._indices),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

        this._positionBuffer = gl.createBuffer();
        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this._vertices),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    }

    Draw(gl, viewMatrix) {
        this._shader.use();

        var position = vec3.fromValues(this._xPos, this._yPos, 0.0);

        var newView = viewMatrix;
        newView[3] = 0.0;
        newView[7] = 0.0;
        newView[11] = -4.0;

        this._shader.setMat4("worldMatrix", this._worldMatrix);
        this._shader.setMat4("viewMatrix", newView);
        this._shader.setVec3(
            "position",
            position[0] + 0.5,
            position[1] + 0.5,
            0.0
        );

        var invertProjection = mat4.create();
        mat4.invert(invertProjection, this._projectionMatrix);
        var invertView = mat4.create();
        mat4.invert(invertView, newView);
        var invertWorld = mat4.create();
        mat4.invert(invertWorld, this._worldMatrix);

        vec3.transformMat4(position, position, invertProjection);
        vec3.transformMat4(position, position, invertView);
        vec3.transformMat4(position, position, invertWorld);
        mat4.translate(this._worldMatrix, this._worldMatrix, position);

        this._shader.setInt("radius", 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this._vertices),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.drawElements(gl.TRIANGLES, this._indices.length, gl.UNSIGNED_INT, 0);
    }

    ConvertViewMatrix(viewMatrix) {
        var xx = viewMatrix[0];
        var yx = viewMatrix[4];
        var zx = viewMatrix[8];

        var d = Math.sqrt(Math.pow(xx, 2) + Math.pow(yx, 2) + Math.pow(zx, 2));

        return mat4.fromValues(d, 0, 0, 0, 0, d, 0, 0, 0, 0, d, 0, 0, 0, -1, 1);
    }
}

export class TransformGizmo {
    _shader = null;

    _projectionMatrix = mat4.create();
    _viewMatrix = mat4.create();
    _worldMatrix = mat4.create();

    _xAxisMesh;
    _yAxisMesh;
    _zAxisMesh;

    _rColor = vec3.create();
    _gColor = vec3.create();
    _bColor = vec3.create();

    _axes = [];
    _yAxisWorldMatrix = mat4.create();
    _zAxisWorldMatrix = mat4.create();

    _activeAxis = null;

    wMatrix = mat4.create();

    newCenter = vec3.create();

    firstUpdate = false;

    newViewMatrix = mat4.create();

    offset = 0;

    position = vec3.fromValues(0.0, 1.0, 0.0);

    constructor(gl, position) {
        this._shader = new Shader(vTransformGizmo, fTransformGizmo, gl);
        this._shader.use();

        this._rColor = vec3.fromValues(1.0, 0.28, 0.24);
        this._gColor = vec3.fromValues(0.24, 1.0, 0.24);
        this._bColor = vec3.fromValues(0.24, 0.24, 1.0);

        this._rColorGreyedOut = vec3.fromValues(0.7, 0.5, 0.48);
        this._gColorGreyedOut = vec3.fromValues(0.5, 0.7, 0.48);
        this._bColorGreyedOut = vec3.fromValues(0.48, 0.5, 0.7);

        this._xAxisMesh = new MultiMesh(Primitives.createArrow(gl));
        this._yAxisMesh = new MultiMesh(Primitives.createArrow(gl));
        this._zAxisMesh = new MultiMesh(Primitives.createArrow(gl));

        this._xAxisMesh.init();
        this._xAxisMesh.setBuffers(gl);

        mat4.lookAt(
            this._viewMatrix,
            vec3.fromValues(5.0, 5.0, 5.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0)
        );
        mat4.perspective(
            this._projectionMatrix,
            glMatrix.toRadian(40),
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            0.0,
            200.0
        );

        mat4.translate(this._worldMatrix, this._worldMatrix, position);

        mat4.scale(this._worldMatrix, this._worldMatrix, [0.28, 0.28, 0.28]);

        this._shader.setMat4("worldMatrix", this._worldMatrix);

        this._xAxisMesh.worldMatrix = this._worldMatrix;

        this._yAxisMesh.init();
        this._yAxisMesh.setBuffers(gl);

        this._zAxisMesh.init();
        this._zAxisMesh.setBuffers(gl);

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xAxisMesh.getIndexBuffer()._buffer
        );
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(this._xAxisMesh.getTriangles()),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xAxisMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._xAxisMesh.getVertexBuffer()._buffer
        );
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this._xAxisMesh.getVertices()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        this._axes.push(this._xAxisMesh);
        this._axes.push(this._yAxisMesh);
        this._axes.push(this._zAxisMesh);

        mat4.translate(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            position
        );
        mat4.scale(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateZ(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            glMatrix.toRadian(90)
        );
        mat4.translate(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            [-1, 1, 0]
        );

        this._yAxisMesh.worldMatrix = this._yAxisWorldMatrix;

        mat4.translate(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            position
        );
        mat4.scale(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateX(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            glMatrix.toRadian(90)
        );
        mat4.translate(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            [0, 1, 1]
        );

        this._zAxisMesh.worldMatrix = this._zAxisWorldMatrix;
    }

    updateCenter(worldMatrix, centerUpdated, ui) {
        // this.position = vec3.fromValues(worldMatrix[12], worldMatrix[13], worldMatrix[14]);
        // var initPosition = vec3.fromValues(0.0, -1.0, 0.0);
        // if (ui.properties.updateGizmoPosition) {
        //     vec3.copy(this.newCenter, centerUpdated);
        //     // ui.properties.updateGizmoPosition = false;
        //     if (!this.firstUpdate)
        //         this.firstUpdate = true;
        // }
        // vec3.add(this.position, this.position, this.newCenter);
        // vec3.subtract(this.position, this.position, initPosition);
    }

    Draw(gl, viewMatrix, worldMatrix, projectionMatrix, cameraPosition, altPosition = null) {
        this._shader.use();

        var reverseFactor = vec3.create();

        vec3.subtract(
            reverseFactor,
            cameraPosition,
            vec3.fromValues(
                this.position[0],
                this.position[1],
                this.position[2]
            )
        );

        var kFactor = vec3.length(reverseFactor) / 12.0;

        var factor = kFactor * 1.0;

        if (!altPosition) {
            var pos = vec3.fromValues(
                worldMatrix[12],
                worldMatrix[13] + factor,
                worldMatrix[14]
            );
        } else {
            var pos = vec3.fromValues(altPosition[0] + worldMatrix[12], altPosition[1] + factor + worldMatrix[13], altPosition[2] + worldMatrix[14]);
        }

        var wMatrixX = mat4.create();
        mat4.translate(wMatrixX, wMatrixX, pos);
        mat4.scale(wMatrixX, wMatrixX, [kFactor, kFactor, kFactor]);

        this._xAxisMesh.worldMatrix = wMatrixX;

        this._shader.setMat4("viewMatrix", viewMatrix);
        this._shader.setMat4("worldMatrix", wMatrixX);
        this._shader.setMat4("projectionMatrix", projectionMatrix);

        if (this._activeAxis && this._activeAxis !== "y") {
            this._shader.setVec3(
                "color",
                this._gColorGreyedOut[0],
                this._gColorGreyedOut[1],
                this._gColorGreyedOut[2]
            );
        } else {
            this._shader.setVec3(
                "color",
                this._gColor[0],
                this._gColor[1],
                this._gColor[2]
            );
        }

        gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xAxisMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._xAxisMesh.getVertexBuffer()._buffer
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.drawElements(
            gl.TRIANGLES,
            this._xAxisMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );

        var wMatrixY = mat4.create();
        mat4.translate(wMatrixY, wMatrixY, pos);
        mat4.scale(wMatrixY, wMatrixY, [kFactor, kFactor, kFactor]);
        mat4.rotateZ(wMatrixY, wMatrixY, glMatrix.toRadian(90));
        mat4.translate(wMatrixY, wMatrixY, [-1, 1, 0]);

        this._yAxisMesh.worldMatrix = wMatrixY;

        this._shader.setMat4("worldMatrix", wMatrixY);

        if (this._activeAxis && this._activeAxis !== "x") {
            this._shader.setVec3(
                "color",
                this._rColorGreyedOut[0],
                this._rColorGreyedOut[1],
                this._rColorGreyedOut[2]
            );
        } else {
            this._shader.setVec3(
                "color",
                this._rColor[0],
                this._rColor[1],
                this._rColor[2]
            );
        }

        gl.drawElements(
            gl.TRIANGLES,
            this._xAxisMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );

        var wMatrixZ = mat4.create();
        mat4.translate(wMatrixZ, wMatrixZ, pos);
        mat4.scale(wMatrixZ, wMatrixZ, [kFactor, kFactor, kFactor]);
        mat4.rotateX(wMatrixZ, wMatrixZ, glMatrix.toRadian(90));
        mat4.translate(wMatrixZ, wMatrixZ, [0, 1, 1]);

        this._shader.setMat4("worldMatrix", wMatrixZ);

        this._zAxisMesh.worldMatrix = wMatrixZ;

        if (this._activeAxis && this._activeAxis !== "z") {
            this._shader.setVec3(
                "color",
                this._bColorGreyedOut[0],
                this._bColorGreyedOut[1],
                this._bColorGreyedOut[2]
            );
        } else {
            this._shader.setVec3(
                "color",
                this._bColor[0],
                this._bColor[1],
                this._bColor[2]
            );
        }

        gl.drawElements(
            gl.TRIANGLES,
            this._xAxisMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );
    }

    UpdatePosition(worldMatrix) {
        var position = vec3.fromValues(
            worldMatrix[12],
            worldMatrix[13],
            worldMatrix[14]
        );

        // mat4.translate(this._worldMatrix, this._worldMatrix, position);

        mat4.copy(this._worldMatrix, worldMatrix);
        mat4.scale(this._worldMatrix, this._worldMatrix, [0.28, 0.28, 0.28]);

        mat4.copy(this._yAxisWorldMatrix, worldMatrix);
        mat4.scale(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateZ(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            glMatrix.toRadian(90)
        );
        mat4.translate(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            [-1, 1, 0]
        );

        mat4.copy(this._zAxisWorldMatrix, worldMatrix);
        mat4.scale(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateX(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            glMatrix.toRadian(90)
        );
        mat4.translate(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            [0, 1, 1]
        );
    }

    GetAxisClicked(event, picking) {
        picking._mesh = this._yAxisMesh;

        for (var i = 0; i < this._axes.length; i++) {
            var axis = this._axes[i];
            picking._mesh = axis;

            if (
                picking.intersectionMouseMesh(
                    picking.canvas,
                    picking._camera,
                    axis,
                    event.clientX,
                    event.clientY,
                    axis.worldMatrix
                )
            ) {
                return i;
            }
        }
    }
}

export class RotationGizmo {
    _xRingMesh;
    _yRingMesh;
    _zRingMesh;
    _freeBall;

    _worldMatrix = mat4.create();
    _viewMatrix = mat4.create();
    _projectionMatrix = mat4.create();

    _yRingWorldMatrix = mat4.create();
    _zRingWorldMatrix = mat4.create();

    _rColor = vec3.create();
    _gColor = vec3.create();
    _bColor = vec3.create();

    _rings = [];

    _planeNormals = [
        vec3.fromValues(1, 0, 0),
        vec3.fromValues(0, 1, 0),
        vec3.fromValues(0, 0, 1),
    ];

    _activeRing = null;

    position = vec3.fromValues(0.0, 1.0, 0.0);

    newCenter = vec3.create();

    newViewMatrix = mat4.create();

    constructor(gl, position) {
        this._shader = new Shader(vTransformGizmo, fTransformGizmo, gl);
        this._shader.use();

        this._rColor = vec3.fromValues(0.95, 0.28, 0.24);
        this._gColor = vec3.fromValues(0.24, 0.95, 0.24);
        this._bColor = vec3.fromValues(0.24, 0.24, 0.95);

        this._rColorGreyedOut = vec3.fromValues(0.7, 0.5, 0.48);
        this._gColorGreyedOut = vec3.fromValues(0.5, 0.7, 0.48);
        this._bColorGreyedOut = vec3.fromValues(0.48, 0.5, 0.7);

        this._xRingMesh = new MultiMesh(Primitives.createTorus(gl));
        this._yRingMesh = new MultiMesh(Primitives.createTorus(gl));
        this._zRingMesh = new MultiMesh(Primitives.createTorus(gl));
        this._freeBall = new MultiMesh(Primitives.createCube(gl));

        this._xRingMesh.init();
        this._xRingMesh.setBuffers(gl);

        mat4.lookAt(
            this._viewMatrix,
            vec3.fromValues(5.0, 5.0, 5.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0)
        );
        mat4.perspective(
            this._projectionMatrix,
            glMatrix.toRadian(40),
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            0.0,
            200.0
        );

        mat4.translate(this._worldMatrix, this._worldMatrix, position);

        mat4.scale(this._worldMatrix, this._worldMatrix, [0.28, 0.28, 0.28]);

        this._shader.setMat4("worldMatrix", this._worldMatrix);

        this._xRingMesh.worldMatrix = this._worldMatrix;

        this._yRingMesh.init();
        this._yRingMesh.setBuffers(gl);

        this._zRingMesh.init();
        this._zRingMesh.setBuffers(gl);

        this._freeBall.init();

        subdivideClamp(this._freeBall, false, 40000);

        this._freeBall.setBuffers(gl);

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xRingMesh.getIndexBuffer()._buffer
        );
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(this._xRingMesh.getTriangles()),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xRingMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._xRingMesh.getVertexBuffer()._buffer
        );
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this._xRingMesh.getVertices()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        this._rings.push(this._xRingMesh);
        this._rings.push(this._yRingMesh);
        this._rings.push(this._zRingMesh);

        // this._yAxisWorldMatrix = mat4.create();
        mat4.translate(
            this._yRingWorldMatrix,
            this._yRingWorldMatrix,
            position
        );
        mat4.scale(
            this._yRingWorldMatrix,
            this._yRingWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateZ(
            this._yRingWorldMatrix,
            this._yRingWorldMatrix,
            glMatrix.toRadian(90)
        );

        this._yRingMesh.worldMatrix = this._yRingWorldMatrix;

        mat4.translate(
            this._zRingWorldMatrix,
            this._zRingWorldMatrix,
            position
        );
        mat4.scale(
            this._zRingWorldMatrix,
            this._zRingWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateX(
            this._zRingWorldMatrix,
            this._zRingWorldMatrix,
            glMatrix.toRadian(90)
        );

        this._zRingMesh.worldMatrix = this._zRingWorldMatrix;

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._freeBall.getIndexBuffer()._buffer
        );
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(this._freeBall.getTriangles()),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._freeBall.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._freeBall.getVertexBuffer()._buffer
        );
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this._freeBall.getVertices()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    }

    updateCenter(worldMatrix, centerUpdated, ui) {
        // this.position = vec3.fromValues(worldMatrix[12], worldMatrix[13], worldMatrix[14]);
        // var initPosition = vec3.fromValues(0.0, 1.0, 0.0);
        // if (ui.properties.updateGizmoPosition) {
        //     vec3.copy(this.newCenter, centerUpdated);
        //     // ui.properties.updateGizmoPosition = false;
        //     if (!this.firstUpdate)
        //         this.firstUpdate = true;
        // }
        // vec3.add(this.position, this.position, this.newCenter);
        // vec3.subtract(this.position, this.position, initPosition);
    }

    Draw(gl, viewMatrix, worldMatrix, projectionMatrix, cameraPosition) {
        this._shader.use();

        this._shader.setInt("isBall", 0);

        var reverseFactor = vec3.create();

        vec3.subtract(
            reverseFactor,
            cameraPosition,
            vec3.fromValues(
                this.position[0],
                this.position[1],
                this.position[2]
            )
        );

        var kFactor = vec3.length(reverseFactor) / 10.0;
        var kFactor2 = vec3.length(reverseFactor) / 7.0;

        var factor = kFactor * 1.0;

        var pos = vec3.fromValues(
            worldMatrix[12],
            worldMatrix[13],
            worldMatrix[14]
        );

        var newViewMatrix = mat4.create();
        mat4.copy(newViewMatrix, viewMatrix);
        newViewMatrix[14] = -3.0;

        this.newViewMatrix = newViewMatrix;

        this._shader.setMat4("viewMatrix", viewMatrix);
        this._shader.setMat4("projectionMatrix", projectionMatrix);

        var wMatrix = mat4.create();
        mat4.translate(wMatrix, wMatrix, pos);
        mat4.scale(wMatrix, wMatrix, [kFactor, kFactor, kFactor]);

        this._xRingMesh.worldMatrix = wMatrix;

        this._shader.setMat4("worldMatrix", wMatrix);

        if (this._activeRing && this._activeRing[1] !== 1) {
            this._shader.setVec3(
                "color",
                this._gColorGreyedOut[0],
                this._gColorGreyedOut[1],
                this._gColorGreyedOut[2]
            );
        } else {
            this._shader.setVec3(
                "color",
                this._gColor[0],
                this._gColor[1],
                this._gColor[2]
            );
        }

        gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xRingMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._xRingMesh.getVertexBuffer()._buffer
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.drawElements(
            gl.TRIANGLES,
            this._xRingMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );

        var wMatrixY = mat4.create();
        mat4.translate(wMatrixY, wMatrixY, pos);
        mat4.scale(wMatrixY, wMatrixY, [kFactor, kFactor, kFactor]);
        mat4.rotateZ(wMatrixY, wMatrixY, glMatrix.toRadian(90));

        this._yRingMesh.worldMatrix = wMatrixY;

        this._shader.setMat4("worldMatrix", wMatrixY);

        if (this._activeRing && this._activeRing[0] !== 1) {
            this._shader.setVec3(
                "color",
                this._rColorGreyedOut[0],
                this._rColorGreyedOut[1],
                this._rColorGreyedOut[2]
            );
        } else {
            this._shader.setVec3(
                "color",
                this._rColor[0],
                this._rColor[1],
                this._rColor[2]
            );
        }

        gl.drawElements(
            gl.TRIANGLES,
            this._xRingMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );

        var wMatrixZ = mat4.create();
        mat4.translate(wMatrixZ, wMatrixZ, pos);
        mat4.scale(wMatrixZ, wMatrixZ, [kFactor, kFactor, kFactor]);
        mat4.rotateX(wMatrixZ, wMatrixZ, glMatrix.toRadian(90));

        this._shader.setMat4("worldMatrix", wMatrixZ);

        this._zRingMesh.worldMatrix = wMatrixZ;

        if (this._activeRing && this._activeRing[2] !== 1) {
            this._shader.setVec3(
                "color",
                this._bColorGreyedOut[0],
                this._bColorGreyedOut[1],
                this._bColorGreyedOut[2]
            );
        } else {
            this._shader.setVec3(
                "color",
                this._bColor[0],
                this._bColor[1],
                this._bColor[2]
            );
        }

        gl.drawElements(
            gl.TRIANGLES,
            this._xRingMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );

        // mat4.scale(wMatrix, wMatrix, [kFactor2, kFactor2, kFactor2]);

        // this._shader.setMat4("worldMatrix", wMatrix);

        // this._shader.setVec3("color", 1.0, 1.0, 1.0);
        // this._shader.setInt("isBall", 1);

        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._freeBall.getIndexBuffer()._buffer);

        // gl.enableVertexAttribArray(0);
        // gl.bindBuffer(gl.ARRAY_BUFFER, this._freeBall.getVertexBuffer()._buffer);
        // gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // gl.drawElements(gl.TRIANGLES, this._freeBall.getTriangles().length, gl.UNSIGNED_INT, 0);
    }

    UpdatePosition(worldMatrix) {
        mat4.copy(this._worldMatrix, worldMatrix);
        mat4.scale(this._worldMatrix, this._worldMatrix, [0.28, 0.28, 0.28]);

        mat4.copy(this._yRingWorldMatrix, worldMatrix);
        mat4.scale(
            this._yRingWorldMatrix,
            this._yRingWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateZ(
            this._yRingWorldMatrix,
            this._yRingWorldMatrix,
            glMatrix.toRadian(90)
        );

        mat4.copy(this._zRingWorldMatrix, worldMatrix);
        mat4.scale(
            this._zRingWorldMatrix,
            this._zRingWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateX(
            this._zRingWorldMatrix,
            this._zRingWorldMatrix,
            glMatrix.toRadian(90)
        );
    }

    GetRingClicked(event, picking) {
        for (var i = 0; i < this._rings.length; i++) {
            var ring = this._rings[i];
            picking._mesh = ring;

            if (
                picking.intersectionMouseMesh(
                    picking.canvas,
                    picking._camera,
                    ring,
                    event.clientX,
                    event.clientY,
                    ring.worldMatrix,
                    this.newViewMatrix
                )
            ) {
                return this._planeNormals[i];
            }
        }
    }
}

export class ScaleGizmo {
    _shader = null;

    _projectionMatrix = mat4.create();
    _viewMatrix = mat4.create();
    _worldMatrix = mat4.create();

    _xAxisMesh;
    _yAxisMesh;
    _zAxisMesh;

    _rColor = vec3.create();
    _gColor = vec3.create();
    _bColor = vec3.create();

    _axes = [];
    _yAxisWorldMatrix = mat4.create();
    _zAxisWorldMatrix = mat4.create();

    _activeAxis = null;

    position = vec3.fromValues(0.0, 1.0, 0.0);

    newCenter = vec3.create();

    newViewMatrix = mat4.create();

    constructor(gl) {
        this._shader = new Shader(vTransformGizmo, fTransformGizmo, gl);
        this._rColor = vec3.fromValues(0.95, 0.24, 0.24);
        this._gColor = vec3.fromValues(0.24, 0.95, 0.24);
        this._bColor = vec3.fromValues(0.24, 0.24, 0.95);
    }

    Create(gl, position) {
        this._shader = new Shader(vTransformGizmo, fTransformGizmo, gl);
        this._shader.use();

        this._rColor = vec3.fromValues(1.0, 0.28, 0.24);
        this._gColor = vec3.fromValues(0.24, 1.0, 0.24);
        this._bColor = vec3.fromValues(0.24, 0.24, 1.0);

        this._rColorGreyedOut = vec3.fromValues(0.7, 0.5, 0.48);
        this._gColorGreyedOut = vec3.fromValues(0.5, 0.7, 0.48);
        this._bColorGreyedOut = vec3.fromValues(0.48, 0.5, 0.7);

        this._xAxisMesh = new MultiMesh(Primitives.createCubeArrow(gl));
        this._yAxisMesh = new MultiMesh(Primitives.createCubeArrow(gl));
        this._zAxisMesh = new MultiMesh(Primitives.createCubeArrow(gl));

        this._xAxisMesh.init();
        this._xAxisMesh.setBuffers(gl);

        mat4.lookAt(
            this._viewMatrix,
            vec3.fromValues(5.0, 5.0, 5.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0)
        );
        mat4.perspective(
            this._projectionMatrix,
            glMatrix.toRadian(40),
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            0.0,
            200.0
        );

        mat4.translate(this._worldMatrix, this._worldMatrix, position);

        mat4.scale(this._worldMatrix, this._worldMatrix, [0.28, 0.28, 0.28]);

        this._shader.setMat4("worldMatrix", this._worldMatrix);

        this._xAxisMesh.worldMatrix = this._worldMatrix;

        this._yAxisMesh.init();
        this._yAxisMesh.setBuffers(gl);

        this._zAxisMesh.init();
        this._zAxisMesh.setBuffers(gl);

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xAxisMesh.getIndexBuffer()._buffer
        );
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(this._xAxisMesh.getTriangles()),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xAxisMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._xAxisMesh.getVertexBuffer()._buffer
        );
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this._xAxisMesh.getVertices()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        this._axes.push(this._xAxisMesh);
        this._axes.push(this._yAxisMesh);
        this._axes.push(this._zAxisMesh);

        mat4.translate(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            position
        );
        mat4.scale(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateZ(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            glMatrix.toRadian(90)
        );
        mat4.translate(
            this._yAxisWorldMatrix,
            this._yAxisWorldMatrix,
            [-1, 1, 0]
        );

        this._yAxisMesh.worldMatrix = this._yAxisWorldMatrix;

        mat4.translate(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            position
        );
        mat4.scale(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateX(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            glMatrix.toRadian(90)
        );
        mat4.translate(
            this._zAxisWorldMatrix,
            this._zAxisWorldMatrix,
            [0, 1, 1]
        );

        this._zAxisMesh.worldMatrix = this._zAxisWorldMatrix;
    }

    SetBuffers(gl) {
        this._shader.use();

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xAxisMesh.getIndexBuffer()._buffer
        );
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(this._xAxisMesh.getTriangles()),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xAxisMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._xAxisMesh.getVertexBuffer()._buffer
        );
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this._xAxisMesh.getVertices()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    }

    updateCenter(worldMatrix, centerUpdated, ui) {
        // this.position = vec3.fromValues(worldMatrix[12], worldMatrix[13], worldMatrix[14]);
        // var initPosition = vec3.fromValues(0.0, 1.0, 0.0);
        // if (ui.properties.updateGizmoPosition) {
        //     vec3.copy(this.newCenter, centerUpdated);
        //     // ui.properties.updateGizmoPosition = false;
        //     if (!this.firstUpdate)
        //         this.firstUpdate = true;
        // }
        // vec3.add(this.position, this.position, this.newCenter);
        // vec3.subtract(this.position, this.position, initPosition);
    }

    Draw(gl, viewMatrix, worldMatrix, projectionMatrix, cameraPosition) {
        this._shader.use();

        var reverseFactor = vec3.create();

        vec3.subtract(
            reverseFactor,
            cameraPosition,
            vec3.fromValues(
                this.position[0],
                this.position[1],
                this.position[2]
            )
        );

        var kFactor = vec3.length(reverseFactor) / 12.0;

        var factor = kFactor * 1.0;

        var pos = vec3.fromValues(
            worldMatrix[12],
            worldMatrix[13] + factor,
            worldMatrix[14]
        );

        var newViewMatrix = mat4.create();
        mat4.copy(newViewMatrix, viewMatrix);
        newViewMatrix[14] = -3.0;

        this.newViewMatrix = newViewMatrix;

        var wMatrix = mat4.create();
        mat4.translate(wMatrix, wMatrix, pos);
        mat4.scale(wMatrix, wMatrix, [kFactor, kFactor, kFactor]);

        this._xAxisMesh.worldMatrix = wMatrix;

        this._shader.setMat4("viewMatrix", viewMatrix);
        this._shader.setMat4("worldMatrix", wMatrix);
        this._shader.setMat4("projectionMatrix", projectionMatrix);

        if (this._activeAxis && this._activeAxis !== "y") {
            this._shader.setVec3(
                "color",
                this._gColorGreyedOut[0],
                this._gColorGreyedOut[1],
                this._gColorGreyedOut[2]
            );
        } else {
            this._shader.setVec3(
                "color",
                this._gColor[0],
                this._gColor[1],
                this._gColor[2]
            );
        }

        gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._xAxisMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._xAxisMesh.getVertexBuffer()._buffer
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.drawElements(
            gl.TRIANGLES,
            this._xAxisMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );

        var wMatrixY = mat4.create();
        mat4.translate(wMatrixY, wMatrixY, pos);
        mat4.scale(wMatrixY, wMatrixY, [kFactor, kFactor, kFactor]);
        mat4.rotateZ(wMatrixY, wMatrixY, glMatrix.toRadian(90));
        mat4.translate(wMatrixY, wMatrixY, [-1, 1, 0]);

        this._yAxisMesh.worldMatrix = wMatrixY;

        this._shader.setMat4("worldMatrix", wMatrixY);

        if (this._activeAxis && this._activeAxis !== "x") {
            this._shader.setVec3(
                "color",
                this._rColorGreyedOut[0],
                this._rColorGreyedOut[1],
                this._rColorGreyedOut[2]
            );
        } else {
            this._shader.setVec3(
                "color",
                this._rColor[0],
                this._rColor[1],
                this._rColor[2]
            );
        }

        gl.drawElements(
            gl.TRIANGLES,
            this._xAxisMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );

        var wMatrixZ = mat4.create();
        mat4.translate(wMatrixZ, wMatrixZ, pos);
        mat4.scale(wMatrixZ, wMatrixZ, [kFactor, kFactor, kFactor]);
        mat4.rotateX(wMatrixZ, wMatrixZ, glMatrix.toRadian(90));
        mat4.translate(wMatrixZ, wMatrixZ, [0, 1, 1]);

        this._shader.setMat4("worldMatrix", wMatrixZ);

        this._zAxisMesh.worldMatrix = wMatrixZ;

        if (this._activeAxis && this._activeAxis !== "z") {
            this._shader.setVec3(
                "color",
                this._bColorGreyedOut[0],
                this._bColorGreyedOut[1],
                this._bColorGreyedOut[2]
            );
        } else {
            this._shader.setVec3(
                "color",
                this._bColor[0],
                this._bColor[1],
                this._bColor[2]
            );
        }

        gl.drawElements(
            gl.TRIANGLES,
            this._xAxisMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );
    }

    GetAxisClicked(event, picking) {
        picking._mesh = this._yAxisMesh;

        for (var i = 0; i < this._axes.length; i++) {
            var axis = this._axes[i];
            picking._mesh = axis;

            if (
                picking.intersectionMouseMesh(
                    picking.canvas,
                    picking._camera,
                    axis,
                    event.clientX,
                    event.clientY,
                    axis.worldMatrix
                )
            ) {
                return i;
            }
        }
    }
}

export class ExtrudeGizmo {
    _axisMesh;

    _worldMatrix = mat4.create();
    _viewMatrix = mat4.create();
    _projectionMatrix = mat4.create();

    _yColor = vec3.create();

    position = vec3.fromValues(0.0, 1.0, 0.0);

    arrowPosition = vec3.create();

    constructor(gl, position) {
        this._shader = new Shader(vTransformGizmo, fTransformGizmo, gl);
        this._shader.use();

        this._yColor = vec3.fromValues(0.95, 0.95, 0.24);

        this._axisMesh = new MultiMesh(Primitives.createArrow(gl));

        this._axisMesh.init();
        this._axisMesh.setBuffers(gl);

        mat4.lookAt(
            this._viewMatrix,
            vec3.fromValues(5.0, 5.0, 5.0),
            vec3.fromValues(0.0, 0.0, 0.0),
            vec3.fromValues(0.0, 1.0, 0.0)
        );
        mat4.perspective(
            this._projectionMatrix,
            glMatrix.toRadian(40),
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            0.0,
            200.0
        );

        mat4.translate(this._worldMatrix, this._worldMatrix, position);

        mat4.scale(this._worldMatrix, this._worldMatrix, [0.28, 0.28, 0.28]);

        this._shader.setMat4("worldMatrix", this._worldMatrix);

        this._axisMesh.worldMatrix = this._worldMatrix;

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._axisMesh.getIndexBuffer()._buffer
        );
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(this._axisMesh.getTriangles()),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._axisMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._axisMesh.getVertexBuffer()._buffer
        );
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this._axisMesh.getVertices()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    }

    Draw(
        gl,
        viewMatrix,
        worldMatrix,
        projectionMatrix,
        cameraPosition,
        facesNormal,
        averagePos,
        selectedEntityPosition
    ) {
        this._shader.use();

        var reverseFactor = vec3.create();

        vec3.subtract(
            reverseFactor,
            cameraPosition,
            vec3.fromValues(
                this.position[0],
                this.position[1],
                this.position[2]
            )
        );

        var kFactor = vec3.length(reverseFactor) / 10.0;

        var factor = kFactor * 1.0;

        selectedEntityPosition[1] -= worldMatrix[13];

        vec3.add(averagePos, averagePos, selectedEntityPosition);

        // mat4.translate(worldMatrix, worldMatrix, averagePos);

        this.arrowPosition = averagePos;

        // // console.log(facesNormal);

        var pos = vec3.fromValues(
            worldMatrix[12],
            worldMatrix[13] + factor,
            worldMatrix[14]
        );

        this._shader.setMat4("viewMatrix", viewMatrix);
        this._shader.setMat4("projectionMatrix", projectionMatrix);

        var wMatrix = mat4.create();
        mat4.translate(wMatrix, wMatrix, vec3.fromValues(0.0, 1.0, 0.0));
        mat4.translate(
            worldMatrix,
            worldMatrix,
            vec3.fromValues(averagePos[0], averagePos[1], averagePos[2])
        );
        mat4.scale(worldMatrix, worldMatrix, [kFactor, kFactor, kFactor]);

        vec3.normalize(facesNormal, facesNormal);

        var upVector = vec3.fromValues(0.0, 1.0, 0.0);
        var anotherVector = vec3.create();

        var angle = 0;

        vec3.cross(upVector, upVector, facesNormal);

        var upVect = vec3.length(upVector);

        angle = Math.asin(upVect);

        // // console.log(facesNormal);

        if (facesNormal[1] < 0) {
            vec3.negate(upVector, upVector);

            var upVect = vec3.length(upVector);

            angle = Math.asin(upVect);

            angle += glMatrix.toRadian(180);
        }

        mat4.rotate(worldMatrix, worldMatrix, angle, upVector);

        this._axisMesh.worldMatrix = worldMatrix;

        this._shader.setMat4("worldMatrix", worldMatrix);

        this._shader.setVec3(
            "color",
            this._yColor[0],
            this._yColor[1],
            this._yColor[2]
        );

        gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            this._axisMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(
            gl.ARRAY_BUFFER,
            this._axisMesh.getVertexBuffer()._buffer
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.drawElements(
            gl.TRIANGLES,
            this._axisMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );
    }

    intersection(event, picking) {
        return picking.intersectionMouseMesh(
            picking.canvas,
            picking._camera,
            this._axisMesh,
            event.clientX,
            event.clientY,
            this._axisMesh.worldMatrix,
            null,
            true
        );
    }

    UpdatePosition(worldMatrix) {
        mat4.copy(this._worldMatrix, worldMatrix);
        mat4.scale(this._worldMatrix, this._worldMatrix, [0.28, 0.28, 0.28]);

        mat4.copy(this._yRingWorldMatrix, worldMatrix);
        mat4.scale(
            this._yRingWorldMatrix,
            this._yRingWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateZ(
            this._yRingWorldMatrix,
            this._yRingWorldMatrix,
            glMatrix.toRadian(90)
        );

        mat4.copy(this._zRingWorldMatrix, worldMatrix);
        mat4.scale(
            this._zRingWorldMatrix,
            this._zRingWorldMatrix,
            [0.28, 0.28, 0.28]
        );
        mat4.rotateX(
            this._zRingWorldMatrix,
            this._zRingWorldMatrix,
            glMatrix.toRadian(90)
        );
    }

    GetRingClicked(event, picking) {
        for (var i = 0; i < this._rings.length; i++) {
            var ring = this._rings[i];
            picking._mesh = ring;

            if (
                picking.intersectionMouseMesh(
                    picking.canvas,
                    picking._camera,
                    ring,
                    event.clientX,
                    event.clientY,
                    ring.worldMatrix,
                    this.newViewMatrix
                )
            ) {
                return this._planeNormals[i];
            }
        }
    }
}

function subdivideClamp(mesh, linear, steps) {
    Subdivision.LINEAR = !!linear;
    // mesh.addLevel();
    while (mesh.getNbFaces() < steps) mesh.addLevel();
    // keep at max 4 multires
    mesh._meshes.splice(0, Math.min(mesh._meshes.length - 4, 4));
    mesh._sel = mesh._meshes.length - 1;
    Subdivision.LINEAR = false;
}
