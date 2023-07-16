import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";

export function sculptPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var spacing = new ImGui.ImVec2(0.0, 5.0);

    ImGui.Dummy(spacing);
    if (ImGui.Begin("Sculpt", null, 32, 4, 2)) {
        if (properties.selectedEntity) {
            ImGui.Text(properties.selectedEntity.name);
        }

        ImGui.Text("Brush size");
        var brushSize = [properties.brushSize];
        ImGui.SliderFloat("Size", brushSize, 0.0, 50.0, "%.0f");
        properties.brushSize = brushSize[0];

        ImGui.Separator();

        ImGui.Text("Strength");
        var strength = [properties.strength];
        ImGui.SliderFloat("Strength", strength, 0.0, 10.0, "%.0f");
        properties.strength = strength[0];
    }
}