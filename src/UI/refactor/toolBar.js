import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import * as icons from "../icons/icons.js";

var toolsIcons = [
    icons.empty_arrows,
    icons.orientational_gimbal,
    icons.particle_data,
    icons.normals_face,
    icons.mod_triangulate,
];
var tools = ["Translate", "Rotate", "Scale", "Extrude", "Subdivide"];
var transformTools = ["Translate", "Rotate", "Scale"];
var editTools = ["Extrude", "Subdivide"];

var topModeIcons = [icons.vertex, icons.edge, icons.face];
var transformToolsIcons = [
    icons.empty_arrows,
    icons.orientational_gimbal,
    icons.particle_data,
];
var editToolsIcons = [icons.normals_face, icons.mod_triangulate];
var topModes = ["Vertex selection", "Edge selection", "Face selection"];

export var greenBlueCrayola = new ImGui.ImVec4(
    28 / 255,
    141 / 255,
    217 / 255,
    255 / 255
);

export function toolBar(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(canvas.clientWidth - 300, 51);
    var position = new ImGui.ImVec2(0, 26);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var buttonSize = new ImGui.ImVec2(18.0, 18.0);

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.primary);
    }

    var padding = new ImGui.ImVec2(0, 0);
    var buttonTextAlign = new ImGui.ImVec2(0.5, 0.2);
    var buttonPadding = new ImGui.ImVec2(30, 0.0);

    var align = new ImGui.ImVec2(0.4, 1.0);

    var color = new ImGui.ImVec4(0.5, 0.0, 0.0, 1.0);

    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, padding);
    ImGui.PushStyleVar(ImGui.StyleVar.SelectableTextAlign, align);

    ImGui.PushStyleVar(ImGui.StyleVar.FrameRounding, 0.0);

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.WindowBg,
        new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)
    );

    ImGui.Begin(
        "##ToolBar",
        null,
        ImGui.WindowFlags.NoTitleBar |
            ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoBringToFrontOnFocus |
            ImGui.WindowFlags.NoResize |
            ImGui.WindowFlags.NoScrollBar
    );

    var initPos = new ImGui.ImVec2(8.0, 6.0);

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 15.0,
            ImGui.GetCursorPos().y + 6.0
        )
    );

    const draw_list = ImGui.GetWindowDrawList();

    var active = new ImGui.ImVec4(28 / 255, 141 / 255, 217 / 255, 1.0);
    var hovered = new ImGui.ImVec4(45 / 255, 45 / 255, 45 / 255, 1.0);

    ImGui.PushStyleColor(ImGui.ImGuiCol.Header, active);

    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderHovered, active);

    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderActive, active);

    var firstPos = ImGui.GetCursorPos();

    ImGui.Text("Selection mode");

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 15.0,
            ImGui.GetCursorPos().y + 4.0
        )
    );

    for (var i = 0; i < topModes.length; i++) {
        var startPos = ImGui.GetCursorPos();

        draw_list.ChannelsSplit(3);

        draw_list.ChannelsSetCurrent(1);

        ImGui.PushStyleVar(
            ImGui.StyleVar.FramePadding,
            new ImGui.ImVec2(0.0, 0.0)
        );

        if (
            ImGui.Selectable(
                topModeIcons[i],
                properties.selectedTopMode === topModes[i],
                0 | ImGui.SelectableFlags.SelectOnClick,
                buttonSize
            )
        ) {
            if (properties.selectedTopMode === topModes[i]) {
                properties.selectedTopMode = "";
            } else {
                properties.selectedTopMode = topModes[i];
            }

            properties.newTopModeSelected = true;
        }

        ImGui.PopStyleVar();

        if (!ImGui.IsItemHovered()) {
            // Render background behind Selectable().

            draw_list.ChannelsSetCurrent(0);
            var p_min = ImGui.GetItemRectMin();
            var p_max = ImGui.GetItemRectMax();
            draw_list.AddRectFilled(
                p_min,
                p_max,
                ImGui.COL32(38.25, 38.25, 38.25, 255)
            );
        }

        draw_list.ChannelsMerge();

        ImGui.PushStyleVar(
            ImGui.ImGuiStyleVar.WindowPadding,
            new ImGui.ImVec2(5.0, 5.0)
        );
        ImGui.PushStyleColor(
            ImGui.ImGuiCol.PopupBg,
            new ImGui.ImVec4(0.27, 0.27, 0.27, 1.0)
        );

        if (ImGui.IsItemHovered()) {
            ImGui.BeginTooltip();
            ImGui.Text(topModes[i]);
            ImGui.EndTooltip();
        }

        ImGui.PopStyleVar();
        ImGui.PopStyleColor();

        ImGui.SameLine();

        var nextPos = new ImGui.ImVec2(
            startPos.x + buttonPadding.x,
            startPos.y + buttonPadding.y
        );

        ImGui.SetCursorPos(nextPos);
    }

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x + 55.0, firstPos.y)
    );

    ImGui.Text("Transform");

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x + 150.0, ImGui.GetCursorPos().y)
    );

    for (var i = 0; i < transformTools.length; i++) {
        var startPos = ImGui.GetCursorPos();

        draw_list.ChannelsSplit(3);

        draw_list.ChannelsSetCurrent(1);

        ImGui.PushStyleVar(
            ImGui.StyleVar.FramePadding,
            new ImGui.ImVec2(0.0, 0.0)
        );

        if (
            ImGui.Selectable(
                transformToolsIcons[i],
                properties.selectedTool === transformTools[i],
                0 | ImGui.SelectableFlags.SelectOnClick,
                buttonSize
            )
        ) {
            if (properties.selectedTool === transformTools[i]) {
                properties.selectedTool = "";
            } else {
                properties.selectedTool = transformTools[i];
            }

            properties.newToolSelected = true;
        }

        ImGui.PopStyleVar();

        if (!ImGui.IsItemHovered()) {
            draw_list.ChannelsSetCurrent(0);
            var p_min = ImGui.GetItemRectMin();
            var p_max = ImGui.GetItemRectMax();
            draw_list.AddRectFilled(
                p_min,
                p_max,
                ImGui.COL32(38.25, 38.25, 38.25, 255)
            );
        }

        draw_list.ChannelsMerge();

        ImGui.PushStyleVar(
            ImGui.ImGuiStyleVar.WindowPadding,
            new ImGui.ImVec2(5.0, 5.0)
        );
        ImGui.PushStyleColor(
            ImGui.ImGuiCol.PopupBg,
            new ImGui.ImVec4(0.27, 0.27, 0.27, 1.0)
        );

        if (ImGui.IsItemHovered()) {
            ImGui.BeginTooltip();
            ImGui.Text(transformTools[i]);
            ImGui.EndTooltip();
        }

        ImGui.PopStyleVar();
        ImGui.PopStyleColor();

        ImGui.SameLine();

        var nextPos = new ImGui.ImVec2(
            startPos.x + buttonPadding.x,
            startPos.y + buttonPadding.y
        );

        ImGui.SetCursorPos(nextPos);
    }

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x + 50.0, firstPos.y)
    );

    ImGui.Text("Edit");

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x + 280.0, ImGui.GetCursorPos().y)
    );

    for (var i = 0; i < editTools.length; i++) {
        var startPos = ImGui.GetCursorPos();

        draw_list.ChannelsSplit(3);

        draw_list.ChannelsSetCurrent(1);

        ImGui.PushStyleVar(
            ImGui.StyleVar.FramePadding,
            new ImGui.ImVec2(0.0, 0.0)
        );

        if (
            ImGui.Selectable(
                editToolsIcons[i],
                properties.selectedTool === editTools[i],
                0 | ImGui.SelectableFlags.SelectOnClick,
                buttonSize
            )
        ) {
            if (properties.selectedTool === editTools[i]) {
                properties.selectedTool = "";
            } else {
                properties.selectedTool = editTools[i];
            }

            properties.newToolSelected = true;

            if (properties.selectedTool === "Subdivide") {
                ImGui.OpenPopup("Subdivide");
            }

            if (properties.selectedTool === "Remove") {
                ImGui.OpenPopup("inspectorPopup");
            }
        }

        ImGui.PopStyleVar();

        if (!ImGui.IsItemHovered()) {
            // Render background behind Selectable().

            draw_list.ChannelsSetCurrent(0);
            var p_min = ImGui.GetItemRectMin();
            var p_max = ImGui.GetItemRectMax();
            draw_list.AddRectFilled(
                p_min,
                p_max,
                ImGui.COL32(38.25, 38.25, 38.25, 255)
            );
        }

        draw_list.ChannelsMerge();

        ImGui.PushStyleVar(
            ImGui.ImGuiStyleVar.WindowPadding,
            new ImGui.ImVec2(5.0, 5.0)
        );
        ImGui.PushStyleColor(
            ImGui.ImGuiCol.PopupBg,
            new ImGui.ImVec4(0.27, 0.27, 0.27, 1.0)
        );

        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.PopupBorderSize, 0.0);

        if (ImGui.IsItemHovered()) {
            ImGui.BeginTooltip();
            ImGui.Text(editTools[i]);
            ImGui.EndTooltip();
        }

        ImGui.PopStyleVar();

        ImGui.PopStyleVar();
        ImGui.PopStyleColor();

        ImGui.SameLine();

        var nextPos = new ImGui.ImVec2(
            startPos.x + buttonPadding.x,
            startPos.y + buttonPadding.y
        );

        ImGui.SetCursorPos(nextPos);
    }

    ImGui.SetNextWindowBgAlpha(1.0);

    if (properties.selectedEntity && properties.selectedEntity.isExternal) {
        ImGui.SetNextWindowSize(new ImGui.ImVec2(230.0, 160.0));
    } else {
        ImGui.SetNextWindowSize(new ImGui.ImVec2(230.0, 125.0));
    }

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.PopupBg,
        new ImGui.ImVec4(0.18, 0.18, 0.18, 1.0)
    );
    ImGui.PushStyleVar(
        ImGui.StyleVar.WindowPadding,
        new ImGui.ImVec2(9.0, 4.0)
    );

    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.PopupBorderSize, 0.0);

    if (ImGui.BeginPopup("Subdivide")) {
        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(0.0, 0.0));

        var tempSteps = [properties.steps];
        ImGui.Text("Subdivide tool settings");
        ImGui.Separator();
        ImGui.Text("Steps");
        ImGui.SameLine(145.0);

        ImGui.PushItemWidth(75.0);

        ImGui.InputInt("##Steps", tempSteps);

        ImGui.PopItemWidth();

        properties.steps = tempSteps[0];
        ImGui.Text("Linear");
        ImGui.SameLine(205.0);
        var linearTemp = [properties.linear];
        ImGui.Checkbox("##linear", linearTemp);
        properties.linear = linearTemp[0];

        var buttonSize = new ImGui.ImVec2(212.0, 25.0);
        ImGui.SetCursorPos(
            new ImGui.ImVec2(
                ImGui.GetCursorPos().x,
                ImGui.GetCursorPos().y + 25.0
            )
        );

        if (properties.selectedEntity.isExternal) {
            ImGui.Text(icons.error + "  Subdivision tool is not");

            ImGui.Text("compatible with external models");
        }

        if (ImGui.Button("Subdivide", buttonSize)) {
            properties.subdivide = true;
        }

        ImGui.PopStyleVar();

        ImGui.EndPopup();
    }

    ImGui.PopStyleVar();

    ImGui.PopStyleColor();
    ImGui.PopStyleVar();

    ImGui.SetNextWindowBgAlpha(1.0);
    ImGui.SetNextWindowSize(new ImGui.ImVec2(180.0, 250.0));
    ImGui.PushStyleColor(
        ImGui.ImGuiCol.PopupBg,
        new ImGui.ImVec4(0.14, 0.14, 0.14, 1.0)
    );
    ImGui.PushStyleColor(
        ImGui.ImGuiCol.Button,
        new ImGui.ImVec4(0.14, 0.14, 0.14, 1.0)
    );
    ImGui.PushStyleVar(
        ImGui.StyleVar.WindowPadding,
        new ImGui.ImVec2(8.0, 8.0)
    );

    ImGui.PushStyleVar(
        ImGui.StyleVar.ButtonTextAlign,
        new ImGui.ImVec2(0.0, 0.5)
    );

    ImGui.SetNextWindowBgAlpha(1.0);
    ImGui.SetNextWindowSize(new ImGui.ImVec2(200.0, 250.0));

    if (ImGui.BeginPopup("addObjects")) {
        ImGui.Text("Edit menu");
        ImGui.Separator();

        if (ImGui.Button("Remove faces", buttonSize)) {
            ImGui.CloseCurrentPopup();
        }

        if (ImGui.Button("Remove edges", buttonSize)) {
            ImGui.CloseCurrentPopup();
        }

        if (ImGui.Button("Remove vertices", buttonSize)) {
            ImGui.CloseCurrentPopup();
        }

        ImGui.Separator(0.1);

        // var tempSteps = [properties.steps];
        // ImGui.Text("Remove settings");
        // ImGui.Separator();
        // ImGui.Text("Steps");
        // ImGui.SameLine(145.0);

        // ImGui.InputInt("Steps", tempSteps);
        // properties.steps = tempSteps[0];
        // ImGui.Text("Linear");
        // ImGui.SameLine(175.0);
        // var linearTemp = [properties.linear];
        // ImGui.Checkbox("##linear", linearTemp);
        // properties.linear = linearTemp[0];

        // var buttonSize = new ImGui.ImVec2(180.0, 25.0);
        // ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y + 25.0));

        // if (ImGui.Button("Subdivide", buttonSize)) {
        //     properties.subdivide = true;
        // }

        ImGui.EndPopup();
    }

    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();

    if (properties.fonts) {
        ImGui.PopFont();
    }

    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    // ImGui.PopStyleVar();
    // ImGui.PopStyleVar();
    // ImGui.PopStyleVar();
    // ImGui.PopStyleVar();
    // ImGui.PopStyleVar();
}
