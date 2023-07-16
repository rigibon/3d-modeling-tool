import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";

export function environmentPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var spacing = new ImGui.ImVec2(0.0, 5.0);

    if (properties.selectedMode == "Environment") {
        if (ImGui.Begin("Environment", null, 32, 4, 2, 128)) {
            ImGui.Text("Background color");
            ImGui.ColorEdit3("Color", properties.backgroundColor);
            ImGui.Spacing();
            var grid = [properties.grid];
            ImGui.Checkbox("Grid", grid);
            properties.grid = grid[0];
        }
    }
}