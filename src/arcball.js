import { Quaternion } from "./quaternion.js";
import { vec3, vec4, glMatrix, mat4 } from "gl-matrix";

export class Arcball {
    constructor(SCR_WIDTH, SCR_HEIGHT, gl) {
        this.position = vec3.fromValues(0.0, 0.0, -5.0);
        this.startPos = vec3.create();
        this.currentPos = vec3.create();
        this.startPosUnitVector = vec3.create();
        this.currentPosUnitVector = vec3.create();
        this.gl = gl;
        this.viewMatrix = mat4.create();
        this.camPos = vec3.create();

        this.currentQuaternion = new Quaternion();
        this.lastQuaternion = new Quaternion(0.0, vec3.fromValues(1.0, 0.0, 0.0));

        this.RADIUS = 1.0; //radius o the sphere
        this.flag = false; // a signal or mouse click.
        this.SCR_WIDTH = SCR_WIDTH;
        this.SCR_HEIGHT = SCR_HEIGHT;
        this.Zoom = 45.0;

        this.cosValue;
        this.cosValue_2;
        this.theta;
        this.angle = 180.0;
        this.rotationalAxis = vec3.fromValues(1.0, 0.0, 0.0);                       
        this.rotationalAxis_2 = vec3.create();
    }

    z_axis(x, y) {
        var z = 0.0;
        if(Math.sqrt((x * x) + (y * y)) <= this.RADIUS) {
            z = Math.sqrt((this.RADIUS * this.RADIUS) - (x * x) - (y * y));
        }
        return z;
    }

    getUnitVector(vector) {
        var magnitude1;
        var unitVector = vec3.create(); 
        magnitude1 = (vector[0] * vector[0]) + (vector[1] * vector[1]) + (vector[2] * vector[2]); 
        magnitude1 = Math.sqrt(magnitude1);
        if(magnitude1 == 0) {
            unitVector[0] = 0;
            unitVector[1] = 0;
            unitVector[2] = 0;
        }
        else {
            unitVector[0] = vector[0] / magnitude1;
            unitVector[1] = vector[1] / magnitude1;
            unitVector[2] = vector[2] / magnitude1;
        }
        return unitVector;    
    }

    dotProduct() {
        var result = (this.startPosUnitVector[0] * this.currentPosUnitVector[0]) + (this.startPosUnitVector[1] * this.currentPosUnitVector[1]) + (this.startPosUnitVector[2] * this.currentPosUnitVector[2]);
        return result;
    }

    rotation() {
        this.startPosUnitVector = this.getUnitVector(this.startPos);
        this.currentPosUnitVector = this.getUnitVector(this.currentPos);
        vec3.cross(this.currentQuaternion.axis, this.startPosUnitVector, this.currentPosUnitVector);
        this.currentQuaternion.axis = this.getUnitVector(this.currentQuaternion.axis);
        
        this.cosValue = this.dotProduct(); //q0 is cosine of the angle here.
        
        if (this.cosValue > 1) {
            this.cosValue = 1; // when dot product gives '1' as result, it doesn't equal to 1 actually. It equals to just like 1.00000000001 . 
        }
            
        this.theta = (Math.acos(this.cosValue) * 180 / 3.1416); //theta is the angle now.
        this.currentQuaternion.cosine = Math.cos((this.theta / 2) * 3.1416 / 180); //currentQuaternion.cosine is cos of half the angle now.
        
        this.currentQuaternion.axis[0] = this.currentQuaternion.axis[0] * Math.sin((this.theta / 2) * 3.1416 / 180) * 2.8;
        this.currentQuaternion.axis[1] = this.currentQuaternion.axis[1] * Math.sin((this.theta / 2) * 3.1416 / 180) * 2.8;
        this.currentQuaternion.axis[2] = this.currentQuaternion.axis[2] * Math.sin((this.theta / 2) * 3.1416 / 180) * 2.8;
        
        var dot_currentQuaternions = vec3.dot(this.currentQuaternion.axis, this.lastQuaternion.axis);
        
        this.cosValue_2 = (this.currentQuaternion.cosine * this.lastQuaternion.cosine) - dot_currentQuaternions;
        
        var temporaryVector = vec3.create();

        vec3.cross(temporaryVector, this.currentQuaternion.axis, this.lastQuaternion.axis);
        

        this.rotationalAxis_2[0] = (this.currentQuaternion.cosine * this.lastQuaternion.axis[0]) + 
                                (this.lastQuaternion.cosine * this.currentQuaternion.axis[0] ) +
                                temporaryVector[0];

        this.rotationalAxis_2[1] = (this.currentQuaternion.cosine * this.lastQuaternion.axis[1]) + 
                                (this.lastQuaternion.cosine * this.currentQuaternion.axis[1] ) +
                                temporaryVector[1];

        this.rotationalAxis_2[2] = (this.currentQuaternion.cosine * this.lastQuaternion.axis[2]) + 
                                (this.lastQuaternion.cosine * this.currentQuaternion.axis[2] ) +
                                temporaryVector[2];

        //ANGLE SE VUELVE NULL PORQUE COSVALUE_2 ES > 1
        this.angle = (Math.acos(this.cosValue_2) * 180 / 3.1416) * 2;
    
        this.rotationalAxis[0] = this.rotationalAxis_2[0] / Math.sin((this.angle / 2) * 3.1416 / 180);
        this.rotationalAxis[1] = this.rotationalAxis_2[1] / Math.sin((this.angle / 2) * 3.1416 / 180);
        this.rotationalAxis[2] = this.rotationalAxis_2[2] / Math.sin((this.angle / 2) * 3.1416 / 180);
    }

    replace() {
        this.lastQuaternion.cosine = this.cosValue_2;
        this.lastQuaternion.axis = this.getUnitVector(this.rotationalAxis_2);
    }

    update(viewMatrix) {
        // VIEW MATRIX
        mat4.translate(this.viewMatrix, this.viewMatrix, this.position);

        mat4.rotate(this.viewMatrix, this.viewMatrix, glMatrix.toRadian(this.angle), this.rotationalAxis);

        // CAMERA POSITION
        var inverseView = mat4.create(); 
        mat4.invert(inverseView, viewMatrix);

        var row = [inverseView[12], inverseView[13], inverseView[14], inverseView[15]];

        this.camPos = vec3.fromValues(row[0], row[1], row[2]);
    }

    getInverseView() {
        var inverseView = mat4.create(); 
        mat4.invert(inverseView, this.viewMatrix);

        return inverseView;
    }
}