import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";

export function mainMenuBar(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(canvas.clientWidth, 5);
    var position = new ImGui.ImVec2(0, 0);

    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, size);
    var color = new ImGui.ImVec4(0.05, 0.05, 0.05, 1.0);

    ImGui.PushStyleColor(ImGui.ImGuiCol.MenuBarBg, color);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.primary);
    }

    if (ImGui.BeginMainMenuBar()) {
        if (ImGui.BeginMenu("File")) {
            // ShowExampleMenuFile();
            ImGui.EndMenu();
        }
        if (ImGui.BeginMenu("Edit")) {
            if (ImGui.MenuItem("Undo", "CTRL+Z")) ;
            if (ImGui.MenuItem("Redo", "CTRL+Y", false, false)) ; // Disabled item
            ImGui.Separator();
            if (ImGui.MenuItem("Cut", "CTRL+X")) ;
            if (ImGui.MenuItem("Copy", "CTRL+C")) ;
            if (ImGui.MenuItem("Paste", "CTRL+V")) ;
            ImGui.EndMenu();
        }
        ImGui.EndMainMenuBar();
    }

    ImGui.PopStyleVar();
    ImGui.PopStyleColor();
}