import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import * as icons from "../icons/icons.js";
import { setEntity } from "../UI.js";

export function sceneHierarchyPanel(canvas, properties) {
    window.addEventListener("mouseup", (event) => { mouseUpCallback(event, properties); });
    window.addEventListener("dblclick", (event) => {  dblClickCallback(event, properties); });
    window.addEventListener("mousedown", (event) => { mouseDownCallback(event, properties); });

    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight - 19 - 12);
    var position = new ImGui.ImVec2(canvas.clientWidth - 225, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    if (ImGui.Begin(properties.scene.name, null, ImGui.WindowFlags.NoBringToFrontOnFocus | ImGui.WindowFlags.NoCollapse)) {
    };

    size = new ImGui.ImVec2(205, 225);
    position = new ImGui.ImVec2(canvas.clientWidth - 215, 50 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var color = new ImGui.ImVec4(0.1, 0.1, 0.1, 1.0);

    ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, color);

    var padding = new ImGui.ImVec2(5.0, 5.0);

    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, padding);

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.secondary);
    }

    if (ImGui.Begin("a", null, ImGui.WindowFlags.NoTitleBar)) {
        if (properties.scene.entities.length > 0) {
            for (var i = 0; i < properties.scene.entities.length; i++) {
                var total_w = ImGui.GetContentRegionAvail().x;
                var size = new ImGui.ImVec2(total_w, 16.0);

                var total_w = ImGui.GetContentRegionAvail().x;
                var size = new ImGui.ImVec2(total_w, 16.0);

                var pos_before = new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y);
                var pos_after = new ImGui.ImVec2();

                if (ImGui.Selectable(properties.scene.entities[i].name, properties.selectedEntity === properties.scene.entities[i], 0, size)) {
                    pos_after = new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y);

                    setEntity(properties.scene.entities[i], properties, i);

                    properties.entityToRemove = i;

                    if (properties.dblclick && ImGui.IsItemHovered) {
                        properties.dblclick = false;
                        properties.displayInputText = true;
                    }
                }

                var nameBuffer = new ImGui.StringBuffer(64, properties.scene.entities[i].name);

                if (properties.displayInputText && properties.scene.entities[i] === properties.selectedEntity) {
                    ImGui.PushItemWidth(202);
                    ImGui.SetKeyboardFocusHere(0);
                    ImGui.SetItemAllowOverlap();
                    ImGui.SetCursorPos(new ImGui.ImVec2(pos_before.x - 4, pos_before.y - 2));
                    ImGui.InputText("", nameBuffer, 64);
                    properties.scene.entities[i].name = nameBuffer.buffer;

                    properties.hoveredItem = ImGui.IsItemHovered();

                    // ACA HAY UN BUG QUE SI BORRAS TODO EL TEXTO YA NO PODES ESCRIBIR EN NINGUN SELECTABLE. ARREGLAR.
                }

                ImGui.SetItemAllowOverlap();

                ImGui.SameLine(total_w - 15.0);

                if (properties.fonts) {
                    ImGui.PushFont(properties.fonts.secondary);
                }

                ImGui.PushID(i);

                if (properties.scene.entities[i].show) {
                    if (ImGui.Button(icons.eye)) {
                        properties.scene.entities[i].show = false;
                    }
                } else {
                    if (ImGui.Button(icons.eye_slash)) {
                        properties.scene.entities[i].show = true;
                    }
                }

                ImGui.PopID();

                if (properties.fonts) {
                    ImGui.PopFont();
                }
            }
        } else {
            ImGui.Text("The scene has no objects.");
        }

    }

    ImGui.PopStyleVar();

    ImGui.PopStyleColor();
}

function mouseUpCallback(event, properties) {
    if (event.button === 0 && properties.dblclick) {
        properties.dblclick = false;
    }
}

function dblClickCallback(event, properties) {
    if (event.button === 0) {
        properties.dblclick = true;
    }
}

function mouseDownCallback(event, properties) {
    if (event.button === 0 && properties.displayInputText && !properties.hoveredItem) {
        properties.displayInputText = false;
    }
}
