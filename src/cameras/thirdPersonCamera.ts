import { glMatrix, vec3, mat4 } from "gl-matrix";
import { Shader } from "../shader";
import { Camera } from "./camera";

export class ThirdPersonCamera extends Camera {
    viewMatrix: mat4;
    projectionMatrix: mat4 = mat4.create();
    front: vec3 = vec3.fromValues(0.0, 0.0, -1.0);
    position: vec3 = vec3.fromValues(0.0, 0.0, 12.0);
    pos: vec3 = vec3.fromValues(0.0, 0.0, 12.0);
    rotation: vec3 = vec3.fromValues(0.0, 0.0, 0.0);
    scale: vec3;
    up: vec3 = vec3.create();
    firstMouse: boolean;
    lastX: number;
    lastY: number;
    yaw: number;
    pitch: number;
    freeView: boolean = false;
    dragView: boolean = false;
    show: boolean = true;
    type: string = "Free";
    active: boolean = false;
    io: any;
    wantCaptureMouse: boolean = false;
    renderWindow: boolean = false;
    id: number = 0;

    constructor(
        gl: any,
        name: string,
        position: vec3,
        io: any,
        canvas: any,
        viewMatrix?: mat4,
        projectionMatrix?: mat4
    ) {
        super(name, position, viewMatrix, projectionMatrix);

        this.viewMatrix = mat4.create();
        var eye: vec3 = position;
        var center: vec3 = vec3.fromValues(0.0, 0.0, 0.0);
        this.up = vec3.fromValues(0.0, 1.0, 0.0);
        mat4.lookAt(this.viewMatrix, eye, center, this.up);

        mat4.perspective(
            this.projectionMatrix,
            (45.0 * Math.PI) / 180.0,
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            0.1,
            100.0
        );

        this.lastX = gl.canvas.clientWidth / 2;
        this.lastY = gl.canvas.clientHeight / 2;
        this.front = vec3.fromValues(0.0, 0.0, -1.0);
        this.pitch = 0.0;
        this.yaw = -90.0;
        this.firstMouse = true;

        this.io = io;
    }

    getPosition() {
        var view = mat4.create();
        view = this.viewMatrix;

        var inverseView = mat4.create();
        mat4.invert(inverseView, view);

        var row = [
            inverseView[12],
            inverseView[13],
            inverseView[14],
            inverseView[15],
        ];

        return vec3.fromValues(row[0], row[1], row[2]);
    }

    render(gl: any, shader: Shader): void {
        this.update();
    }

    update(): void {
        var newPosition: vec3 = vec3.create();
        vec3.add(newPosition, this.pos, this.front);
        mat4.lookAt(this.viewMatrix, this.pos, newPosition, this.up);
        mat4.rotate(
            this.viewMatrix,
            this.viewMatrix,
            this.rotation[0],
            [1, 0, 0]
        );
        mat4.rotate(
            this.viewMatrix,
            this.viewMatrix,
            this.rotation[1],
            [0, 1, 0]
        );
        mat4.rotate(
            this.viewMatrix,
            this.viewMatrix,
            this.rotation[2],
            [0, 0, 1]
        );
    }

    setNormalMatrix(worldMatrix: mat4, shader: Shader): void {
        var inverseViewMatrix: mat4 = mat4.create();
        var modelViewMatrix: mat4 = mat4.create();

        mat4.invert(inverseViewMatrix, this.viewMatrix);
        mat4.multiply(modelViewMatrix, worldMatrix, inverseViewMatrix);
        mat4.transpose(modelViewMatrix, modelViewMatrix);
        mat4.invert(modelViewMatrix, modelViewMatrix);

        shader.setMat4("normalMatrix", modelViewMatrix);
    }

    keyUpCallback(event: any): void {}

    keyPressCallback(event: any): void {}

    mousePressCallback = (event: any): void => {
        if (!this.wantCaptureMouse) {
            if (event.button === 1) {
                this.freeView = true;
            }

            if (event.button === 0) {
                this.dragView = true;
            }
        }
    };

    mouseUpCallback = (event: any): void => {
        if (!this.wantCaptureMouse) {
            this.freeView = false;
            this.dragView = false;
        }
    };

    mouseMoveCallback = (event: any): void => {
        if (!this.wantCaptureMouse) {
            var cameraSpeed = 0.8; // adjust accordingly
            var smooth = vec3.create();
            var result = vec3.create();

            var xpos = event.clientX,
                ypos = event.clientY;

            if (this.firstMouse) {
                this.lastX = xpos;
                this.lastY = ypos;
                this.firstMouse = false;
            }

            var xoffset = (xpos - this.lastX) * 0.28;
            var yoffset = (this.lastY - ypos) * 0.28;

            var x_offset = (this.lastX - xpos) * 0.01;
            var y_offset = (ypos - this.lastY) * 0.01;
            this.lastX = xpos;
            this.lastY = ypos;

            if (this.freeView) {
                const sensitivity = 0.5;
                xoffset *= sensitivity;
                yoffset *= sensitivity;

                this.yaw += xoffset;
                this.pitch += yoffset;

                var direction: vec3 = vec3.create();
                direction[0] =
                    Math.cos(glMatrix.toRadian(this.yaw)) *
                    Math.cos(glMatrix.toRadian(this.pitch));
                direction[1] = Math.sin(glMatrix.toRadian(this.pitch));
                direction[2] =
                    Math.sin(glMatrix.toRadian(this.yaw)) *
                    Math.cos(glMatrix.toRadian(this.pitch));

                vec3.normalize(this.front, direction);
            }

            if (this.dragView) {
                vec3.scale(smooth, this.up, cameraSpeed);

                vec3.scale(smooth, smooth, y_offset);

                vec3.add(this.pos, this.pos, smooth);

                vec3.scale(smooth, this.up, cameraSpeed);

                vec3.scale(smooth, smooth, y_offset);

                vec3.add(this.pos, this.pos, smooth);

                vec3.scale(smooth, this.up, cameraSpeed);

                vec3.scale(smooth, smooth, x_offset);

                vec3.cross(result, this.front, this.up);
                vec3.scale(result, result, x_offset);
                vec3.add(this.pos, this.pos, result);
            }
        }
    };

    zoomCallback = (event: any) => {
        if (!this.wantCaptureMouse) {
            if (event.deltaY > 0) {
                vec3.subtract(this.pos, this.pos, this.front);
            } else {
                vec3.add(this.pos, this.pos, this.front);
            }
        }
    };
}
