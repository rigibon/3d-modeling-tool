import { Camera } from "./cameras/camera";

export class WebGLContext {
    gl: any;

    constructor(canvas: any) {
        canvas.width = 1366;
        canvas.height = 768;
        this.gl = canvas.getContext("webgl2", {
            preserveDrawingBuffer: true,
            stencil: true,
            antialias: true,
        });
        // this.gl.viewport(0, 0, canvas.clientWidth  , canvas.clientHeight  );
        // const ext = this.gl.getExtension("WEBGL_depth_texture");
    }

    removeCallbacks(lastCamera: Camera, ui: any) {
        window.removeEventListener(
            "mousemove",
            lastCamera.mouseMoveCallback,
            false
        );

        window.removeEventListener(
            "mouseup",
            lastCamera.mouseUpCallback,
            false
        );

        window.removeEventListener(
            "mousedown",
            lastCamera.mousePressCallback,
            false
        );

        window.removeEventListener("wheel", lastCamera.zoomCallback, false);
    }

    setupCallbacks(currentCamera: Camera, ui: any) {
        window.addEventListener(
            "mousemove",
            currentCamera.mouseMoveCallback,
            false
        );

        window.addEventListener(
            "mouseup",
            currentCamera.mouseUpCallback,
            false
        );

        window.addEventListener(
            "mousedown",
            currentCamera.mousePressCallback,
            false
        );

        window.addEventListener("wheel", currentCamera.zoomCallback, false);
    }
}
