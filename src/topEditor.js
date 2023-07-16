import { TopHighlight } from "./topHighlight.js";
import { TopPick } from "./topPicking.js";
import { vec3, mat4, mat3, vec4, quat, glMatrix } from "gl-matrix";
import { GLU } from "./GLU.js";
import Primitives, { createMesh } from "./test/primitives.js";
import MultiMesh from "./test/multimesh.js";

export class TopEditor {
    _topHighlight = null;
    _topologyPick = null;
    _picking = null;
    _modes = ["Vertices", "Faces", "Edges"];
    _mode = -1;
    _selectionMode = 0;
    _factor = 50000;

    _selecting = false;
    _keepSelected = false;
    _modifying = false;

    _lastMouseX = 0;
    _lastMouseY = 0;
    _mouseX = 0;
    _mouseY = 0;

    _XZnormal = vec3.fromValues(0, 1, 0);
    _XYnormal = vec3.fromValues(0, 0, 1);
    _YZnormal = vec3.fromValues(1, 0, 0);

    _extrudeData;

    _extruding = false;

    _rotating = false;

    _selectedRotationPlane = this._XZnormal;

    _selectedTranslateAxis = "";

    _usingTransformGizmo = false;

    _selectedScaleAxis = "";

    _usingScaleGizmo = false;

    angle = 0;

    quatRotation = quat.create();

    scaleObject = vec3.create();

    pruebaY = quat.create();
    pruebaZ = quat.create();

    tempMatrix = mat4.create();
    tempMatrix2 = mat4.create();

    modelPosition = vec3.create();

    faceShader = null;

    fixedXValue = 0;

    intersectedMesh = null;

    updateScalingRotation = false;

    first = false;

    startedRotation = false;

    newExtrudedMesh = null;

    updateExtrudedMesh = false;

    undoStack = [];
    undoStackMatrices = [];

    meshModified = false;

    ctrl = false;

    constructor(picking) {
        this._picking = picking;
        this._topHighlight = new TopHighlight();
        this._topologyPick = new TopPick(this._picking);
    }

    Instantiate(
        gl,
        mesh,
        rotationGizmo,
        modelPosition,
        faceShader,
        transformGizmo = null,
        scaleGizmo = null,
        ui = null,
        extrudeGizmo = null,
        center = null
    ) {
        this.modelPosition = modelPosition;

        if (ui.properties.selectedEntity) mat4.getScaling(this.scaleObject, ui.properties.selectedEntity.worldMatrix);

        // this._picking._mesh = mesh.topMesh;

        this._picking._camera = ui.properties.scene.activeCam;

        window.addEventListener("mousemove", (event) => {
            // if (mesh.topMeshes[0]) center = mesh.topMeshes[0].getCenter();

            // if (
            //     event.button === 0 &&
            //     this._selectionMode === 0 &&
            //     this._mode === -1
            // ) {

            //     // console.log("A");
            // }

            this._picking._camera = ui.properties.scene.activeCam;

            if (ui.properties.selectedMeshFromEntity) {
                this._picking._mesh = ui.properties.selectedMeshFromEntity;
                // mesh = ui.properties.selectedMeshFromEntity;

                center = this._picking._mesh.getCenter();
            }

            // mesh = ui.properties.selectedEntity;

            // // console.log(rotationGizmo.GetRingClicked(event, this._picking));

            // // console.log(center);

            // this._picking._camera = ui.properties.scene.editorCamera;

            if (mesh && ui.properties.selectedEntity) {
                if (event.button === 0) {
                    this._picking.intersectionMouseMesh(
                        this._picking.canvas,
                        this._picking._camera,
                        this._picking._mesh,
                        event.clientX,
                        event.clientY,
                        ui.properties.selectedEntity.worldMatrix
                    );
                }

                // this._topologyPick.PickVertices();

                var facingPlane = this.GetCoordinatePlaneFacing(
                    this._picking._camera.viewMatrix
                );

                var dist = 0.0;
                var distExtrude = 0.0;

                if (facingPlane === this._XZnormal) dist = modelPosition[1];
                if (facingPlane === this._XYnormal) dist = modelPosition[2];
                if (facingPlane === this._YZnormal) dist = modelPosition[0];

                if (facingPlane === this._XZnormal)
                    distExtrude = extrudeGizmo.arrowPosition[1];
                if (facingPlane === this._XYnormal)
                    distExtrude = extrudeGizmo.arrowPosition[2];
                if (facingPlane === this._YZnormal)
                    distExtrude = extrudeGizmo.arrowPosition[0];

                var lastPositionToMove = this.RayCast(
                    this._picking.canvas,
                    this._picking._camera,
                    this._lastMouseX,
                    this._lastMouseY,
                    facingPlane,
                    dist,
                    ui.properties.selectedEntity.worldMatrix
                );
                var lastPositionForTranslationGizmo =
                    this.RayCastForTranslationGizmo(
                        this._picking.canvas,
                        this._picking._camera,
                        this._lastMouseX,
                        this._lastMouseY,
                        facingPlane,
                        dist,
                        ui.properties.selectedEntity.worldMatrix
                    );

                var lastPositionForExtrudeGizmo = this.RayCast(
                    this._picking.canvas,
                    this._picking._camera,
                    this._lastMouseX,
                    this._lastMouseY,
                    facingPlane,
                    distExtrude,
                    ui.properties.selectedEntity.worldMatrix
                );

                if (this._mode === 4) {
                    if (this._selectedRotationPlane === this._XZnormal) {
                        lastPositionToMove = this.RayCast(
                            this._picking.canvas,
                            this._picking._camera,
                            this._lastMouseX,
                            this._lastMouseY,
                            this._selectedRotationPlane,
                            modelPosition[1]
                        );

                        lastPositionToMove[0] -= modelPosition[0];
                        lastPositionToMove[2] -= modelPosition[2];
                    } else if (this._selectedRotationPlane === this._XYnormal) {
                        lastPositionToMove = this.RayCast(
                            this._picking.canvas,
                            this._picking._camera,
                            this._lastMouseX,
                            this._lastMouseY,
                            this._selectedRotationPlane,
                            modelPosition[2]
                        );

                        lastPositionToMove[0] -= modelPosition[0];
                        lastPositionToMove[1] -= modelPosition[1];
                    } else if (this._selectedRotationPlane === this._YZnormal) {
                        lastPositionToMove = this.RayCast(
                            this._picking.canvas,
                            this._picking._camera,
                            this._lastMouseX,
                            this._lastMouseY,
                            this._selectedRotationPlane,
                            modelPosition[0]
                        );

                        lastPositionToMove[1] -= modelPosition[1];
                        lastPositionToMove[2] -= modelPosition[2];
                    }
                }

                var lastAngle = this.GetAngleFromPlanePosition(
                    lastPositionToMove,
                    this._selectedRotationPlane
                );

                this._lastMouseX = event.clientX;
                this._lastMouseY = event.clientY;

                this._mouseX = event.clientX;
                this._mouseY = event.clientY;

                var newPositionToMove = this.RayCast(
                    this._picking.canvas,
                    this._picking._camera,
                    event.clientX,
                    event.clientY,
                    facingPlane,
                    dist,
                    ui.properties.selectedEntity.worldMatrix
                );

                var newPositionForTranslationGizmo =
                    this.RayCastForTranslationGizmo(
                        this._picking.canvas,
                        this._picking._camera,
                        event.clientX,
                        event.clientY,
                        facingPlane,
                        dist,
                        ui.properties.selectedEntity.worldMatrix
                    );

                var newPositionForExtrudeGizmo = this.RayCast(
                    this._picking.canvas,
                    this._picking._camera,
                    this._lastMouseX,
                    this._lastMouseY,
                    facingPlane,
                    distExtrude,
                    ui.properties.selectedEntity.worldMatrix
                );

                if (this._mode === 4 && this._selectedRotationPlane) {
                    if (this.startedRotation) {
                        this.startedRotation = false;
                    }

                    if (this._selectedRotationPlane === this._XZnormal) {
                        newPositionToMove = this.RayCast(
                            this._picking.canvas,
                            this._picking._camera,
                            event.clientX,
                            event.clientY,
                            this._selectedRotationPlane,
                            modelPosition[1]
                        );

                        newPositionToMove[0] -= modelPosition[0];
                        newPositionToMove[2] -= modelPosition[2];
                    } else if (this._selectedRotationPlane === this._XYnormal) {
                        newPositionToMove = this.RayCast(
                            this._picking.canvas,
                            this._picking._camera,
                            event.clientX,
                            event.clientY,
                            this._selectedRotationPlane,
                            modelPosition[2]
                        );
                        newPositionToMove[0] -= modelPosition[0];
                        newPositionToMove[1] -= modelPosition[1];
                    } else if (this._selectedRotationPlane === this._YZnormal) {
                        newPositionToMove = this.RayCast(
                            this._picking.canvas,
                            this._picking._camera,
                            event.clientX,
                            event.clientY,
                            this._selectedRotationPlane,
                            modelPosition[0]
                        );

                        newPositionToMove[1] -= modelPosition[1];
                        newPositionToMove[2] -= modelPosition[2];
                    }

                    var newAngle = this.GetAngleFromPlanePosition(
                        newPositionToMove,
                        this._selectedRotationPlane
                    );

                    var moveAngleAmount = newAngle - lastAngle;

                    var scalingFactor = vec3.create();

                    mat4.getScaling(scalingFactor, ui.properties.selectedEntity.worldMatrix);

                    decompose(
                        ui.properties.selectedEntity.worldMatrix,
                        vec3.create(),
                        this.quatRotation,
                        vec3.create()
                    );

                    if (this._rotating) {
                        var tempMatrix2 = mat4.create();

                        var translation = vec3.create();
                        var rotation = vec4.create();
                        var scale = vec3.create();

                        if (this._selectionMode === 5) {
                            this.tempMatrix =
                            ui.properties.selectedEntity.worldMatrix;
                        }
                        

                        decompose(
                            ui.properties.selectedEntity.worldMatrix,
                            translation,
                            rotation,
                            scale
                        );

                        // mat4.fromQuat(this.tempMatrix2, rotation);

                        modelPosition = translation;

                        // mat4.scale(this.tempMatrix, this.tempMatrix, scalingFactor);

                        if (this._selectedRotationPlane === this._XZnormal) {
                            this.angle += -moveAngleAmount;

                            quat.fromEuler(
                                this.quatRotation,
                                0,
                                -moveAngleAmount,
                                0
                            );

                            // quat.multiply(this.pruebaY, this.pruebaZ, this.pruebaY);

                            mat4.fromRotationTranslation(
                                tempMatrix2,
                                this.quatRotation,
                                modelPosition
                            );

                            mat4.multiply(
                                this.tempMatrix,
                                tempMatrix2,
                                this.tempMatrix
                            );

                            // mat4.scale(this.tempMatrix, this.tempMatrix, vec3.fromValues(this.fixedXValue ? this.fixedXValue : this.scaleObject[0], this.scaleObject[1], this.scaleObject[2]));
                        } else if (
                            this._selectedRotationPlane === this._XYnormal
                        ) {
                            this.angle += moveAngleAmount;

                            quat.fromEuler(
                                this.quatRotation,
                                0,
                                0,
                                moveAngleAmount
                            );

                            mat4.fromRotationTranslation(
                                tempMatrix2,
                                this.quatRotation,
                                modelPosition
                            );

                            mat4.multiply(
                                this.tempMatrix,
                                tempMatrix2,
                                this.tempMatrix
                            );

                            // mat4.scale(this.tempMatrix, this.tempMatrix, vec3.fromValues(this.fixedXValue ? this.fixedXValue : this.scaleObject[0], this.scaleObject[1], this.scaleObject[2]));
                        } else if (
                            this._selectedRotationPlane === this._YZnormal
                        ) {
                            this.angle += -moveAngleAmount;

                            quat.fromEuler(
                                this.quatRotation,
                                -moveAngleAmount,
                                0,
                                0
                            );

                            mat4.fromRotationTranslation(
                                tempMatrix2,
                                this.quatRotation,
                                modelPosition
                            );

                            mat4.multiply(
                                this.tempMatrix,
                                tempMatrix2,
                                this.tempMatrix
                            );

                            // mat4.scale(this.tempMatrix, this.tempMatrix, vec3.fromValues(this.fixedXValue ? this.fixedXValue : this.scaleObject[0], this.scaleObject[1], this.scaleObject[2]));
                        }

                        this.tempMatrix[12] = modelPosition[0];
                        this.tempMatrix[13] = modelPosition[1];
                        this.tempMatrix[14] = modelPosition[2];

                        // if (this._selectionMode === 1) {
                        //     var pickedFaces = this._topologyPick.GetPickedFaces();
                        //     var vAr = mesh.topMeshes[0].getVertices();

                        //     for (var i = 0; i < pickedFaces.length; i++) {
                        //         var face = pickedFaces[i];
                        //         var verticesInFace = mesh.topMeshes[0].getVerticesFromFaces([face]);

                        //         for (var j = 0; j < verticesInFace.length; j++) {
                        //             var vertex = verticesInFace[j];
                        //             var tempVert = [vAr[vertex * 3 + 0], vAr[vertex * 3 + 1], vAr[vertex * 3 + 2]];
                        //             vec3.transformMat4(tempVert, tempVert, this.tempMatrix);

                        //             vAr[vertex * 3 + 0] = tempVert[0];
                        //             vAr[vertex * 3 + 1] = tempVert[1];
                        //             vAr[vertex * 3 + 2] = tempVert[2];
                        //         }

                        //         mesh.topMeshes[0].updateGeometry(
                        //             mesh.topMeshes[0].getFacesFromVertices(verticesInFace),
                        //             verticesInFace,
                        //             pickedFaces
                        //         );
                        //     }
                        // }

                        // mesh = ui.properties.selectedMeshFromEntity;

                        // ui.properties.selectedEntity.worldMatrix =
                        //     this.tempMatrix;

                        // mat4.scale(mesh.worldMatrix, mesh.worldMatrix, vec3.fromValues(this.fixedXValue ? this.fixedXValue : this.scaleObject[0], this.scaleObject[1], this.scaleObject[2]));

                        // this._picking._mesh.worldMatrix =
                        //     ui.properties.selectedEntity.worldMatrix;
                    }

                    // mat4.scale(this.tempMatrix, this.tempMatrix, vec3.fromValues(this.fixedXValue ? this.fixedXValue : this.scaleObject[0], this.scaleObject[1], this.scaleObject[2]));
                }

                // // console.log(this.quatRotation);

                var scalingFactor = vec3.create();
                mat4.getScaling(scalingFactor, ui.properties.selectedEntity.worldMatrix);

                var moveAmount = vec3.fromValues(
                    newPositionToMove[0] - lastPositionToMove[0],
                    newPositionToMove[1] - lastPositionToMove[1],
                    newPositionToMove[2] - lastPositionToMove[2]
                );

                var moveAmountForTranslation = vec3.fromValues(
                    newPositionForTranslationGizmo[0] -
                        lastPositionForTranslationGizmo[0],
                    newPositionForTranslationGizmo[1] -
                        lastPositionForTranslationGizmo[1],
                    newPositionForTranslationGizmo[2] -
                        lastPositionForTranslationGizmo[2]
                );

                var moveAmountForExtrude = vec3.fromValues(
                    newPositionForExtrudeGizmo[0] -
                        lastPositionForExtrudeGizmo[0],
                    newPositionForExtrudeGizmo[1] -
                        lastPositionForExtrudeGizmo[1],
                    newPositionForExtrudeGizmo[2] -
                        lastPositionForExtrudeGizmo[2]
                );

                if (
                    this._selecting &&
                    (this._selectionMode === 1 ||
                        this._selectionMode === 0 ||
                        this._selectionMode === 2)
                ) {
                    this._picking.pickVerticesInSphere(
                        this._picking.getLocalRadius2() / this._factor
                    );
                    this._picking.computePickedNormal();

                    if (!this._modifying) {
                        this._topologyPick.PickFaces();
                        this._topologyPick.PickEdges();
                        this._topologyPick.PickVertices();
                    }

                    var fAr = this._picking._mesh.getFaces();
                    var face = this._picking.getPickedFace();
                }

                // // console.log(this._modifying);

                if (this._modifying) {
                    var pickedFaces = this._topologyPick.GetPickedFaces();
                    var pickedEdges = this._topologyPick.GetPickedEdges();
                    var pickedVertices = this._topologyPick.GetPickedVertices();

                    if (this._selectionMode === 1)
                        this.MoveFaces(pickedFaces, moveAmount, ui);

                    if (this._selectionMode === 2)
                        this.MoveEdges(pickedEdges, moveAmount, ui);

                    if (this._selectionMode === 0) {
                        for (var i = 0; i < pickedVertices.length; i++) {
                            this.MoveVertex(pickedVertices[i], moveAmount, ui);
                        }
                    }
                }

                if (this._extruding) {
                    var faceAvgNormal = this._extrudeData.avgNormal;
                    // vec3.normalize(faceAvgNormal);
                    var dotuv = vec3.create();
                    // vec3.normalize(moveAmountForExtrude, moveAmountForExtrude);
                    vec3.multiply(dotuv, moveAmountForExtrude, faceAvgNormal);
                    var uLengthSquared = Math.pow(
                        vec3.length(faceAvgNormal),
                        2
                    );
                    var factor = 1 / uLengthSquared;
                    vec3.scale(dotuv, dotuv, factor);
                    var moveAmountExtrude = vec3.create();
                    vec3.multiply(moveAmountExtrude, dotuv, faceAvgNormal);

                    // Grab tool
                    // this.MoveFaces(
                    //     this._extrudeData.faceIndices,
                    //     moveAmountForExtrude,
                    //     ui,
                    //     true
                    // );

                    this.MoveFaces(
                        this._extrudeData.faceIndices,
                        moveAmountExtrude,
                        ui,
                        true
                    );
                }

                // // console.log(this._selectedTranslateAxis);

                if (this._mode === 25 && this._selectedTranslateAxis) {
                    // console.log("Translating");

                    var translateAmount = vec3.create();

                    if (this._selectedTranslateAxis === "x")
                        translateAmount = vec3.fromValues(
                            moveAmountForTranslation[0],
                            0.0,
                            0.0
                        );
                    if (this._selectedTranslateAxis === "y")
                        translateAmount = vec3.fromValues(
                            0.0,
                            moveAmountForTranslation[1],
                            0.0
                        );
                    if (this._selectedTranslateAxis === "z")
                        translateAmount = vec3.fromValues(
                            0.0,
                            0.0,
                            moveAmountForTranslation[2]
                        );

                    if (this._selectionMode === 1) {
                        var pickedFaces = this._topologyPick.GetPickedFaces();

                        this.MoveFaces(pickedFaces, translateAmount, ui);
                    } else if (this._selectionMode === 0) {
                        var firstVertex = this._topologyPick.GetPickedVertices()[0];
                        this.MoveVertex(firstVertex, translateAmount, ui);
                    } else if (this._selectionMode === 2) {
                        var edges = this._topologyPick.GetPickedEdges();
                        this.MoveEdges(edges, translateAmount, ui);
                    } else if (this._selectionMode === 5) {
                        var translation = vec3.create();
                        var rotation = vec4.create();
                        var scale = vec3.create();

                        decompose(
                            ui.properties.selectedEntity.worldMatrix,
                            translation,
                            rotation,
                            scale
                        );

                        translation[0] += translateAmount[0];
                        translation[1] += translateAmount[1];
                        translation[2] += translateAmount[2];
    
                        compose(
                            translation,
                            rotation,
                            scale,
                            ui.properties.selectedEntity.worldMatrix
                        );
    
                        modelPosition = vec3.fromValues(
                            ui.properties.selectedEntity.worldMatrix[12],
                            ui.properties.selectedEntity.worldMatrix[13],
                            ui.properties.selectedEntity.worldMatrix[14]
                        );
    
                        ui.properties.transformPosition = modelPosition
                    }

                    // this._picking._mesh = ui.properties.selectedMeshFromEntity;

                    this.meshModified = true;
                }

                if (this._mode === 12 && this._selectedScaleAxis) {
                    var translateAmount = vec3.create();

                    if (this._selectedScaleAxis === "x")
                        translateAmount = vec3.fromValues(
                            moveAmountForTranslation[0],
                            0.0,
                            0.0
                        );
                    if (this._selectedScaleAxis === "y")
                        translateAmount = vec3.fromValues(
                            0.0,
                            moveAmountForTranslation[1],
                            0.0
                        );
                    if (this._selectedScaleAxis === "z")
                        translateAmount = vec3.fromValues(
                            0.0,
                            0.0,
                            moveAmountForTranslation[2]
                        );

                    mat4.scale(
                        ui.properties.selectedEntity.worldMatrix,
                        ui.properties.selectedEntity.worldMatrix,
                        vec3.fromValues(
                            this.scaleObject[0] - translateAmount[0],
                            this.scaleObject[1] + translateAmount[1],
                            this.scaleObject[2] + translateAmount[2]
                        )
                    );

                    var scalingFactor = vec3.create();

                    mat4.getScaling(
                        scalingFactor,
                        ui.properties.selectedEntity.worldMatrix
                    );

                    ui.properties.transformScale = scalingFactor;

                    // this.fixedXValue = this.scaleObject[0] - translateAmount[0];
                    this.fixedXValue = scalingFactor[0];

                    this.updateScalingRotation = true;

                    this.first = false;

                    ui.properties.updateGizmoPosition = true;

                    // // console.log("-------------")
                    // // console.log(moveAmountForTranslation[0].toFixed(5) + " " + moveAmountForTranslation[1].toFixed(5) + " " + moveAmountForTranslation[2].toFixed(5));
                }

                // // console.log(this._topologyPick.GetPickedFaces());
            }
        });

        window.addEventListener("mousedown", (event) => {
            if (mesh && ui.properties.selectedEntity) {
                if (ui.properties.selectedMeshFromEntity) {
                    this._picking._mesh = ui.properties.selectedMeshFromEntity;
                    // mesh = ui.properties.selectedMeshFromEntity;
                }

                if (event.button === 0) {
                    this._picking.intersectionMouseMesh(
                        this._picking.canvas,
                        this._picking._camera,
                        this._picking._mesh,
                        event.clientX,
                        event.clientY,
                        ui.properties.selectedEntity.worldMatrix
                    );
                }

                if (event.button === 0 && this._mode === 4) {
                    this._selectedRotationPlane = this.GetRingClicked(
                        event,
                        this._picking,
                        rotationGizmo._rings,
                        rotationGizmo.newViewMatrix
                    );

                    if (this._selectedRotationPlane) {
                        var tempW = mat4.create();

                        mat4.copy(
                            tempW,
                            ui.properties.selectedMeshFromEntity.worldMatrix
                        );

                        this.undoStack.push(
                            ui.properties.selectedMeshFromEntity
                        );
                        this.undoStackMatrices.push(tempW);

                        this._usingRotationGizmo = true;
                        // vec3.copy(rotationGizmo._activeRing, this._selectedRotationPlane);
                        rotationGizmo._activeRing = this._selectedRotationPlane;

                        this.startedRotation = true;
                    }

                    // // console.log(rotationGizmo._activeRing);

                    this._picking._mesh = ui.properties.selectedMeshFromEntity;

                    this._rotating = true;
                }

                if (event.button === 0 && this._mode === 25) {
                    this._selectedTranslateAxis = this.GetTranslateAxis(
                        event,
                        this._picking,
                        transformGizmo._axes,
                        transformGizmo.newViewMatrix
                    );

                    if (this._selectedTranslateAxis !== "") {
                        var tempW = mat4.create();

                        mat4.copy(
                            tempW,
                            ui.properties.selectedMeshFromEntity.worldMatrix
                        );

                        this.undoStack.push(
                            ui.properties.selectedMeshFromEntity
                        );
                        this.undoStackMatrices.push(tempW);

                        this._usingTransformGizmo = true;
                        transformGizmo._activeAxis =
                            this._selectedTranslateAxis;
                    }

                    // if (this.meshModified) {

                    //     this.meshModified = false;
                    // }
                }

                if (event.button === 0 && this._mode === 12) {
                    this._selectedScaleAxis = this.GetTranslateAxis(
                        event,
                        this._picking,
                        scaleGizmo._axes,
                        scaleGizmo.newViewMatrix
                    );

                    if (this._selectedScaleAxis !== "") {
                        var tempW = mat4.create();

                        mat4.copy(
                            tempW,
                            ui.properties.selectedMeshFromEntity.worldMatrix
                        );

                        this.undoStack.push(
                            ui.properties.selectedMeshFromEntity
                        );
                        this.undoStackMatrices.push(tempW);

                        this._usingScaleGizmo = true;
                        scaleGizmo._activeAxis = this._selectedScaleAxis;
                    }
                }

                // var intersectionExtrudeGizmo = extrudeGizmo.intersection(
                //     event,
                //     this._picking
                // );

                // this._picking._mesh = mesh.topMeshes[0];

                if (
                    event.button === 0 &&
                    this._topologyPick.GetPickedFaces().length > 0 &&
                    this._mode === 52
                ) {
                    var intersectionExtrudeGizmo = extrudeGizmo.intersection(
                        event,
                        this._picking
                    );

                    if (intersectionExtrudeGizmo) {
                        var tempW = mat4.create();

                        mat4.copy(
                            tempW,
                            ui.properties.selectedMeshFromEntity.worldMatrix
                        );

                        this.undoStack.push(
                            ui.properties.selectedMeshFromEntity
                        );
                        this.undoStackMatrices.push(tempW);

                        // this._picking._mesh = mesh.topMeshes[0];
                        this.updateExtrudedMesh = true;
                        // console.log("Intersection");
                    }
                }

                // if (event.button === 0 && this._mode === 52) {
                // var axes = [extrudeGizmo._axisMesh];
                // var axis = this.GetTranslateAxis(
                //     event,
                //     this._picking,
                //     axes,
                //     mat4.create()
                // );

                // if (axis) {
                //     // var extrudeData = this.Extrude(gl);
                //     this.updateExtrudedMesh = true;
                // }
                // }

                this._picking.pickVerticesInSphere(
                    this._picking.getLocalRadius2() / this._factor
                );
                this._picking.computePickedNormal();

                this._lastMouseX = event.clientX;
                this._lastMouseY = event.clientY;

                this._mouseX = event.clientX;
                this._mouseY = event.clientY;

                if (event.button === 0) {
                    if (
                        this._topologyPick
                            .GetPickedFaces()
                            .indexOf(this._picking.getPickedFace()) !== -1
                        // this._selectionMode !== 0
                    ) {
                        // // console.log("A");
                        this._modifying = true;
                    } else {
                        this._modifying = false;
                    }

                    if (
                        (this._topologyPick.GetPickedFaces().length > 0 ||
                            this._topologyPick.GetPickedEdges().length > 0) &&
                        !this._modifying &&
                        // this._selectionMode !== 0 &&
                        !intersectionExtrudeGizmo &&
                        !ui.io.WantCaptureMouse &&
                        this._mode === -1
                    ) {
                        if (this._mode === 52) {
                            var intersectionExtrudeGizmo =
                                extrudeGizmo.intersection(event, this._picking);

                            this._picking._mesh =
                                ui.properties.selectedMeshFromEntity;

                            if (!intersectionExtrudeGizmo) {
                                this._topologyPick.RestartPicking();
                            }
                        } else {
                            this._topologyPick.RestartPicking();
                        }
                    }

                    if (
                        !this._selecting &&
                        !(
                            this._topologyPick
                                .GetPickedFaces()
                                .indexOf(this._picking.getPickedFace()) !== -1
                        ) &&
                        // this._selectionMode !== 0 &&
                        !ui.io.WantCaptureMouse
                    ) {
                        var intersectionExtrudeGizmo =
                            extrudeGizmo.intersection(event, this._picking);

                        this._picking._mesh =
                            ui.properties.selectedMeshFromEntity;

                        if (
                            !intersectionExtrudeGizmo &&
                            (this._mode === -1 || this._mode === 52)
                        ) {
                            this._topologyPick.RestartPicking();
                            this._modifying = false;
                            this._selecting = true;
                        }
                    }
                }
            }
        });

        window.addEventListener("mouseup", (event) => {
            if (event.button === 0) {
                this._selecting = false;
            }

            if (event.button === 0 && this._mode === 4) {
                this._rotating = false;
                rotationGizmo._activeRing = null;
            }

            if (this._modifying) {
                this._modifying = false;
            }

            if (event.button === 0 && this._mode === 25) {
                this._selectedTranslateAxis = "";
                this._usingTransformGizmo = false;
                transformGizmo._activeAxis = null;
            }

            if (event.button === 0 && this._mode === 12) {
                this._selectedScaleAxis = "";
                this._usingScaleGizmo = false;
                scaleGizmo._activeAxis = null;
            }

            if (this._extruding === true) {
                this._extruding = false;
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.ctrlKey) {
                this.ctrl = true;
            }

            if (event.key === "z" && event.ctrlKey) {
                if (
                    this.undoStack.length > 0 &&
                    ui.properties.selectedMeshFromEntity
                ) {
                    var meshBefore = this.undoStack.pop();
                    var meshMatrixBefore = this.undoStackMatrices.pop();

                    ui.properties.selectedMeshFromEntity = meshBefore;
                    mat4.copy(
                        ui.properties.selectedMeshFromEntity.worldMatrix,
                        meshMatrixBefore
                    );

                    var _translation = vec3.create();
                    var _rotation = quat.create();
                    var _scale = vec3.create();

                    decompose(
                        meshMatrixBefore,
                        _translation,
                        _rotation,
                        _scale
                    );

                    ui.properties.transformPosition = _translation;
                    ui.properties.transformRotation = _rotation;
                    ui.properties.transformScale = _scale;
                }
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.ctrlKey) this.ctrl = false;
        });
    }

    Highlight(gl, faceShader, vertexShader, worldMatrix) {
        var pickedFaces = this._topologyPick.GetPickedFaces();
        var pickedEdges = this._topologyPick.GetPickedEdges();
        var pickedVertices = this._topologyPick.GetPickedVertices();
        var vAr = this._picking._mesh.getVertices();

        this.faceShader = faceShader;

        // this._topHighlight.HighlightFace(gl, this._picking._mesh, faceShader, 0);

        if (this._selectionMode === 1) {
            for (var i = 0; i < pickedFaces.length; i++) {
                this._topHighlight.HighlightFace(
                    gl,
                    this._picking._mesh,
                    faceShader,
                    pickedFaces[i]
                );
            }
        }

        if (this._selectionMode === 2) {
            for (var i = 0; i < pickedEdges.length; i++) {
                this._topHighlight.HighlightEdge(
                    gl,
                    this._picking._mesh,
                    faceShader,
                    pickedEdges[i]
                );
            }
        }

        if (this._selectionMode === 0) {
            for (var i = 0; i < pickedVertices.length; i++) {
                var vertexPosition = [
                    vAr[pickedVertices[i] * 3 + 0],
                    vAr[pickedVertices[i] * 3 + 1],
                    vAr[pickedVertices[i] * 3 + 2],
                ];
                this._topHighlight.HighlightVertex(
                    gl,
                    worldMatrix,
                    vertexShader,
                    vertexPosition
                );
            }
        }
    }

    Extrude(gl) {
        var newArr = this.CreateExtrudedFaces(gl);

        var newMesh = createMesh(gl, newArr);
        var mesh = new MultiMesh(newMesh);

        mesh.init();
        mesh.setBuffers(gl);

        this._picking._mesh = mesh;

        var arr = this.RemovePickedFaces(gl, newArr.duplicatedFaces);
        mesh = arr.mesh;
        this._picking._mesh = arr.mesh;

        var facesToMove = [];

        for (var i = 0; i < newArr.faceIndex.length; i++) {
            var newFaceIndex = this.GetNewFaceIndex(
                newArr.faceIndex[i],
                arr.removedFaces
            );
            facesToMove.push(newFaceIndex);
        }

        var fnAr = mesh.getFaceNormals();

        this._topologyPick._pickedFaces = facesToMove;

        this._extrudeData = {
            mesh: mesh,
            avgNormal: newArr.avgNormal,
            faceIndices: facesToMove,
        };

        this._extruding = true;

        return this._extrudeData;
    }

    GetNewFaceIndex(
        faceIndex,
        removedFaces,
        pFaces = null,
        pickedFaces = false
    ) {
        var newFaceIndex = faceIndex;

        if (pickedFaces) {
            for (var k = 0; k < pFaces.length; k++) {
                removedFaces.push(pFaces[k]);
            }
        }

        for (var i = 0; i < removedFaces.length; i++) {
            if (removedFaces[i] < faceIndex) newFaceIndex--;
        }

        return newFaceIndex;
    }

    RemovePickedFaces(gl, facesToRemove = null) {
        var mesh = this._picking._mesh;
        var vAr = mesh.getVertices();
        var fAr = mesh.getFaces();

        var vertices = [];

        var newFaces = [];

        var pickedFaces = [];

        for (var i = 0; i < fAr.length; i++) {
            newFaces.push(fAr[i]);
        }

        for (var i = 0; i < vAr.length; i++) {
            vertices.push(vAr[i]);
        }

        pickedFaces = this._topologyPick.GetPickedFaces();

        if (facesToRemove && facesToRemove.length > 0) {
            for (var i = 0; i < facesToRemove.length; i++) {
                pickedFaces.push(facesToRemove[i]);
            }
        }

        var removedFaces = [];

        for (var i = 0; i < pickedFaces.length; i++) {
            var newFaceIndex = this.GetNewFaceIndex(
                pickedFaces[i],
                removedFaces
            );

            newFaces = this.RemoveFace(newFaces, newFaceIndex);

            removedFaces.push(pickedFaces[i]);
        }

        var v = new Float32Array(vertices);

        var f = new Float32Array(newFaces);

        var newArr = { vertices: v, faces: f };

        var tempMesh = createMesh(gl, newArr);
        var newMesh = new MultiMesh(tempMesh);

        newMesh.init();
        newMesh.setBuffers(gl);

        var arr = { mesh: newMesh, removedFaces: removedFaces };

        return arr;
    }

    RemoveFace(faces, faceToRemove) {
        faces.splice(faceToRemove * 4, 4);

        return faces;
    }

    CreateFace(gl, points = null) {
        var mesh = this._picking._mesh;
        var vAr = mesh.getVertices();
        var fAr = mesh.getFaces();

        var vertices = [];

        var newFaces = [];

        for (var i = 0; i < fAr.length; i++) {
            newFaces.push(fAr[i]);
        }

        for (var i = 0; i < vAr.length; i++) {
            vertices.push(vAr[i]);
        }

        var points2 = this._topologyPick.GetPickedVertices();

        if (points2.length === 4) {
            newFaces.push(points2[0], points2[1], points2[2], points2[3]);
        }

        var v = new Float32Array(vertices);

        var f = new Float32Array(newFaces);

        var newArr = { vertices: v, faces: f };

        var tempMesh = createMesh(gl, newArr);
        var newMesh = new MultiMesh(tempMesh);

        newMesh.init();
        newMesh.setBuffers(gl);

        mesh = newMesh;

        this._picking._mesh = mesh;

        return mesh;
    }

    GetNewFaceIndex(faceIndex, removedFaces) {
        var newFaceIndex = faceIndex;

        for (var i = 0; i < removedFaces.length; i++) {
            if (removedFaces[i] < faceIndex) newFaceIndex--;
        }

        return newFaceIndex;
    }

    CreateExtrudedFaces(gl) {
        var mesh = this._picking._mesh;
        var vAr = mesh.getVertices();
        var fAr = mesh.getFaces();
        var fnAr = mesh.getFaceNormals();
        var faceIDs = this._topologyPick.GetPickedFaces();
        var isGroup = true;
        var scalar = 0.01;

        // console.log(faceIDs);

        var avgNormal = [0, 0, 0];

        var vertices = [];

        var newFaces = [];

        var nbVerts = mesh.getNbVertices();

        var newFaces = [];

        var newFaces2 = [];

        var faceIndex = [];

        var newVerts = [];

        var duplicatedFaces = [];

        for (var i = 0; i < fAr.length; i++) {
            newFaces.push(fAr[i]);
        }

        for (var i = 0; i < vAr.length; i++) {
            vertices.push(vAr[i]);
        }

        if (isGroup) {
            for (var i = 0; i < faceIDs.length; i++) {
                var faceID = faceIDs[i];
                var faceNormal = [
                    fnAr[faceID * 3],
                    fnAr[faceID * 3 + 1],
                    fnAr[faceID * 3 + 2],
                ];

                avgNormal[0] += faceNormal[0];
                avgNormal[1] += faceNormal[1];
                avgNormal[2] += faceNormal[2];
            }

            avgNormal[0] /= faceIDs.length;
            avgNormal[1] /= faceIDs.length;
            avgNormal[2] /= faceIDs.length;
        }

        for (var i = 0; i < faceIDs.length; i++) {
            var faceID = faceIDs[i];

            var faceNormal = [
                fnAr[faceID * 3],
                fnAr[faceID * 3 + 1],
                fnAr[faceID * 3 + 2],
            ];

            var face = [
                fAr[faceID * 4],
                fAr[faceID * 4 + 1],
                fAr[faceID * 4 + 2],
                fAr[faceID * 4 + 3],
            ];

            var v1 = [
                vAr[face[0] * 3 + 0],
                vAr[face[0] * 3 + 1],
                vAr[face[0] * 3 + 2],
                vertices.length / 3,
                1,
            ];
            var v2 = [
                vAr[face[1] * 3 + 0],
                vAr[face[1] * 3 + 1],
                vAr[face[1] * 3 + 2],
                vertices.length / 3 + 1,
                1,
            ];
            var v3 = [
                vAr[face[2] * 3 + 0],
                vAr[face[2] * 3 + 1],
                vAr[face[2] * 3 + 2],
                vertices.length / 3 + 2,
                1,
            ];
            var v4 = [
                vAr[face[3] * 3 + 0],
                vAr[face[3] * 3 + 1],
                vAr[face[3] * 3 + 2],
                vertices.length / 3 + 3,
                1,
            ];

            var verts = [v1, v2, v3, v4];

            if (isGroup) {
                var normalizedVector = vec3.create();
                var vectorToNormalize = vec3.fromValues(
                    avgNormal[0],
                    avgNormal[1],
                    avgNormal[2]
                );
                vec3.normalize(normalizedVector, vectorToNormalize);
                var newV2 = [
                    v1[0] + normalizedVector[0] * scalar,
                    v1[1] + normalizedVector[1] * scalar,
                    v1[2] + normalizedVector[2] * scalar,
                    vertices.length / 3 + 1,
                    1,
                ];
                var newV1 = [
                    v2[0] + normalizedVector[0] * scalar,
                    v2[1] + normalizedVector[1] * scalar,
                    v2[2] + normalizedVector[2] * scalar,
                    vertices.length / 3,
                    1,
                ];
                var newV3 = [
                    v3[0] + normalizedVector[0] * scalar,
                    v3[1] + normalizedVector[1] * scalar,
                    v3[2] + normalizedVector[2] * scalar,
                    vertices.length / 3 + 2,
                    1,
                ];
                var newV4 = [
                    v4[0] + normalizedVector[0] * scalar,
                    v4[1] + normalizedVector[1] * scalar,
                    v4[2] + normalizedVector[2] * scalar,
                    vertices.length / 3 + 3,
                    1,
                ];
            } else {
                var newV2 = [
                    v1[0] + faceNormal[0] * 0.2,
                    v1[1] + faceNormal[1] * 0.2,
                    v1[2] + faceNormal[2] * 0.2,
                ];
                var newV1 = [
                    v2[0] + faceNormal[0] * 0.2,
                    v2[1] + faceNormal[1] * 0.2,
                    v2[2] + faceNormal[2] * 0.2,
                ];
                var newV3 = [
                    v3[0] + faceNormal[0] * 0.2,
                    v3[1] + faceNormal[1] * 0.2,
                    v3[2] + faceNormal[2] * 0.2,
                ];
                var newV4 = [
                    v4[0] + faceNormal[0] * 0.2,
                    v4[1] + faceNormal[1] * 0.2,
                    v4[2] + faceNormal[2] * 0.2,
                ];
            }

            var verts = [newV1, newV2, newV3, newV4];

            for (var j = 0; j < 4; j++) {
                var vert = verts[j];

                for (var k = 0; k < newVerts.length; k++) {
                    var newVert = newVerts[k];
                    if (
                        vert[0] === newVert[0] &&
                        vert[1] === newVert[1] &&
                        vert[2] === newVert[2]
                    ) {
                        vert[3] = newVert[3];
                        vert[4] = -1;
                    }
                }
            }

            var f1 = [
                face[0],
                face[1],
                newV1[3],
                newV2[3],
                1,
                newFaces.length / 4,
            ];
            var f2 = [
                newV4[3],
                newV3[3],
                face[2],
                face[3],
                1,
                newFaces.length / 4 + 1,
            ];
            // var f3 = [newV1[3], newV2[3], newV4[3], newV3[3], 1, newFaces.length / 4 + 2];
            var f3 = [
                newV3[3],
                newV4[3],
                newV2[3],
                newV1[3],
                1,
                newFaces.length / 4 + 2,
            ];
            var f4 = [
                face[1],
                face[2],
                newV3[3],
                newV1[3],
                1,
                newFaces.length / 4 + 3,
            ];
            var f5 = [
                newV2[3],
                newV4[3],
                face[3],
                face[0],
                1,
                newFaces.length / 4 + 4,
            ];

            var facesd = [f1, f2, f3, f4, f5];

            for (var k = 0; k < 5; k++) {
                var face = facesd[k];

                for (var w = 0; w < newFaces2.length; w++) {
                    var newFace = newFaces2[w];

                    var filteredArray = newFace.filter(function (n) {
                        return face.indexOf(n) !== -1 && n !== 1 && n !== -1;
                    });

                    if (filteredArray.length >= 4) {
                        face[4] = -1;
                        newFace[4] = -1;

                        // console.log(filteredArray);

                        if (duplicatedFaces.indexOf(face[5]) === -1)
                            duplicatedFaces.push(face[5]);

                        if (duplicatedFaces.indexOf(newFace[5]) === -1)
                            duplicatedFaces.push(newFace[5]);
                    }
                }
            }

            if (v1[4] !== -1) {
                vertices.push(newV1[0]);
                vertices.push(newV1[1]);
                vertices.push(newV1[2]);
            }

            if (v1[4] !== -1) {
                vertices.push(newV2[0]);
                vertices.push(newV2[1]);
                vertices.push(newV2[2]);
            }

            if (v1[4] !== -1) {
                vertices.push(newV3[0]);
                vertices.push(newV3[1]);
                vertices.push(newV3[2]);
            }

            if (v1[4] !== -1) {
                vertices.push(newV4[0]);
                vertices.push(newV4[1]);
                vertices.push(newV4[2]);
            }

            newFaces.push(f1[0]);
            newFaces.push(f1[1]);
            newFaces.push(f1[2]);
            newFaces.push(f1[3]);

            newFaces.push(f2[0]);
            newFaces.push(f2[1]);
            newFaces.push(f2[2]);
            newFaces.push(f2[3]);

            faceIndex.push(newFaces.length / 4);

            newFaces.push(f3[0]);
            newFaces.push(f3[1]);
            newFaces.push(f3[2]);
            newFaces.push(f3[3]);

            newFaces.push(f4[0]);
            newFaces.push(f4[1]);
            newFaces.push(f4[2]);
            newFaces.push(f4[3]);

            newFaces.push(f5[0]);
            newFaces.push(f5[1]);
            newFaces.push(f5[2]);
            newFaces.push(f5[3]);

            newFaces2.push(f1);
            newFaces2.push(f2);
            newFaces2.push(f3);
            newFaces2.push(f4);
            newFaces2.push(f5);

            newVerts.push(newV1);
            newVerts.push(newV2);
            newVerts.push(newV3);
            newVerts.push(newV4);

            nbVerts += 4;
        }

        var v = new Float32Array(vertices);

        var f = new Float32Array(newFaces);

        var newArr = {
            vertices: v,
            faces: f,
            faceIndex: faceIndex,
            avgNormal: avgNormal,
            duplicatedFaces: duplicatedFaces,
        };

        return newArr;
    }

    SplitEdges() {}

    SubdivideMesh() {}

    SubdivideFaces() {}

    SelectVertices() {}

    SelectEdges() {}

    SetMode(mode) {
        this._mode = mode;
    }

    SetSelectionMode(selectionMode) {
        this._selectionMode = selectionMode;
    }

    MoveVertex(vertex, moveAmount, ui, faces = null) {
        var vAr = this._picking._mesh.getVertices();

        var tempVec = vec3.create();

        vAr[vertex * 3 + 0] += moveAmount[0];
        vAr[vertex * 3 + 1] += moveAmount[1];
        vAr[vertex * 3 + 2] += moveAmount[2];

        this._picking._mesh.updateGeometry(
            this._picking._mesh.getFacesFromVertices([vertex]),
            [vertex],
            faces
        );
        // this._picking._mesh.updateDuplicateGeometry([vertex]);

        this._picking._mesh.updateGeometryBuffers();

        ui.properties.updateGizmoPosition = true;
    }

    MoveEdges(edges, moveAmount, ui) {
        var verticesToMove = [];

        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];

            if (edge && verticesToMove.indexOf(edge[0]) === -1) {
                this.MoveVertex(edge[0], moveAmount, ui);
                verticesToMove.push(edge[0]);
            }

            if (edge && verticesToMove.indexOf(edge[1]) === -1) {
                this.MoveVertex(edge[1], moveAmount, ui);
                verticesToMove.push(edge[1]);
            }
        }
    }

    MoveFaces(faces, moveAmount, ui) {
        // // console.log(faces);
        var verticesToMove = [];
        var fnAr = this._picking._mesh.getFaceNormals();

        for (var i = 0; i < faces.length; i++) {
            var face = faces[i];

            var verticesInCurrentFace =
                this._picking._mesh.getVerticesFromFaces([face]);

            for (var j = 0; j < verticesInCurrentFace.length; j++) {
                if (verticesToMove.indexOf(verticesInCurrentFace[j]) === -1) {
                    verticesToMove.push(verticesInCurrentFace[j]);
                }
            }

            // // console.log([fnAr[face * 3], fnAr[(face * 3) + 1], fnAr[(face * 3) + 2]]);

            // if (extrudedFaces) {
            //     fnAr[face * 3 + 0] = -fnAr[face * 3 + 0];
            //     fnAr[face * 3 + 1] = -fnAr[face * 3 + 1];
            //     fnAr[face * 3 + 2] = -fnAr[face * 3 + 2];
            // }
        }

        for (var k = 0; k < verticesToMove.length; k++) {
            this.MoveVertex(verticesToMove[k], moveAmount, ui, faces);
        }
    }

    RayCast(
        canvas,
        camera,
        mouseX,
        mouseY,
        planeNormal,
        dist,
        meshWorldMatrix = null
    ) {
        var worldMatrix = mat4.create();
        mat4.translate(worldMatrix, worldMatrix, vec3.create());

        var rotationMatrix = mat4.create();

        if (meshWorldMatrix) {
            mat4.getRotation(rotationMatrix, meshWorldMatrix);

            mat4.fromQuat(worldMatrix, rotationMatrix);
        }

        var modelview = mat4.create();

        mat4.multiply(modelview, camera.viewMatrix, worldMatrix);
        var viewport = [0, 0, canvas.clientWidth, canvas.clientHeight];

        var start = [];
        var end = [];

        GLU.unProject(
            mouseX,
            viewport[3] - mouseY,
            0.0,
            modelview,
            camera.projectionMatrix,
            viewport,
            start
        );
        GLU.unProject(
            mouseX,
            viewport[3] - mouseY,
            0.1,
            modelview,
            camera.projectionMatrix,
            viewport,
            end
        );

        var direction = vec3.create();
        var origin = vec3.fromValues(start[0], start[1], start[2]);
        var ends = vec3.fromValues(end[0], end[1], end[2]);
        vec3.subtract(direction, ends, origin);
        vec3.normalize(direction, direction);

        var coordinatePlaneNormal = planeNormal;

        if (!planeNormal) {
            coordinatePlaneNormal = this.GetCoordinatePlaneFacing(
                camera.viewMatrix
            );
        }

        var out = vec3.create();

        this.IntersectRayPlane(
            out,
            origin,
            direction,
            coordinatePlaneNormal,
            -dist
        );

        return out;
    }

    RayCastForTranslationGizmo(
        canvas,
        camera,
        mouseX,
        mouseY,
        planeNormal,
        dist,
        meshWorldMatrix = null
    ) {
        var worldMatrix = mat4.create();
        mat4.translate(worldMatrix, worldMatrix, vec3.create());

        var rotationMatrix = mat4.create();

        // if (meshWorldMatrix) {
        //     mat4.getRotation(rotationMatrix, meshWorldMatrix);

        //     mat4.fromQuat(worldMatrix, rotationMatrix);
        // }

        var modelview = mat4.create();

        mat4.multiply(modelview, camera.viewMatrix, worldMatrix);
        var viewport = [0, 0, canvas.clientWidth, canvas.clientHeight];

        var start = [];
        var end = [];

        GLU.unProject(
            mouseX,
            viewport[3] - mouseY,
            0.0,
            modelview,
            camera.projectionMatrix,
            viewport,
            start
        );
        GLU.unProject(
            mouseX,
            viewport[3] - mouseY,
            0.1,
            modelview,
            camera.projectionMatrix,
            viewport,
            end
        );

        var direction = vec3.create();
        var origin = vec3.fromValues(start[0], start[1], start[2]);
        var ends = vec3.fromValues(end[0], end[1], end[2]);
        vec3.subtract(direction, ends, origin);
        vec3.normalize(direction, direction);

        var coordinatePlaneNormal = planeNormal;

        if (!planeNormal) {
            coordinatePlaneNormal = this.GetCoordinatePlaneFacing(
                camera.viewMatrix
            );
        }

        var out = vec3.create();

        this.IntersectRayPlane(
            out,
            origin,
            direction,
            coordinatePlaneNormal,
            -dist
        );

        return out;
    }

    GetCoordinatePlaneFacing(viewMatrix) {
        var frontView = vec3.fromValues(
            Math.abs(viewMatrix[8]),
            Math.abs(viewMatrix[9]),
            Math.abs(viewMatrix[10])
        );

        if (vec3.angle(frontView, this._YZnormal) < 1.0) {
            return this._YZnormal;
        }
        if (vec3.angle(frontView, this._XYnormal) < 1.0) {
            return this._XYnormal;
        }
        if (vec3.angle(frontView, this._XZnormal) < 1.0) {
            return this._XZnormal;
        }
    }

    IntersectRayPlane(out, origin, direction, normal, dist) {
        var v0 = vec3.create();
        var denom = vec3.dot(direction, normal);
        if (denom !== 0) {
            var t = -(vec3.dot(origin, normal) + dist) / denom;
            if (t < 0) {
                return null;
            }
            vec3.scale(v0, direction, t);
            return vec3.add(out, origin, v0);
        } else if (vec3.dot(normal, origin) + dist === 0) {
            return vec3.copy(out, origin);
        } else {
            return null;
        }
    }

    GetRingClicked(event, picking, rings, newViewMatrix) {
        for (var i = 0; i < rings.length; i++) {
            var ring = rings[i];
            picking._mesh = ring;

            if (
                picking.intersectionMouseMesh(
                    picking.canvas,
                    picking._camera,
                    ring,
                    event.clientX,
                    event.clientY,
                    ring.worldMatrix
                )
            ) {
                if (i === 0) return this._XZnormal;
                if (i === 2) return this._XYnormal;
                if (i === 1) return this._YZnormal;
            }
        }
    }

    GetTranslateAxis(event, picking, axes, viewMatrix) {
        // console.log(axes);

        for (var i = 0; i < axes.length; i++) {
            var axis = axes[i];
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
                if (i === 0) {
                    return "y";
                }

                if (i === 1) {
                    return "x";
                }

                if (i === 2) {
                    return "z";
                }
            }
        }
    }

    GetAngleFromPlanePosition(position, plane) {
        var angle = -1;

        if (plane == this._XZnormal) {
            angle = Math.atan(position[2] / position[0]) * (180 / Math.PI);

            if (!(position[2] > 0 && position[0] > 0)) {
                angle += 180;
            }

            if (position[2] < 0 && position[0] > 0) {
                angle += 180;
            }
        } else if (plane === this._XYnormal) {
            angle = Math.atan(position[1] / position[0]) * (180 / Math.PI);

            if (!(position[1] > 0 && position[0] > 0)) {
                angle += 180;
            }

            if (position[1] < 0 && position[0] > 0) {
                angle += 180;
            }
        } else if (plane === this._YZnormal) {
            angle = Math.atan(position[1] / position[2]) * (180 / Math.PI);

            if (!(position[1] > 0 && position[2] > 0)) {
                angle += 180;
            }

            if (position[1] < 0 && position[2] > 0) {
                angle += 180;
            }
        }

        return angle;
    }

    AverageNormalFromPickedFaces(mesh) {
        var pickedFaces = this._topologyPick.GetPickedFaces();
        var fnAr = mesh.getFaceNormals();

        var avgNormal = vec3.create();

        for (var i = 0; i < pickedFaces.length; i++) {
            var faceID = pickedFaces[i];

            var faceNormal = [
                fnAr[faceID * 3],
                fnAr[faceID * 3 + 1],
                fnAr[faceID * 3 + 2],
            ];

            avgNormal[0] += faceNormal[0];
            avgNormal[1] += faceNormal[1];
            avgNormal[2] += faceNormal[2];
        }

        avgNormal[0] /= pickedFaces.length;
        avgNormal[1] /= pickedFaces.length;
        avgNormal[2] /= pickedFaces.length;

        return avgNormal;
    }

    GetAveragePositionFromFaces(mesh, faces) {
        var faceCenters = mesh.getFaceCenters();

        var averagePosition = vec3.fromValues(0.0, 0.0, 0.0);

        for (var i = 0; i < faces.length; i++) {
            var face = faces[i];

            var faceCenter = vec3.fromValues(
                faceCenters[face * 3 + 0],
                faceCenters[face * 3 + 1],
                faceCenters[face * 3 + 2]
            );

            averagePosition[0] += faceCenter[0];
            averagePosition[1] += faceCenter[1];
            averagePosition[2] += faceCenter[2];
        }

        averagePosition[0] /= faces.length;
        averagePosition[1] /= faces.length;
        averagePosition[2] /= faces.length;

        return averagePosition;
    }

    GetAveragePositionFromEdges(mesh, edges) {
        var vAr = mesh.getVertices();

        var averagePosition = [0.0, 0.0, 0.0];

        // // console.log(edges);

        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            var firstVertex = [vAr[edge[0] * 3 + 0], vAr[edge[0] * 3 + 1], vAr[edge[0] * 3 + 2]];
            var secondVertex = [vAr[edge[1] * 3 + 0], vAr[edge[1] * 3 + 1], vAr[edge[1] * 3 + 2]];

            // // console.log(firstVertex);

            var edgeCenter = [(secondVertex[0] + firstVertex[0]) / 2, (secondVertex[1] + firstVertex[1]) / 2, (secondVertex[2] + firstVertex[2]) / 2];

            // console.log(edgeCenter);

            averagePosition[0] += edgeCenter[0];
            averagePosition[1] += edgeCenter[1];
            averagePosition[2] += edgeCenter[2];
        }
        
        averagePosition[0] /= edges.length;
        averagePosition[1] /= edges.length;
        averagePosition[2] /= edges.length;

        return averagePosition
    }
}

function decompose(srcMat, dstTranslation, dstRotation, dstScale) {
    var sx = vec3.length([srcMat[0], srcMat[1], srcMat[2]]);
    const sy = vec3.length([srcMat[4], srcMat[5], srcMat[6]]);
    const sz = vec3.length([srcMat[8], srcMat[9], srcMat[10]]);

    // if determine is negative, we need to invert one scale
    const det = mat4.determinant(srcMat);
    if (det < 0) sx = -sx;

    dstTranslation[0] = srcMat[12];
    dstTranslation[1] = srcMat[13];
    dstTranslation[2] = srcMat[14];

    // scale the rotation part
    const _m1 = srcMat.slice();

    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;

    _m1[0] *= invSX;
    _m1[1] *= invSX;
    _m1[2] *= invSX;

    _m1[4] *= invSY;
    _m1[5] *= invSY;
    _m1[6] *= invSY;

    _m1[8] *= invSZ;
    _m1[9] *= invSZ;
    _m1[10] *= invSZ;

    mat4.getRotation(dstRotation, _m1);

    dstScale[0] = sx;
    dstScale[1] = sy;
    dstScale[2] = sz;
}

function compose(srcTranslation, srcRotation, srcScale, dstMat) {
    const te = dstMat;

    const x = srcRotation[0],
        y = srcRotation[1],
        z = srcRotation[2],
        w = srcRotation[3];
    const x2 = x + x,
        y2 = y + y,
        z2 = z + z;
    const xx = x * x2,
        xy = x * y2,
        xz = x * z2;
    const yy = y * y2,
        yz = y * z2,
        zz = z * z2;
    const wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    const sx = srcScale[0],
        sy = srcScale[1],
        sz = srcScale[2];

    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;

    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;

    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;

    te[12] = srcTranslation[0];
    te[13] = srcTranslation[1];
    te[14] = srcTranslation[2];
    te[15] = 1;

    return te;
}
