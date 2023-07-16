import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import axios from "axios";

export async function exportPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var spacing = new ImGui.ImVec2(0.0, 5.0);

    if (properties.selectedMode === "Export") {
        ImGui.Dummy(spacing);
        if (ImGui.Begin("Export", null, 32, 4, 2)) {
            if (properties.selectedEntity) {
                ImGui.Text(properties.selectedEntity.name);
                if (ImGui.Button("Export model")) {
                    await axios.post(`http://localhost:3000/obj-export`,
                        {
                            vertices: properties.selectedEntity.getPositionBuffer(),
                            normals: [],
                            faces: properties.selectedEntity.faces
                        });
                }
            }
        }
    }
}