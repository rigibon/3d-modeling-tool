import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import * as icons from "../icons/icons.js";

var iconSymbols = [icons.edge, icons.up_down_left_right, icons.pen_fancy, icons.plus, icons.camera, icons.globe,icons.earth_americas, icons.file_export, "PBR", "Shader"];

export function sideBar(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(50, canvas.clientHeight);
    var position = new ImGui.ImVec2(0, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var buttonSize = new ImGui.ImVec2(35.0, 33.0);
    var color = new ImGui.ImVec4(0.1, 0.1, 0.1, 1.0);

    var align = new ImGui.ImVec2(0.5, 0.7);

    ImGui.PushStyleVar(ImGui.StyleVar.SelectableTextAlign, align);
    ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, color);

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.primary);
    }

    if (ImGui.Begin("", null, ImGui.WindowFlags.NoTitleBar | ImGui.WindowFlags.NoCollapse)) {
        for (var i = 0; i < properties.modes.length; i++) {

            if (ImGui.Selectable(iconSymbols[i], properties.selectedMode === properties.modes[i], 0, buttonSize)) {
                properties.selectedMode = properties.modes[i];
            }

            if (ImGui.IsItemHovered()) {
                ImGui.BeginTooltip();
                ImGui.Text(properties.modes[i]);
                ImGui.EndTooltip();
            }
        }
    }

    ImGui.PopStyleVar();
    ImGui.PopStyleColor();
}