import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import * as icons from "../icons/icons.js";

var modes = ["Scene", "Inspector", "Sculpt", "Transform", "Edit"];
var tools = ["Select", "Translate", "Rotate", "Scale"];
var iconSymbols = [
    icons.edge,
    icons.up_down_left_right,
    icons.pen_fancy,
    icons.plus,
];
var selectedMode = "";
var selectedTool = "";
var color = new ImGui.ImVec4(0.35, 0.35, 0.35, 1.0);
var childBgColor = new ImGui.ImVec4(0.29, 0.29, 0.29, 1.0);
var brushSettingsIsOpen = true;

var selectedMode = "";
var selectedTool = "";
var color = new ImGui.ImVec4(0.05, 0.05, 0.05, 1.0);
var childBgColor = new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0);
var frameBgColor = new ImGui.ImVec4(0.2, 0.2, 0.2, 255 / 255);
var lightFrameBgColor = new ImGui.ImVec4(0.25, 0.25, 0.25, 255 / 255);
var headerBgColor = new ImGui.ImVec4(0.05, 0.05, 0.05, 255 / 255);
var matcapID = 0;

export function sculptPanel(canvas, properties) {
    ImGui.SetCursorPos(new ImGui.ImVec2(25, 25));

    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(250, 25);
    var position = new ImGui.ImVec2(25, canvas.clientHeight - 28);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    ImGui.Begin(
        "##SelectedMeshToolTipSculpt",
        null,
        ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoScrollBar |
            ImGui.WindowFlags.NoTitleBar |
            ImGui.WindowFlags.NoBackground
    );

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.Text,
        new ImGui.ImVec4(1.0, 1.0, 1.0, 1.0)
    );

    if (properties.selectedEntity && properties.selectedMeshFromEntity) {
        ImGui.Text(
            "Sculpting    /" +
                properties.selectedEntity.name +
                "/" +
                properties.selectedMeshFromEntity._name
        );
    } else {
        ImGui.Text(icons.error + "  No mesh selected for sculpt");
    }

    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(300, canvas.clientHeight + 50);
    var position = new ImGui.ImVec2(canvas.clientWidth - 300, 26);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.TitleBg,
        new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)
    );
    ImGui.PushStyleColor(
        ImGui.ImGuiCol.TitleBgActive,
        new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)
    );
    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(8.0, 4.0));
    ImGui.Begin(
        "Sculpt",
        null,
        ImGui.WindowFlags.NoCollapse | ImGui.WindowFlags.NoScrollBar
    );
    ImGui.PopStyleVar();

    var initTabPos = ImGui.GetCursorPos();
    var pos = new ImGui.ImVec2(initTabPos.x, initTabPos.y - 10);

    ImGui.SetCursorPos(pos);

    ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, childBgColor);

    ImGui.PushStyleVar(
        ImGui.StyleVar.WindowPadding,
        new ImGui.ImVec2(20.0, 20.0)
    );

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 7.8,
            ImGui.GetCursorPos().y + 0.0
        )
    );

    if (
        ImGui.BeginChild(
            "#SculptPanel",
            new ImGui.Vec2(300, canvas.clientHeight - 40), false, ImGui.WindowFlags.NoScrollBar
        )
    ) {
        ImGui.SetCursorPos(
            new ImGui.ImVec2(
                ImGui.GetCursorPos().x - 3.0,
                ImGui.GetCursorPos().y + 14.0
            )
        );

        if (
            ImGui.BeginChild(
                "##NameChild",
                new ImGui.Vec2(300, 50),
                false,
                ImGui.WindowFlags.NoScrollBar
            )
        ) {
            if (properties.selectedEntity) {
                var modelNameBuffer = new ImGui.StringBuffer(
                    64,
                    properties.selectedEntity.name
                );
            }

            ImGui.PushID(1);
            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 15,
                    ImGui.GetCursorPos().y + 15
                )
            );

            ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(0.0, 0.0));

            if (modelNameBuffer)
                ImGui.InputText("##modelName", modelNameBuffer, 128);

            ImGui.PopStyleVar();

            ImGui.PopID();
        }

        ImGui.EndChild();

        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(0.0, 2.0));

        brushSettingsSection(properties);

        ImGui.PopStyleVar();

        // ImGui.PopStyleColor();

        // materialSection("Shader", canvas, properties, materialNameBuffer);
        // materialSection("Properties", canvas, properties, materialNameBuffer);

        // for (var i = 0; i < 500; i++) {
        //     if (ImGui.Selectable("Material " + i, properties.matcapIDs[i] === matcapID, 0)) {
        // matcapID = properties.matcapIDs[i];
        // var srcTexture = "https://makio135.com/matcaps/1024/" + properties.matcapIDs[i] + ".png";
        // properties.matcapTexture = loadTexture(gl, srcTexture);
        // properties.loadedNewTexture = true;
        //     }
        // }

        // ImGui.PopStyleVar();
        // ImGui.PopStyleVar();

        // ImGui.Separator();

        // ImGui.Text("Brush settings");

        // var radius = [properties.brushSize];
        // ImGui.Text("Radius");

        // ImGui.SameLine(total_w / 2 - 15);
        // ImGui.SetNextItemWidth(total_w / 2);
        // ImGui.SliderFloat("##RadiusSlider", radius, 1.0, 50.0, "%.0f");
        // properties.brushSize = radius[0];

        // ImGui.SetCursorPos(
        //     new ImGui.ImVec2(
        //         ImGui.GetCursorPos().x + 1.0,
        //         ImGui.GetCursorPos().y + 10
        //     )
        // );
        // var strength = [properties.strength];
        // ImGui.Text("Strength");

        // ImGui.SameLine(total_w / 2 - 15);
        // ImGui.SetNextItemWidth(total_w / 2);
        // ImGui.SliderFloat("##StrengthSlider", strength, 1.0, 10.0, "%.0f");
        // properties.strength = strength[0];
    }

    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleVar();

    ImGui.EndChild();
}

function brushSettingsSection(properties) {
    ImGui.PushStyleColor(ImGui.ImGuiCol.Header, childBgColor);

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x + 2.0, ImGui.GetCursorPos().y)
    );

    var firstPos = ImGui.GetCursorPos();

    ImGui.PushID(1);

    var arrowIcon = !brushSettingsIsOpen
        ? icons.rightarrow_thin
        : icons.downarrow_hlt;
        
    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x - 20, ImGui.GetCursorPos().y - 1.0)
    );

    ImGui.PushItemWidth(270.0);

    if (ImGui.CollapsingHeader("##BrushSettings", ImGui.ImGuiTreeNodeFlags.DefaultOpen)) {
        brushSettingsIsOpen = true;
        ImGui.PushStyleColor(ImGui.ImGuiCol.ChildBg, childBgColor);

        ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, frameBgColor);

        ImGui.PushStyleVar(
            ImGui.StyleVar.WindowPadding,
            new ImGui.ImVec2(0, 0)
        );

        ImGui.SetCursorPos(
            new ImGui.ImVec2(ImGui.GetCursorPos().x - 7.0, ImGui.GetCursorPos().y - 4)
        );

        if (
            ImGui.BeginChild(
                "##BrushSettingsChild",
                new ImGui.Vec2(287, 150),
                false,
                ImGui.WindowFlags.NoScrollBar
            )
        ) {
            ImGui.PushItemWidth(150.0);
            pos = ImGui.GetCursorScreenPos();

            var total_w = ImGui.GetContentRegionAvail().x;

            var pos = new ImGui.GetCursorPos();
            ImGui.SetCursorPos(new ImGui.ImVec2(pos.x + 20, pos.y + 5));

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 10,
                    ImGui.GetCursorPos().y + 4
                )
            );

            if (properties.fonts) {
                ImGui.PushFont(properties.fonts.details);
            }

            ImGui.Text("Ctrl + click for keyboard input");

            if (properties.fonts) {
                ImGui.PopFont();
            }

            // ImGui.Separator();

            // ImGui.Text("Brush settings");

            ImGui.SetCursorPos(new ImGui.ImVec2(pos.x + 30, pos.y + 35));

            var total_w = ImGui.GetContentRegionAvail().x;

            var radius = [properties.brushSize];
            ImGui.Text("Radius");

            ImGui.SameLine(total_w / 2 - 15);
            ImGui.SetNextItemWidth(total_w / 2);
            ImGui.SliderFloat("##RadiusSlider", radius, 0.001, 0.200);
            properties.brushSize = radius[0];

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 30.0,
                    ImGui.GetCursorPos().y + 10
                )
            );

            var strength = [properties.strength];
            ImGui.Text("Strength");

            ImGui.SameLine(total_w / 2 - 15);
            ImGui.SetNextItemWidth(total_w / 2);
            ImGui.SliderFloat("##StrengthSlider", strength, 0.1, 10.0);
            properties.strength = strength[0];

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x,
                    ImGui.GetCursorPos().y + 14
                )
            );

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 30.0,
                    ImGui.GetCursorPos().y
                )
            );

            var negative = [properties.negativeSculpt];

            ImGui.Text("Negative");

            ImGui.SameLine(total_w / 2 - 15);

            ImGui.Checkbox("##Negative", negative);

            if (properties.fonts) {
                ImGui.PushFont(properties.fonts.details);
            }

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 30.0,
                    ImGui.GetCursorPos().y
                )
            );

            ImGui.Text("*Shortcut: Shift");

            if (properties.fonts) {
                ImGui.PopFont();
            }

            // properties.negativeSculpt = negative[0];
        }

        ImGui.PopStyleColor();
        ImGui.PopStyleColor();

        ImGui.PopStyleVar();

        ImGui.EndChild();
    } else {
        brushSettingsIsOpen = false;
    }

    ImGui.PopItemWidth();

    ImGui.PopStyleColor();

    ImGui.SetItemAllowOverlap();

    var lastPos = ImGui.GetCursorPos();

    ImGui.SetCursorPos(new ImGui.ImVec2(firstPos.x, firstPos.y + 1.8));

    ImGui.Text(arrowIcon + " Brush settings");

    ImGui.SetCursorPos(lastPos);

    ImGui.PopID();
}
