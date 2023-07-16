import { Shader } from "./shader";
import { vGrid, fGrid } from "./shaders/grid";
import { mat4 } from "gl-matrix";

export class Grid {
    gl: any;
    isLoaded: boolean = false;
    lines: number[] = [0, 0, -50, 0, 0, 50, 1, 0, -50, 1, 0, 50];
    shader: Shader;
    worldMatrix: mat4 = mat4.create();
    grid: number[];

    constructor(gl: any) {
        this.gl = gl;
        this.shader = new Shader(vGrid, fGrid, gl);
    }

    createGrid() {
        var grid: number[] = [];
    
        for (var i = -20; i <= 20; i++) {
            var begin: number[] = [i / 2, 0, -10];
            grid = grid.concat(begin);
            var end: number[] = [i / 2, 0, 10];
            grid = grid.concat(end);
        }
    
        for (var j = -20; j <= 20; j++) {
            var begin: number[] = [-10, 0, j / 2];
            grid = grid.concat(begin);
            var end: number[] = [10, 0, j / 2];
            grid = grid.concat(end);
        }
    
        return grid;
    }
    
    render(draw: boolean, viewMatrix: mat4, projectionMatrix: mat4) {
        this.shader.use();

        if (!this.isLoaded) {
            this.grid = this.createGrid();      
            this.shader.setVec3("lineColor", 0.4, 0.4, 0.4);
            this.isLoaded = true;
        }

        this.gl.enableVertexAttribArray(0);
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.grid), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);

        this.shader.setMat4("worldMatrix", this.worldMatrix);
        this.shader.setMat4("viewMatrix", viewMatrix);
        this.shader.setMat4("projectionMatrix", projectionMatrix);

        if (draw) {
            this.gl.drawArrays(this.gl.LINES, 0, this.grid.length / 3);
        }
    }
}

