import { vec3, vec4, glMatrix, mat4 } from "gl-matrix";

export class Shader {
    gl: any;
    ID: number;
    uniforms: any = [];
    textureCount: number = 0;

    constructor(vertexSource: any, fragmentSource: any, gl: any) {
        const vertex = gl.createShader(gl.VERTEX_SHADER);
        this.gl = gl;

        gl.shaderSource(vertex, vertexSource);

        gl.compileShader(vertex);

        if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
            alert(
                "An error occurred compiling the shaders: " +
                    gl.getShaderInfoLog(vertex)
            );
            gl.deleteShader(vertex);
            return null;
        }

        const fragment = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(fragment, fragmentSource);

        gl.compileShader(fragment);

        if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
            alert(
                "An error occurred compiling the shaders: " +
                    gl.getShaderInfoLog(fragment)
            );
            gl.deleteShader(fragment);
            return null;
        }

        const ID = gl.createProgram();
        this.ID = ID;

        gl.attachShader(ID, vertex);
        gl.attachShader(ID, fragment);
        gl.linkProgram(ID);

        if (!gl.getProgramParameter(ID, gl.LINK_STATUS)) {
            alert(
                "Unable to initialize the shader program: " +
                    gl.getProgramInfoLog(ID)
            );
            return null;
        }

        gl.deleteShader(vertex);
        gl.deleteShader(fragment);

        this.uniforms = this.getActiveUniforms();
        this.fillUniforms();
    }

    use() {
        this.gl.useProgram(this.ID);
    }

    fillUniforms() {
        this.use();
        for (var i = 0; i < this.uniforms.length; i++) {
            switch (this.uniforms[i].type) {
                case this.gl.FLOAT:
                    this.uniforms[i].value = 1.0;
                    break;
                case this.gl.FLOAT_VEC3:
                    this.uniforms[i].value = vec3.fromValues(0.0, 0.0, 0.0);
                    break;
                case this.gl.FLOAT_VEC4:
                    this.uniforms[i].value = vec4.fromValues(0.0, 0.0, 0.0, 0.0);
                    break;
                case this.gl.FLOAT_MAT4:
                    this.uniforms[i].value = mat4.create();
                    break;
                case this.gl.INT:
                    this.uniforms[i].value = 1;
                    break;
                case this.gl.SAMPLER_2D:
                    this.uniforms[i].value = this.textureCount;
                    this.textureCount++;
                    this.setInt(this.uniforms[i].name.toString(), this.uniforms[i].value);
                    break;
                case this.gl.SAMPLER_CUBE:
                    this.uniforms[i].value = this.textureCount;
                    this.textureCount++;
                    this.setInt(this.uniforms[i].name.toString(), this.uniforms[i].value);
                    break;
                case this.gl.SAMPLER_2D_SHADOW:
                    this.uniforms[i].value = this.textureCount;
                    this.textureCount++;
                    this.setInt(this.uniforms[i].name.toString(), this.uniforms[i].value);
                    break;
                default:
                    return;
            }
        }
    }

    modify() {
        for (var i = 0; i < this.uniforms.length; i++) {
            var value = this.uniforms[i].value;
            switch (this.uniforms[i].type) {
                case this.gl.FLOAT:
                    this.setFloat(this.uniforms[i].name.toString(), value);
                    break;
                case this.gl.FLOAT_VEC3:
                    this.setVec3(this.uniforms[i].name.toString(), value[0], value[1], value[2]);
                    break;
                case this.gl.FLOAT_VEC4:
                    this.setVec4(this.uniforms[i].name.toString(), value[0], value[1], value[2], value[2]);
                    break;
                case this.gl.FLOAT_MAT4:
                    this.setMat4(this.uniforms[i].name.toString(), value);
                    break;
                case this.gl.INT:
                    this.setInt(this.uniforms[i].name.toString(), value);
                    break;
                default:
                    return;
            }
        }
    }

    setMat4(name: string, mat: any) {
        this.gl.uniformMatrix4fv(
            this.gl.getUniformLocation(this.ID, name),
            this.gl.FALSE,
            mat
        );
    }

    setVec3(name: string, x: number, y: number, z: number) {
        this.gl.uniform3f(
            this.gl.getUniformLocation(this.ID, name),
            x,
            y,
            z
        );
    }

    setVec4(name: string, x: number, y: number, z: number, t: number) {
        this.gl.uniform4f(
            this.gl.getUniformLocation(this.ID, name),
            this.gl.FALSE,
            x,
            y,
            z,
            t
        );
    }

    setFloat(name: string, float: number) {
        this.gl.uniform1f(
            this.gl.getUniformLocation(this.ID, name),
            float
        );
    }

    setInt(name: string, int: number) {
        this.gl.uniform1i(
            this.gl.getUniformLocation(this.ID, name),
            int
        );
    }

    getAttribLocation(name: string) {
        const location = this.gl.getAttribLocation(this.ID, name);
        if (location === -1) {
            throw new Error("No attrib with name " + name);
        }
        return location;
    }

    getActiveUniforms() {
        var activeUniforms = this.gl.getProgramParameter(this.ID, this.gl.ACTIVE_UNIFORMS);

        var uniforms: any = [];

        for (var i = 0; i < activeUniforms; i++) {
            const info = this.gl.getActiveUniform(this.ID, i);
            var uniform = { name: info.name, type: info.type, index: i, value: null as any };
            uniforms.push(uniform);
        }
        
        return uniforms;
    }
}