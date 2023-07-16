import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import * as icons from "../icons/icons.js";

var modes = ["Scene", "Inspector", "Sculpt", "Transform", "Edit"];
var tools = ["Select", "Translate", "Rotate", "Scale"];
var iconSymbols = [icons.edge, icons.up_down_left_right, icons.pen_fancy, icons.plus];
var selectedMode = "";
var selectedTool = "";
var color = new ImGui.ImVec4(0.35, 0.35, 0.35, 1.0);
var childBgColor = new ImGui.ImVec4(0.29, 0.29, 0.29, 1.0);
var nameSectionBgColor = new ImGui.ImVec4(49 / 255, 140 / 255, 253 / 255, 1.0);
var frameBgColor = new ImGui.ImVec4(0.31, 0.31, 0.31, 1.0);
var frameBgHoveredColor = new ImGui.ImVec4(0.38, 0.38, 0.38, 1.0);
var frameBgActiveColor = new ImGui.ImVec4(0.25, 0.25, 0.25, 1.0);
var nameInputBgColor = new ImGui.ImVec4(70 / 255, 160 / 255, 255 / 255, 1.0);
var textureElementBgColor = new ImGui.ImVec4(0.35, 0.35, 0.35, 255 / 255);
var selectedEntity = "";
var strength = 5;
var radius = 0.2;
var titleBgColor = new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0);
var sentFirstMessage = false;

export function chat(canvas, properties, socket) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(350, 205);
    var position = new ImGui.ImVec2(0, canvas.clientHeight - 200);

    ImGui.SetNextWindowSize(size);
    // ImGui.SetNextWindowPos(position);

    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(8.0, 4.0));
    ImGui.Begin("Prompt", null, ImGui.WindowFlags.NoCollapse | ImGui.WindowFlags.NoResize);
    ImGui.PopStyleVar();

    ImGui.PushStyleColor(ImGui.ImGuiCol.ChildBg, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));

    ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 5, ImGui.GetCursorPos().y + 5));

    if (properties.fonts) {
        ImGui.PopFont();
    }

    if (ImGui.BeginChild("##ChatMessages", new ImGui.ImVec2(340, 150), false)) {
        for (var i = 0; i < properties.chatMessages.length; i++) {
            var message = properties.chatMessages[i];
            ImGui.Text("Jojidebuta: " + message);
        }

        if (properties.newMessage) {
            ImGui.SetScrollHereY(1.0);
            properties.newMessage = false;
        }
            

        ImGui.EndChild();
    }

    ImGui.PopStyleColor();

    ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 5, ImGui.GetCursorPos().y));

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.primary);
    }

    if (properties.message) {
        if (ImGui.InputText("##ChatInput", properties.message, 250, ImGui.InputTextFlags.EnterReturnsTrue)) {
            socket.sendChatMessageToServer(properties.message);
            properties.message = new ImGui.StringBuffer(64, "");
            ImGui.SetKeyboardFocusHere(-1);
            properties.newMessage = true;
        }

        if (ImGui.IsItemFocused() && !sentFirstMessage) {
            properties.message = new ImGui.StringBuffer(64, "");
            sentFirstMessage = true;
        }
    }

    if (properties.fonts) {
        ImGui.PopFont();
    }
}