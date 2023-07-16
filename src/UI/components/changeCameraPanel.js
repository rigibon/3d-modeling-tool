import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import * as icons from "../icons/icons.js";

export function changeCameraPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    if (ImGui.Begin("Select a camera", null, ImGui.WindowFlags.NoCollapse)) {
        if (properties.scene.cameras.length > 0) {
            for (var i = 0; i < properties.scene.cameras.length; i++) {
                var total_w = ImGui.GetContentRegionAvail().x;
                var size = new ImGui.ImVec2(total_w, 16.0);
                if (ImGui.Selectable(properties.scene.cameras[i].name, properties.activeCamera === properties.scene.cameras[i], 0, size)) {
                    if (properties.activeCamera !== -1) {
                        properties.scene.lastCamera = properties.activeCamera;
                        properties.scene.cameras[properties.activeCamera].active = false;
                    }

                    properties.scene.cameras[i].active = true;
                    properties.activeCamera = i;
                    properties.scene.activeCamera = i;
                    properties.newCameraSelected = true;
                }

                ImGui.SetItemAllowOverlap();

                ImGui.SameLine(total_w - 15.0);

                ImGui.PushFont(properties.iconsfont);

                // ImGui.PushID(i);

                if (properties.scene.cameras[i].type === "Free") {
                    ImGui.Button(icons.camera)
                } else if (properties.scene.cameras[i].type === "Trackball") {
                    ImGui.Button(icons.bullseye);
                }

                // ImGui.PopID();

                ImGui.PopFont();
            }
        } else {
            ImGui.Text("The scene has no cameras.");
        }
    }
}