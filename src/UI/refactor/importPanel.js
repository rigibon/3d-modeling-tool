import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import * as icons from "../icons/icons.js";
import { PhongLight } from "../../light.ts";
import { Model } from "../../model.js";
import { TrackballCamera } from "../../cameras/trackballCamera.ts";
import { ThirdPersonCamera } from "../../cameras/thirdPersonCamera.ts";
import { vec3 } from "gl-matrix";
import { setEntity, setCamera } from "../UI.js";
import Primitives from "../../test/primitives.js";
import Subdivision from "../../test/subdivision.js";
import axios from "axios";

var childBgColor = new ImGui.ImVec4(0.40, 0.40, 0.40, 1.0);

var fileName = new ImGui.StringBuffer(250);
var textureName = new ImGui.StringBuffer(250);
var binName = new ImGui.StringBuffer(250);

export function importPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBg, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));
    ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBgActive, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));
    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(8.0, 4.0));
    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, new ImGui.ImVec2(20.0, 20.0));

    ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 7.8, ImGui.GetCursorPos().y + 0.0));

    var buttonSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x / 2.0, 20.0);

    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.PopupBorderSize, 0.0);

    if (ImGui.BeginPopup("Import settings")) {
        // ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x - 5.0, ImGui.GetCursorPos().y + 18.0));

        // var FramePadding = new ImGui.ImVec2(0, 8);
        // ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, childBgColor);
        // ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(50, 6));
        // ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, FramePadding);
        // ImGui.PushStyleVar(ImGui.StyleVar.TabRounding, 0.0);

        // ImGui.BeginChild("##ImportChild",
        // new ImGui.Vec2(284, 284),
        // false,
        // ImGui.WindowFlags.NoScrollBar);

        // ImGui.PopStyleVar();
        // ImGui.PopStyleVar();
        // ImGui.PopStyleVar();
        // ImGui.PopStyleColor();

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y - 12));

        ImGui.Text("Import model");

        ImGui.PushStyleColor(ImGui.ImGuiCol.ChildBg, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x - 9, ImGui.GetCursorPos().y));

        ImGui.BeginChild(
            "##BeginChild",
            new ImGui.Vec2(280, 164),
            false,
            ImGui.WindowFlags.NoScrollBar
        )

        ImGui.PopStyleColor();

        var fileInput = document.getElementById("file");

        var sendGLBObject = document.getElementById("sendGLBObjectButton");

        fileInput.onchange = function () {
            fileName.buffer = this.value.slice(12);
            properties.lastModelLoaded = fileName.buffer.substring(0, fileName.buffer.length - 4);
            sendGLBObject.click();
        }

        var total_w = ImGui.GetContentRegionAvail().x;

        ImGui.SetCursorPos(
            new ImGui.ImVec2(
                ImGui.GetCursorPos().x + 14,
                ImGui.GetCursorPos().y + 12
            )
        );

        ImGui.Text("Model file");

        ImGui.SameLine(total_w / 2 - 20);

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y - 4));

        ImGui.PushItemWidth(115.0);

        if (properties.fonts) {
            ImGui.PushFont(properties.fonts.details);
        }

        ImGui.InputText("##glbFileName", fileName, 250);

        if (properties.fonts) {
            ImGui.PopFont();
        }

        ImGui.SameLine();

        var bSize = new ImGui.ImVec2(17.0, 17.0);

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x - 7, ImGui.GetCursorPos().y));

        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.ButtonTextAlign, new ImGui.ImVec2(0.0, 0.0));
        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(0.0, 3.0));

        if (ImGui.Button(icons.downarrow_hlt, bSize)) {
            fileInput.click();
        }

        ImGui.PopStyleVar();
        ImGui.PopStyleVar();

        if (properties.fonts) {
            ImGui.PushFont(properties.fonts.details);
        }

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 14, ImGui.GetCursorPos().y + 5));

        ImGui.Text("* Only GLB format supported");

        if (properties.fonts) {
            ImGui.PopFont();
        }

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 14, ImGui.GetCursorPos().y + 15));

        // if (properties.fonts) {
        //     ImGui.PushFont(properties.fonts.details);
        // }

        ImGui.Text(icons.error + "  Some models may not be compatible with");

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 14.0, ImGui.GetCursorPos().y + 5.0));

        ImGui.Text("all the features");

        // if (properties.fonts) {
        //     ImGui.PopFont();
        // }

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 12.0, ImGui.GetCursorPos().y + 15.0));

        var bSize = new ImGui.ImVec2(55.0, 25.0);

        if (ImGui.Button("Upload", bSize)) {
            // var button = document.getElementById("button");
            // button.click();

            properties.loadNewModel = true;
            properties.modelSrc = fileName.buffer;
        }
        
        ImGui.EndChild();

        ImGui.EndPopup();
    }

    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();

    ImGui.EndChild();
}