import { vec3, vec4, glMatrix, mat4 } from "gl-matrix";

export class Quaternion {
    constructor(cosine = 0.0, axis = vec3.fromValues(1.0, 0.0, 0.0)) {
        this._cosine = cosine;
        this._axis = axis;
    }

    set cosine(cosine) {
        this._cosine = cosine;
    }

    set axis(axis) {
        this._axis = axis;
    }

    get cosine() {
        return this._cosine;
    }

    get axis() {
        return this._axis;
    }
};