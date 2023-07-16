import { Model } from "../model";
import { mat4, vec3, glMatrix } from "gl-matrix";
import { UI } from "../UI/UI";
import { Entity } from "../entity";
import { Tool } from "./tool";
import { getIntersectedPoint } from "../geometry/algorithms";
import { SocketHandler } from "../sockets/socketHandler";
import { Utils } from "../test/utils.js";
import Subdivision from "../test/subdivision.js";

export class SculptTool implements Tool {
    isActive: boolean = false;
    name: "Sculpt";
    active: boolean = false;
    ui: UI;
    socketHandler: SocketHandler;
    pick: boolean = false;

    factor = 50;

    _lastMouseX = 0;
    _lastMouseY = 0;
    mouseX = 0;
    mouseY = 0;
    newMesh: any;

    modifiedVertices: number[] = [];

    meshToSculpt: any = null;

    constructor(
        model: Model = null,
        ui: UI,
        socketHandler: SocketHandler,
        mesh: any,
        picking: any,
        newCamera: any,
        canvas: any
    ) {
        this.name = "Sculpt";
        this.ui = ui;
        this.socketHandler = socketHandler;
        this.newMesh = mesh;

        socketHandler.socket.on("getFromServer", (data) => {
            // var vAr = this.newMesh.getVertices();
            // var int8view = new Uint32Array(data.iVertsInRadius);
            // // console.log("-----------");
            // // console.log(int8view.length);
            // // console.log(data.modifiedVertices);
            // for (var i = 0, j = 0; j < data.modifiedVertices.length; i++, j += 3) {
            //   var ind = int8view[i] * 3;
            //   vAr[ind] = data.modifiedVertices[j];
            //   vAr[ind + 1] = data.modifiedVertices[j + 1];
            //   vAr[ind + 2] = data.modifiedVertices[j + 2];
            // }
            // this.flatten(this.newMesh, int8view, data.aNormal, data.aCenter, data.center, data.radiusSquared, this.ui.properties.strength / 100, null);
            // this.newMesh.updateGeometry(this.newMesh.getFacesFromVertices(int8view), int8view);
            // this.newMesh.updateGeometryBuffers();
        });

        window.addEventListener("mousemove", (event) => {
            if (this.isActive) {
                this.mouseX = event.clientX;
                this.mouseY = event.clientY;

                if (this.pick && this.meshToSculpt) {
                    // if (this.ui.properties.meshExtruded) {
                    //     picking.setLocalRadius2(this.ui.properties.lastRadius);
                    //     // console.log("ACA");
                    //     // console.log(picking.getLocalRadius2());
                    //     this.ui.properties.meshExtruded = false;
                    // }

                    // console.log(picking.getLocalRadius2());
                    picking.intersectionMouseMesh(
                        canvas,
                        this.ui.properties.scene.sculptCamera,
                        this.meshToSculpt,
                        event.clientX,
                        event.clientY,
                        this.ui.properties.selectedEntity.worldMatrix
                    );
                    picking.pickVerticesInSphere(
                        picking.getLocalRadius2() * this.ui.properties.brushSize
                    );
                    picking.computePickedNormal();
                    this.sculptStroke(
                        canvas,
                        this.ui.properties.scene.sculptCamera,
                        this.meshToSculpt,
                        picking,
                        this.mouseX,
                        this.mouseY,
                        0,
                        null,
                        this.ui.properties.selectedEntity.worldMatrix
                    );
                }
            }
        });

        window.addEventListener("mousedown", (event) => {
            if (this.isActive) {
                // if (this.ui.properties.meshExtruded) {
                //     picking.setLocalRadius2(this.ui.properties.lastRadius);
                //     // console.log("ACA");
                //     // // console.log(picking.getLocalRadius2());
                //     this.ui.properties.meshExtruded = false;
                // }

                this.meshToSculpt = picking.intersectionMouseMeshes(
                    this.ui.properties.selectedEntity.topMeshes,
                    event.clientX,
                    event.clientY,
                    this.ui.properties.scene.sculptCamera,
                    canvas,
                    this.ui.properties.selectedEntity.worldMatrix
                );

                this._lastMouseX = event.clientX;
                this._lastMouseY = event.clientY;

                this.mouseX = event.clientX;
                this.mouseY = event.clientY;

                if (event.button === 0) {
                    this.pick = true;
                }
            }
        });

        window.addEventListener("mouseup", (event) => {
            this.pick = false;
        });
    }

    mouseDownCallback = (event: any): void => {
        if (event.button === 2) {
            this.active = true;
        }
    };

    mouseMoveCallback = (event: any): void => {
        if (this.active) {
            getIntersectedPoint(
                event,
                this.ui.gl,
                this.ui.properties.scene.sculptCamera,
                this.ui.properties.scene.selectedEntity,
                this.ui.canvas,
                7 / 50,
                1 / 5,
                this.socketHandler
            );
        }
    };

    mouseUpCallback = (event: any): void => {
        if (event.button === 2) {
            this.active = false;
        }
    };

    use(): void {}

    stroke(mesh: any, picking: any, socket: any) {
        var iVertsInRadius = picking.getPickedVertices();
        var intensity = 50.0;

        iVertsInRadius = this.dynamicTopology(mesh, picking);

        var iVertsFront = this.getFrontVertices(
            mesh,
            iVertsInRadius,
            picking.getEyeDirection()
        );
        // // console.log(picking.getIntersectionPoint());
        var r2 = picking.getLocalRadius2();

        // // console.log(picking.getWorldRadius2());

        picking.updateAlpha(false);
        picking.setIdAlpha(0);

        // // console.log(iVertsInRadius);
        // if (!this._clay) {
        // brush(mesh, iVertsInRadius, picking.getPickedNormal(), picking.getIntersectionPoint(), r2, intensity, picking);
        // } else {
        var aNormal = this.areaNormal(mesh, iVertsInRadius);
        // if (!aNormal)
        //   return;

        var aCenter = this.areaCenter(mesh, iVertsFront);
        var off = Math.sqrt(r2) * 0.1;

        // @ts-ignore
        vec3.scaleAndAdd(aCenter, aCenter, aNormal, off);

        if (this.ui.properties.negativeSculpt) {
            this.ui.properties.strength = -Math.abs(this.ui.properties.strength);
        } else {
            this.ui.properties.strength = Math.abs(this.ui.properties.strength);
        }

        this.flatten(
            mesh,
            iVertsInRadius,
            aNormal,
            aCenter,
            picking.getIntersectionPoint(),
            r2 * this.ui.properties.brushSize,
            this.ui.properties.strength / 50,
            picking
        );
        // }

        // flatten(mesh, iVertsInRadius, aNormal, aCenter, center, radiusSquared, intensity, picking);

        // var data = {
        //   iVertsInRadius: iVertsInRadius,
        //   aNormal: aNormal,
        //   aCenter: aCenter,
        //   center: picking.getIntersectionPoint(),
        //   radiusSquared: r2 / this.factor,
        //   intensity: 0.015
        // };

        // var data = {
        //   iVertsInRadius: iVertsInRadius,
        //   modifiedVertices: this.modifiedVertices
        // }

        // this.socketHandler.socket.emit("sendToServer", data);

        // this.modifiedVertices = [];

        // this.socketHandler.sendSculptDataToServer(data);

        mesh.updateGeometry(
            mesh.getFacesFromVertices(iVertsInRadius),
            iVertsInRadius
        );
    }

    dynamicTopology(mesh: any, picking: any) {
        var iVerts = picking.getPickedVertices();
        if (!mesh.isDynamic) return iVerts;

        var subFactor = mesh.getSubdivisionFactor();
        var decFactor = mesh.getDecimationFactor();
        if (subFactor === 0.0 && decFactor === 0.0) return iVerts;

        if (iVerts.length === 0) {
            iVerts = mesh.getVerticesFromFaces([picking.getPickedFace()]);
            // undo-redo
            //   this._main.getStateManager().pushVertices(iVerts);
        }

        var iFaces = mesh.getFacesFromVertices(iVerts);
        var radius2 = picking.getLocalRadius2();
        var center = picking.getIntersectionPoint();
        var d2Max = radius2 * (1.1 - subFactor) * 0.2;
        var d2Min = (d2Max / 4.2025) * decFactor;

        // undo-redo
        // this._main.getStateManager().pushFaces(iFaces);

        // if (subFactor)
        //   iFaces = mesh.subdivide(iFaces, center, radius2, d2Max, this._main.getStateManager());
        // if (decFactor)
        //   iFaces = mesh.decimate(iFaces, center, radius2, d2Min, this._main.getStateManager());
        // iVerts = mesh.getVerticesFromFaces(iFaces);

        var nbVerts = iVerts.length;
        var sculptFlag = Utils.SCULPT_FLAG;
        var vscf = mesh.getVerticesSculptFlags();
        var iVertsInRadius = new Uint32Array(
            Utils.getMemory(nbVerts * 4),
            0,
            nbVerts
        );
        var acc = 0;
        for (var i = 0; i < nbVerts; ++i) {
            var iVert = iVerts[i];
            if (vscf[iVert] === sculptFlag) iVertsInRadius[acc++] = iVert;
        }

        iVertsInRadius = new Uint32Array(iVertsInRadius.subarray(0, acc));
        mesh.updateTopology(iFaces, iVerts);
        mesh.updateGeometry(iFaces, iVerts);

        return iVertsInRadius;
    }

    getFrontVertices(mesh: any, iVertsInRadius: any, eyeDir: any) {
        var nbVertsSelected = iVertsInRadius.length;
        var iVertsFront = new Uint32Array(
            Utils.getMemory(4 * nbVertsSelected),
            0,
            nbVertsSelected
        );
        var acc = 0;
        var nAr = mesh.getNormals();
        var eyeX = eyeDir[0];
        var eyeY = eyeDir[1];
        var eyeZ = eyeDir[2];
        for (var i = 0; i < nbVertsSelected; ++i) {
            var id = iVertsInRadius[i];
            var j = id * 3;
            if (nAr[j] * eyeX + nAr[j + 1] * eyeY + nAr[j + 2] * eyeZ <= 0.0)
                iVertsFront[acc++] = id;
        }
        return new Uint32Array(iVertsFront.subarray(0, acc));
    }

    areaNormal(mesh: any, iVerts: any) {
        var nAr = mesh.getNormals();
        var mAr = mesh.getMaterials();
        var anx = 0.0;
        var any = 0.0;
        var anz = 0.0;
        for (var i = 0, l = iVerts.length; i < l; ++i) {
            var ind = iVerts[i] * 3;
            var f = mAr[ind + 2];
            anx += nAr[ind] * f;
            any += nAr[ind + 1] * f;
            anz += nAr[ind + 2] * f;
        }

        var len = Math.sqrt(anx * anx + any * any + anz * anz);
        if (len === 0.0) {
            return;
        }

        len = 1.0 / len;
        return [anx * len, any * len, anz * len];
    }

    areaCenter(mesh: any, iVerts: any) {
        var vAr = mesh.getVertices();
        var mAr = mesh.getMaterials();
        var nbVerts = iVerts.length;
        var ax = 0.0;
        var ay = 0.0;
        var az = 0.0;
        var acc = 0;
        for (var i = 0; i < nbVerts; ++i) {
            var ind = iVerts[i] * 3;
            var f = mAr[ind + 2];
            acc += f;
            ax += vAr[ind] * f;
            ay += vAr[ind + 1] * f;
            az += vAr[ind + 2] * f;
        }
        return [ax / acc, ay / acc, az / acc];
    }

    flatten(
        mesh: any,
        iVertsInRadius: any,
        aNormal: any,
        aCenter: any,
        center: any,
        radiusSquared: any,
        intensity: any,
        picking: any
    ) {
        var vAr = mesh.getVertices();
        var mAr = mesh.getMaterials();
        var radius = Math.sqrt(radiusSquared);
        var vProxy = vAr;
        var cx = center[0];
        var cy = center[1];
        var cz = center[2];
        var ax = aCenter[0];
        var ay = aCenter[1];
        var az = aCenter[2];
        var anx = aNormal[0];
        var any = aNormal[1];
        var anz = aNormal[2];
        var comp = 1.0;

        for (var i = 0, l = iVertsInRadius.length; i < l; ++i) {
            var ind = iVertsInRadius[i] * 3;
            var vx = vAr[ind];
            var vy = vAr[ind + 1];
            var vz = vAr[ind + 2];
            var distToPlane =
                (vx - ax) * anx + (vy - ay) * any + (vz - az) * anz;
            if (distToPlane * comp > 0.0) {
                continue;
            }

            var dx = vProxy[ind] - cx;
            var dy = vProxy[ind + 1] - cy;
            var dz = vProxy[ind + 2] - cz;
            var dist = Math.sqrt(dx * dx + dy * dy + dz * dz) / radius;
            if (dist >= 1.0) {
                continue;
            }

            var fallOff = dist * dist;
            fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
            fallOff *= distToPlane * intensity * mAr[ind + 2] * 1.0;
            vAr[ind] -= anx * fallOff;
            vAr[ind + 1] -= any * fallOff;
            vAr[ind + 2] -= anz * fallOff;
        }
    }

    brush(
        mesh: any,
        iVertsInRadius: any,
        aNormal: any,
        center: any,
        radiusSquared: any,
        intensity: any,
        picking: any
    ) {
        // intensity = 2.0;
        var vAr = mesh.getVertices();
        var mAr = mesh.getMaterials();
        var vProxy = mesh.getVerticesProxy();
        var radius = Math.sqrt(radiusSquared);
        var deformIntensityBrush =
            intensity * (Math.log(radius) / this.factor) * 0.5;
        var cx = center[0];
        var cy = center[1];
        var cz = center[2];
        var anx = aNormal[0];
        var any = aNormal[1];
        var anz = aNormal[2];
        for (var i = 0, l = iVertsInRadius.length; i < l; ++i) {
            var ind = iVertsInRadius[i] * 3;
            var dx = vProxy[ind] - cx;
            var dy = vProxy[ind + 1] - cy;
            var dz = vProxy[ind + 2] - cz;
            var dist = Math.sqrt(dx * dx + dy * dy + dz * dz) / radius;
            if (dist >= 1.0) continue;
            var vx = vAr[ind];
            var vy = vAr[ind + 1];
            var vz = vAr[ind + 2];
            var fallOff = dist * dist;
            fallOff = 3.0 * fallOff * fallOff - 4.0 * fallOff * dist + 1.0;
            fallOff *=
                mAr[ind + 2] *
                deformIntensityBrush *
                picking.getAlpha(vx, vy, vz);
            vAr[ind] = vx + anx * fallOff;
            vAr[ind + 1] = vy + any * fallOff;
            vAr[ind + 2] = vz + anz * fallOff;
        }
    }

    subdivideClamp(mesh: any, linear: any) {
        Subdivision.LINEAR = !!linear;
        // mesh.addLevel();
        while (mesh.getNbFaces() < 50000) mesh.addLevel();
        // keep at max 4 multires
        mesh._meshes.splice(0, Math.min(mesh._meshes.length - 4, 4));
        mesh._sel = mesh._meshes.length - 1;
        Subdivision.LINEAR = false;
    }

    sculptStroke(
        canvas: any,
        camera: any,
        mesh: any,
        picking: any,
        mouseX: any,
        mouseY: any,
        radius: any,
        socket: any,
        worldMatrix: any
    ) {
        radius = 50;
        var dx = mouseX - this._lastMouseX;
        var dy = mouseY - this._lastMouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var minSpacing = 0.15 * radius * 1.0;

        if (dist <= minSpacing) return;

        var step = 1.0 / Math.floor(dist / minSpacing);
        dx *= step;
        dy *= step;
        var mouseXs = this._lastMouseX + dx;
        var mouseYs = this._lastMouseY + dy;

        // picking.intersectionMouseMesh(canvas, camera, mesh, mouseX, mouseY);
        // picking.pickVerticesInSphere(picking.getLocalRadius2() / 1000);
        // picking.computePickedNormal();
        // // console.log(picking.getIntersectionPoint());
        // picking.pickVerticesInSphere(picking.getLocalRadius2() / 2500);
        // picking.computePickedNormal();

        // stroke(mesh, picking);

        // makeStroke(canvas, camera, mesh, mouseX, mouseY, picking);
        // stroke(canvas, camera, mesh, picking, mouseX, mouseY, picking.getLocalRadius2() / 1000);

        // makeStroke(canvas, camera, mesh, mouseX, mouseY, picking);

        var a = 0;

        for (var i = step; i <= 1.0; i += step) {
            if (
                !this.makeStroke(
                    canvas,
                    camera,
                    mesh,
                    mouseXs,
                    mouseYs,
                    picking,
                    socket,
                    worldMatrix
                )
            )
                break;

            mouseXs += dx;
            mouseYs += dy;
        }

        mesh.updateGeometryBuffers();

        this._lastMouseX = mouseX;
        this._lastMouseY = mouseY;
    }

    makeStroke(
        canvas: any,
        camera: any,
        mesh: any,
        mouseX: any,
        mouseY: any,
        picking: any,
        socket: any,
        worldMatrix: any
    ) {
        if (this.ui.properties.meshExtruded) {
            picking.setLocalRadius2(this.ui.properties.lastRadius);
            // console.log("ACA");
            // console.log(picking.getLocalRadius2());
            this.ui.properties.meshExtruded = false;
        }

        picking.intersectionMouseMesh(
            canvas,
            camera,
            mesh,
            mouseX,
            mouseY,
            worldMatrix
        );

        var pick1 = mesh;
        if (pick1) {
            picking.pickVerticesInSphere(
                picking.getLocalRadius2() * this.ui.properties.brushSize
            );
            picking.computePickedNormal();
        }

        var dynTopo = mesh.isDynamic;

        this.stroke(mesh, picking, socket);
        return pick1;
    }
}
