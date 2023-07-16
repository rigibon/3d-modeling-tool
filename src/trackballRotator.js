import { vec3, vec4, glMatrix, mat4 } from "gl-matrix";
import { Shader } from "./shader";

var _TMP_MAT = mat4.create();
var _TMP_VEC3_2 = [0.0, 0.0, 0.0];
var _TMP_VEC3 = [0.0, 0.0, 0.0];

export class TrackballCamera {
    name;
    position = vec3.fromValues(4.0, 4.0, 4.0);
    rotation = vec3.fromValues(0.0, 0.0, 0.0);
    worldMatrix = mat4.create();
    projectionMatrix = mat4.create();
    isSelected;
    show = true;
    type = "Trackball";
    active = false;
    unitx = new Array(3);
    unity = new Array(3);
    unitz = new Array(3);
    viewX;
    viewY;
    viewZ;
    center = [0, 1, 0];
    centerX;
    centerY;
    radius2;
    prevx;
    prevy;
    dragging = false;
    wantCaptureMouse = false;
    renderWindow = false;
    canvas;
    id = 0;
    rotX = 0.7;
    rotY = 2.3;
    lookAt;
    viewMatrix = mat4.create();
    views = mat4.create();
    lastValueX = 0;
    lastValueY = 0;
    up = vec3.fromValues(0.0, 1.0, 0.0);
    viewp;
    _viewport;
    _trans = [0.0, 0.0, 30.0];
    _usePivot = false; // if rotation is centered around the picked point
    _center = [0.0, 0.0, 0.0]; // center of rotation
    _offset = [0.0, 0.0, 0.0];
    _fov = Math.min(145, 150); // vertical field of view
    _quatRot = [0.0, 0.0, 0.0, 1.0]; // quaternion rotation
    defaultDistance = 10.0;
    distance = this.defaultDistance;
    viewp;

    constructor(
        gl,
        name,
        position,
        canvas,
        viewMatrix,
        projectionMatrix,
        lookAt,
        distance
    ) {
        this.name = name;
        this.position = position;
        this.viewMatrix = viewMatrix;
        this.projectionMatrix = projectionMatrix;

        this.canvas = canvas;

        this.distance = distance;

        this.viewp = [0, 0, this.canvas.clientWidth, this.canvas.clientHeight];

        mat4.perspective(
            this.projectionMatrix,
            (45.0 * Math.PI) / 180.0,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            100.0
        );

        this.setView(15, 15, 15, [15, 15, 15], [0, 1, 0]);

        this.views = mat4.create();
        // mat4.lookAt(this.views, vec3.fromValues(10.0, 10.0, 10.0), vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0));
        // // console.log(this.views);
        // mat4.lookAt(this.viewMatrix, vec3.fromValues(10.0, 10.0, 10.0), vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0));

        this.viewp = [
            0,
            0,
            this.canvas.clientWidth - 300,
            this.canvas.clientHeight - 50,
        ];

        var w2 = this.viewp[2] / 2.0;
        var h2 = this.viewp[3] / 2.0;

        this._viewport = mat4.fromValues(
            w2,
            0.0,
            0.0,
            0.0,
            0.0,
            h2,
            0.0,
            0.0,
            0.0,
            0.0,
            0.5,
            0.0,
            w2 + 0,
            h2 + 0,
            0.5,
            1.0
        ); // viewport matrix

        // this.lookAt = vec3.fromValues(-lookAt[0], -lookAt[1], -lookAt[2]);
        this.lookAt = vec3.fromValues(0, 0, 0);

        // this.renderWindow = true;
    }

    render(gl, shader) {
        // this.viewMatrix = this.getViewMatrix();
        this.newUpdate();

        // var position = this.getPosition();

        // mat4.lookAt(this.views, position, vec3.fromValues(0.0, 1.0, 0.0), this.up);
    }

    getTransZ() {
        return (this._trans[2] * 45) / this._fov;
    }

    newUpdate() {
        // this.rotX = 0.7;
        // this.rotY = 2.3;
        // this.distance = 1;
        var auxView = mat4.create();
        // this.lookAt = vec3.fromValues(0, 0, 0);
        mat4.translate(
            auxView,
            mat4.create(),
            vec3.fromValues(0.0, 0.0, -this.distance)
        );
        mat4.rotateX(auxView, auxView, this.rotX);
        mat4.rotateY(auxView, auxView, this.rotY);
        mat4.translate(auxView, auxView, this.lookAt);

        this.viewMatrix = auxView;
        // this.views = auxView;
    }

    setView(viewX, viewY, viewDistance, viewpointDirection, viewUp) {
        this.unitz =
            viewpointDirection === undefined
                ? [15, 15, 15]
                : viewpointDirection;
        viewUp = viewUp === undefined ? [0, 1, 0] : viewUp;
        this.viewZ = viewDistance;
        this.viewX = viewX;
        this.viewY = viewY;
        this.normalize(this.unitz, this.unitz);
        this.copy(this.unity, this.unitz);
        this.scales(this.unity, this.unity, this.dot(this.unitz, viewUp));
        this.subtract(this.unity, viewUp, this.unity);
        this.normalize(this.unity, this.unity);
        this.cross(this.unitx, this.unity, this.unitz);
    }

    getViewMatrix = () => {
        return this.viewMatrix;
        // var mat = [ this.unitx[0], this.unity[0], this.unitz[0], 0,
        //         this.unitx[1], this.unity[1], this.unitz[1], 0,
        //         this.unitx[2], this.unity[2], this.unitz[2], 0,
        //         0, 0, 0, 1 ];
        // if (this.center !== undefined) {

        //     var t0, t1, t2;

        //         t0 = - mat[0]*this.center[0] - mat[4]*this.center[1] - mat[8]*this.center[2];

        //         t1 = - mat[1]*this.center[0] - mat[5]*this.center[1] - mat[9]*this.center[2];

        //     t2 = this.center[2] - mat[2]*this.center[0] - mat[6]*this.center[1] - mat[10]*this.center[2];

        //     mat[12] = t0;
        //     mat[13] = t1;
        //     mat[14] = t2;
        // }
        // if (this.viewZ !== undefined) {
        //     mat[14] -= this.viewZ;
        // }
        // return mat;
    };

    computeWorldToScreenMatrix(mat) {
        mat4.mul(
            mat,
            mat4.mul(mat, this._viewport, this.projectionMatrix),
            this.views
        );
        return mat;
    }

    unproject(mouseX, mouseY, z) {
        var out = vec3.create();
        mat4.invert(_TMP_MAT, this.computeWorldToScreenMatrix(_TMP_MAT));
        return vec3.transformMat4(
            out,
            vec3.set(out, mouseX, this.viewp[3] - mouseY, z),
            _TMP_MAT
        );
    }

    project(vector) {
        var out = vec3.fromValues(0.0, 0.0, 0.0);
        vec3.transformMat4(
            out,
            vector,
            this.computeWorldToScreenMatrix(_TMP_MAT)
        );
        out[1] = this.viewp[2] - out[1];
        return out;
    }

    getViewDistance = () => {
        return this.viewZ;
    };

    setViewDistance = (viewDistance) => {
        this.viewZ = viewDistance;
    };

    getRotationCenter = () => {
        // return (this.center === undefined) ? [0,0,0] : this.center;
    };

    setRotationCenter = (rotationCenter) => {
        this.center = rotationCenter;
    };

    getPosition = () => {
        var viewmatrix = mat4.create();
        viewmatrix = this.getViewMatrix();

        var inverseView = mat4.create();
        mat4.invert(inverseView, viewmatrix);

        var row = [
            inverseView[12],
            inverseView[13],
            inverseView[14],
            inverseView[15],
        ];

        return vec3.fromValues(row[0], row[1], row[2]);
    };

    applyTransvection = (e1, e2) => {
        // rotate vector e1 onto e2
        function reflectInAxis(axis, source, destination) {
            var s =
                2 *
                (axis[0] * source[0] +
                    axis[1] * source[1] +
                    axis[2] * source[2]);
            destination[0] = s * axis[0] - source[0];
            destination[1] = s * axis[1] - source[1];
            destination[2] = s * axis[2] - source[2];
        }
        this.normalize(e1, e1);
        this.normalize(e2, e2);
        var e = [0, 0, 0];
        this.add(e, e1, e2);
        this.normalize(e, e);
        var temp = [0, 0, 0];
        reflectInAxis(e, this.unitz, temp);
        reflectInAxis(e1, temp, this.unitz);
        reflectInAxis(e, this.unitx, temp);
        reflectInAxis(e1, temp, this.unitx);
        reflectInAxis(e, this.unity, temp);
        reflectInAxis(e1, temp, this.unity);
    };

    mousePressCallback = (evt) => {
        if (evt.button === 1 && !this.wantCaptureMouse) {
            if (this.dragging) return;
            this.dragging = true;
            this.centerX = this.canvas.clientWidth / 2;
            this.centerY = this.canvas.clientHeight / 2;
            var radius = Math.min(this.centerX, this.centerY);
            this.radius2 = radius * radius;
            // document.addEventListener("mousemove", this.doMouseDrag, false);
            // document.addEventListener("mouseup", this.doMouseUp, false);
            var box = this.canvas.getBoundingClientRect();
            this.prevx = evt.clientX - box.left;
            this.prevy = evt.clientY - box.top;
        }
    };

    mouseMoveCallback = (evt) => {
        if (!this.wantCaptureMouse) {
            var dx = evt.clientX - this.lastValueX;
            var dy = evt.clientY - this.lastValueY;
            this.lastValueX = evt.clientX;
            this.lastValueY = evt.clientY;
    
            if (!this.dragging) return;
            var box = this.canvas.getBoundingClientRect();
            var x = evt.clientX - box.left;
            var y = evt.clientY - box.top;
            var ray1 = this.toRay(this.prevx, this.prevy);
            var ray2 = this.toRay(x, y);
            this.applyTransvection(ray1, ray2);
            this.prevx = x;
            this.prevy = y;
    
            this.rotY += (dx * 0.25 * Math.PI) / 180;
            this.rotX += (dy * 0.25 * Math.PI) / 180;
            // this.newUpdate();
            // if (callback) {
            //     callback();
            // }
        }
    };

    mouseUpCallback = (evt) => {
        if (this.dragging && !this.wantCaptureMouse) {
            // document.removeEventListener("mousemove", this.doMouseDrag, false);
            // document.removeEventListener("mouseup", this.doMouseUp, false);
            this.dragging = false;
        }
    };

    zoomCallback = (event) => {
        if (!this.wantCaptureMouse) {
            // if (this.renderWindow) {
            //     if (event.deltaY > 0) {
            //         this.viewZ += 0.4;
            //     } else {
            //         this.viewZ -= 0.4;
            //     }
            // }

            var delta = 0;

            if (event.wheelDelta) {
                delta = event.wheelDelta / 120;
            } else if (event.detail) {
                delta = -event.detail / 3;
            }

            if (delta) {
                this.distance -= delta * (this.defaultDistance / 10.0) * 0.5;
                this.distance = Math.max(
                    this.defaultDistance / 10.0,
                    this.distance
                );
            }
        }
    };

    toRay = (x, y) => {
        // converts a point (x,y) in pixel coords to a 3D ray by mapping interior of
        // a circle in the plane to a hemisphere with that circle as equator.
        var dx = x - this.centerX;
        var dy = this.centerY - y;
        var vx = dx * this.unitx[0] + dy * this.unity[0]; // The mouse point as a vector in the image plane.
        var vy = dx * this.unitx[1] + dy * this.unity[1];
        var vz = dx * this.unitx[2] + dy * this.unity[2];
        var dist2 = vx * vx + vy * vy + vz * vz;
        if (dist2 > this.radius2) {
            // Map a point ouside the circle to itself
            return [vx, vy, vz];
        } else {
            var z = Math.sqrt(this.radius2 - dist2);
            return [
                vx + z * this.unitz[0],
                vy + z * this.unitz[1],
                vz + z * this.unitz[2],
            ];
        }
    };

    dot(v, w) {
        return v[0] * w[0] + v[1] * w[1] + v[2] * w[2];
    }

    length(v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    }

    normalize = (v, w) => {
        var d = this.length(w);
        v[0] = w[0] / d;
        v[1] = w[1] / d;
        v[2] = w[2] / d;
    };

    copy(v, w) {
        v[0] = w[0];
        v[1] = w[1];
        v[2] = w[2];
    }

    add(sum, v, w) {
        sum[0] = v[0] + w[0];
        sum[1] = v[1] + w[1];
        sum[2] = v[2] + w[2];
    }

    subtract(dif, v, w) {
        dif[0] = v[0] - w[0];
        dif[1] = v[1] - w[1];
        dif[2] = v[2] - w[2];
    }

    scales(ans, v, num) {
        ans[0] = v[0] * num;
        ans[1] = v[1] * num;
        ans[2] = v[2] * num;
    }

    cross(c, v, w) {
        var x = v[1] * w[2] - v[2] * w[1];
        var y = v[2] * w[0] - v[0] * w[2];
        var z = v[0] * w[1] - v[1] * w[0];
        c[0] = x;
        c[1] = y;
        c[2] = z;
    }
}
