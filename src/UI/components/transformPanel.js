import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";

export function transformPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var spacing = new ImGui.ImVec2(0.0, 5.0);

    if (ImGui.Begin("Transform", null, 32, 4, 2, 128)) {
        if (properties.selectedEntity) {
            ImGui.Text(properties.selectedEntity.name);
            ImGui.Separator();

            ImGui.Dummy(spacing);
            ImGui.DragFloat3("Translate", properties.transformPosition, 0.1);

            ImGui.Dummy(spacing);
            ImGui.DragFloat3("Rotate", properties.transformRotation, 0.1);

            ImGui.Dummy(spacing);
            ImGui.DragFloat3("Scale", properties.transformScale, 0.1);
        } else {
            ImGui.Text("No objects selected.");
        }
    }
}