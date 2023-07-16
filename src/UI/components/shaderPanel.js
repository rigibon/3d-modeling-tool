import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import { vec3 } from "gl-matrix";

export function shaderPanel(gl, canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);
    
    if (ImGui.Begin("Shader", null, 32, 4, 2, 128)) {
        if (properties.selectedEntity.shader) {
            var uniforms = properties.selectedEntity.shader.uniforms;

            var temp;

            for (var i = 0; i < uniforms.length; i++) {
                if (uniforms[i].type === gl.FLOAT_VEC3) {
                    temp = [uniforms[i].value[0], uniforms[i].value[1], uniforms[i].value[2]];
                    ImGui.DragFloat3(uniforms[i].name.toString(), temp, 0.1);
                    uniforms[i].value = vec3.fromValues(temp[0], temp[1], temp[2]);
                } else if (uniforms[i].type === gl.FLOAT_VEC4) {
                    temp = [uniforms[i].value[0], uniforms[i].value[1], uniforms[i].value[2], uniforms[i].value[3]];
                    ImGui.DragFloat4(uniforms[i].name.toString(), temp, 0.1);
                    uniforms[i].value = vec4.fromValues(temp[0], temp[1], temp[2], temp[3]);
                } else if (uniforms[i].type === gl.FLOAT) {
                    temp = [uniforms[i].value];
                    ImGui.DragFloat(uniforms[i].name.toString(), temp, 0.1);
                    uniforms[i].value = temp[0];
                } else if (uniforms[i].type === gl.INT) {
                    temp = [uniforms[i].value];
                    ImGui.DragInt(uniforms[i].name.toString(), temp, 1);
                    uniforms[i].value = temp[0];
                } else if (uniforms[i].type === gl.SAMPLER_2D || uniforms[i].type === gl.SAMPLER_CUBE || uniforms[i].type === gl.SAMPLER_2D_SHADOW) {
                    temp = [uniforms[i].value];
                    ImGui.DragInt(uniforms[i].name.toString(), temp, 1);
                }
            }
            
            properties.selectedEntity.shader.modify();
        } else {
            ImGui.Text("No model selected for shaders.");
        }
    }
}