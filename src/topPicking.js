import { vec3 } from "gl-matrix";

export class TopPick {
    _mesh;
    _pickedVertices = [];
    _pickedFaces = [];
    _pickedEdges = [];
    _picking = null;

    isPicking = false;

    modes = { vertices: 0, faces: 1, edges: 2 };
    _pickingMode = 0;

    _mesh = null;

    constructor(picking) {
        this._picking = picking;
        this._mesh = picking.mesh;
    }

    setPickingMode(mode) {
        this._pickingMode = mode;
    }

    getPickingMode() {
        return this._pickingMode;
    }

    Pick() {
        switch (this._pickingMode) {
            case 0:
                this.PickVertices();
                break;
            case 1:
                this.PickFaces();
                break;
            case 2:
                this.PickEdges();
                break;
            default:
                return;
        }
    }

    PickVertices() {
        this._pickedVertices = this._picking.getPickedVertices();
        // var closestVertex = null;
        // var closestValue = [0, 0, 0];
        // var dist = 0;
        // var vAr = this._picking._mesh.getVertices();
        // var face = this._picking.getPickedFace();
        // var verticesInFace = this._picking._mesh.getVerticesFromFaces([face]);

        // for (var i = 0; i < 4; i++) {
        //     var currentVertex = verticesInFace[i];
        //     var value = [
        //         vAr[currentVertex * 3 + 0],
        //         vAr[currentVertex * 3 + 1],
        //         vAr[currentVertex * 3 + 2],
        //     ];
        //     closestValue = [
        //         vAr[closestVertex * 3 + 0],
        //         vAr[closestVertex * 3 + 1],
        //         vAr[closestVertex * 3 + 2],
        //     ];

        //     if (
        //         !closestVertex ||
        //         this.Distance(value, this._picking.getIntersectionPoint()) <
        //             dist
        //     ) {
        //         closestVertex = currentVertex;
        //         dist = this.Distance(
        //             value,
        //             this._picking.getIntersectionPoint()
        //         );
        //     }
        // }

        // if (
        //     closestVertex &&
        //     dist < 0.4 &&
        //     this._pickedVertices.indexOf(closestVertex) === -1
        // ) {
        //     this._pickedVertices.push(closestVertex);
        // }
    }

    PickFaces() {
        var face = this._picking.getPickedFace();

        if (face !== -1 && this._pickedFaces.indexOf(face) === -1)
            this._pickedFaces.push(face);
    }

    PickEdges() {
        var vAr = this._picking._mesh.getVertices();
        var face = this._picking.getPickedFace();
        var verticesInFace = this._picking._mesh.getVerticesFromFaces([face]);

        verticesInFace.sort((a, b) => {
            var value1 = [vAr[a * 3 + 0], vAr[a * 3 + 1], vAr[a * 3 + 2]];
            var value2 = [vAr[b * 3 + 0], vAr[b * 3 + 1], vAr[b * 3 + 2]];

            if (
                this.Distance(value1, this._picking.getIntersectionPoint()) <
                this.Distance(value2, this._picking.getIntersectionPoint())
            ) {
                return -1;
            } else {
                return 1;
            }
        });

        var edge = [];

        edge.push(verticesInFace[0]);
        edge.push(verticesInFace[1]);

        // this._pickedEdges.push(edge);

        for (var i = 0; i < this._pickedEdges.length; i++) {
            if (
                edge[0] === this._pickedEdges[i][0] &&
                edge[1] === this._pickedEdges[i][1]
            ) {
                return;
            }
        }

        this._pickedEdges.push(edge);
    }

    GetPickedVertices() {
        return this._pickedVertices;
    }

    GetPickedFaces() {
        return this._pickedFaces;
    }

    GetPickedEdges() {
        return this._pickedEdges;
    }

    RestartPicking() {
        this._pickedVertices = [];
        this._pickedFaces = [];
        this._pickedEdges = [];
    }

    Distance(point1, point2) {
        return vec3.distance(
            vec3.fromValues(point2[0], point2[1], point2[2]),
            vec3.fromValues(point1[0], point1[1], point1[2])
        );
    }
}
