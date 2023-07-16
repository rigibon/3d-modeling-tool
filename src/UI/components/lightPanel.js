import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import { vec3 } from "gl-matrix";

export function lightPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var spacing = new ImGui.ImVec2(0.0, 5.0);

    if (ImGui.Begin("Material", null, 32, 4, 2)) {
        if (properties.selectedEntity) {
            if (!properties.selectedEntity.material) {
                ImGui.Text("No model selected.");
            } else {
                ImGui.Text(properties.selectedEntity.name);

                var material = properties.selectedEntity.material;

                var ambient = [material.ambientColor[0], material.ambientColor[1], material.ambientColor[2]];
                var diffuse = [material.diffuseColor[0], material.diffuseColor[1], material.diffuseColor[2]];
                var specular = [material.specularColor[0], material.specularColor[1], material.specularColor[2]];

                ImGui.PushID(0);

                ImGui.Text("Ambient color");

                if (ImGui.ColorEdit3("Color", ambient)) {
                    // this.socket.emit("changeAmbientColor", ambient);
                }

                material.ambientColor = vec3.fromValues(ambient[0], ambient[1], ambient[2]);
                var kA = [material.kAmbient];
                ImGui.SliderFloat("Intensity", kA, 0.0, 1.0);
                material.kAmbient = kA;

                ImGui.PopID();

                ImGui.Separator();

                ImGui.PushID(1);

                ImGui.Text("Diffuse color");
                ImGui.ColorEdit3("Color", diffuse);
                properties.selectedEntity.material.diffuseColor = vec3.fromValues(diffuse[0], diffuse[1], diffuse[2]);
                var kD = [material.kDiffuse];
                ImGui.SliderFloat("Intensity", kD, 0.0, 1.0);
                properties.selectedEntity.material.kDiffuse = kD;

                ImGui.PopID();

                ImGui.Separator();

                ImGui.PushID(2);

                ImGui.Text("Specular color");
                ImGui.ColorEdit3("Color", specular);
                properties.selectedEntity.material.specularColor = vec3.fromValues(specular[0], specular[1], specular[2]);
                var kS = [material.kSpecular];
                ImGui.SliderFloat("Intensity", kS, 0.0, 1.0);
                properties.selectedEntity.material.kSpecular = kS;

                ImGui.PopID();
            }
        }
    }
}