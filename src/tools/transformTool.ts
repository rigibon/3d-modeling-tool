import { Model } from "../model";
import { mat4, vec3, glMatrix, quat } from "gl-matrix";
import { UI } from "../UI/UI";
import { Entity } from "../Entity";
import { Tool } from "./tool";

export class TransformTool implements Tool {
    isActive: boolean = false;
    name: "Transform";
    model: Model;
    ui: UI;
    position: number[];
    pick: boolean = false;

    constructor(model: Model = null, ui: UI) {
        this.model = model;
        this.ui = ui;
    }

    use(modelToTransform: Entity = null, properties: any = null): void {
        this.translate(
            modelToTransform ? modelToTransform : null,
            properties ? properties : this.ui.properties
        );
        this.rotate(
            modelToTransform ? modelToTransform : null,
            properties ? properties : this.ui.properties
        );
        this.scale(
            modelToTransform ? modelToTransform : null,
            properties ? properties : this.ui.properties
        );
    }

    mouseDownCallback = (event: any): void => {};

    mouseMoveCallback = (event: any): void => {};

    mouseUpCallback = (event: any): void => {};

    translate(modelToTranslate: Entity = null, properties: any) {
        var entity: Entity = modelToTranslate
            ? modelToTranslate
            : properties.selectedEntity;

        var _translation = vec3.create();
        var _rotation = quat.create();
        var _scale = vec3.create();

        // // console.log(entity.worldMatrix);

        decompose(properties.selectedEntity.worldMatrix, _translation, _rotation, _scale);

        vec3.copy(_translation, properties.transformPosition);

        compose(_translation, _rotation, _scale, properties.selectedEntity.worldMatrix);
    }

    rotate(modelToRotate: Entity = null, properties: any) {
        var entity: Entity = modelToRotate
            ? modelToRotate
            : properties.selectedEntity;
        // var rotation: number[] = properties.transformRotation;
        // var newRotation: vec3 = vec3.fromValues(rotation[0], rotation[1], rotation[2]);
        // mat4.rotate(entity.worldMatrix, entity.worldMatrix, newRotation[0] * 0.1, [1, 0, 0]);
        // mat4.rotate(entity.worldMatrix, entity.worldMatrix, newRotation[1] * 0.1, [0, 1, 0]);
        // mat4.rotate(entity.worldMatrix, entity.worldMatrix, newRotation[2] * 0.1, [0, 0, 1]);
        // entity.rotation = newRotation;

        var _translation = vec3.create();
        var _rotation = quat.create();
        var _scale = vec3.create();

        decompose(entity.worldMatrix, _translation, _rotation, _scale);

        quat.rotateX(_rotation, _rotation, properties.rotationOffsetX);
        quat.rotateY(_rotation, _rotation, properties.rotationOffsetY);
        quat.rotateZ(_rotation, _rotation, properties.rotationOffsetZ);

        compose(_translation, _rotation, _scale, entity.worldMatrix);
    }

    scale(modelToScale: Entity = null, properties: any) {
        var entity: Entity = modelToScale
            ? modelToScale
            : properties.selectedEntity;
        var _translation = vec3.create();
        var _rotation = quat.create();
        var _scale = vec3.create();

        decompose(entity.worldMatrix, _translation, _rotation, _scale);

        vec3.copy(_scale, properties.transformScale);

        compose(_translation, _rotation, _scale, entity.worldMatrix);
    }
}

function decompose(
    srcMat: any,
    dstTranslation: any,
    dstRotation: any,
    dstScale: any
) {
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

function compose(
    srcTranslation: any,
    srcRotation: any,
    srcScale: any,
    dstMat: any
) {
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
