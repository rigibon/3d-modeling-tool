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
var titleBgColor = new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)

export function materialPanel(canvas, properties) {
    // ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBg, titleBgColor);
    // ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBgActive, titleBgColor);
    // ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, frameBgColor);
    // ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBgHovered, frameBgHoveredColor);
    // ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBgActive, frameBgActiveColor);

    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(300, canvas.clientHeight);
    var position = new ImGui.ImVec2(canvas.clientWidth  , 26);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(8.0, 4.0));
    ImGui.Begin("Material", null, ImGui.WindowFlags.NoCollapse | ImGui.WindowFlags.NoScrollBar);
    ImGui.PopStyleVar();

    var initTabPos = ImGui.GetCursorPos();
    var pos = new ImGui.ImVec2(initTabPos.x, initTabPos.y - 10);

    ImGui.SetCursorPos(pos);

    var draw_list = ImGui.GetWindowDrawList();
    draw_list.ChannelsSplit(2);

    draw_list.ChannelsSetCurrent(0);

    var modelNameBuffer = new ImGui.StringBuffer(64, "Material001");

    if (ImGui.BeginChild("##MaterialPanel", new ImGui.Vec2(300, canvas.clientHeight - 60))) {
        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 1.0, ImGui.GetCursorPos().y + 10.0));
        var total_w = ImGui.GetContentRegionAvail().x;

        ImGui.Text("Name");
        ImGui.SameLine((total_w / 2) - 15);
        ImGui.SetNextItemWidth(total_w / 2);

        var p_min = new ImGui.ImVec2(ImGui.GetCursorScreenPos().x, ImGui.GetCursorScreenPos().y + 5);
        var p_max = new ImGui.ImVec2(ImGui.GetCursorScreenPos().x + (total_w / 2) - 1, ImGui.GetCursorScreenPos().y + 18);


        draw_list.ChannelsSetCurrent(0);

        draw_list.AddRectFilled(p_min, p_max, ImGui.IM_COL32(0.21 * 255, 0.21 * 255, 0.21 * 255, 255));

        draw_list.ChannelsSetCurrent(0);
       
        ImGui.InputText("##MaterialLabel", modelNameBuffer, 128);
        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x - 6.0, ImGui.GetCursorPos().y + 10.0));
        ImGui.Image(null, new ImGui.ImVec2(290, 120), new ImGui.ImVec2(0, 1), new ImGui.ImVec2(1, 0));
        
        
        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 1.0, ImGui.GetCursorPos().y + 10));
        ImGui.Text("Radius");
        
        ImGui.SameLine((total_w / 2) - 15);
        ImGui.SetNextItemWidth(total_w / 2);

        var p_min = new ImGui.ImVec2(ImGui.GetCursorScreenPos().x, ImGui.GetCursorScreenPos().y + 5);
        var p_max = new ImGui.ImVec2(ImGui.GetCursorScreenPos().x + (total_w / 2) - 1, ImGui.GetCursorScreenPos().y + 18);


        draw_list.ChannelsSetCurrent(0);

        draw_list.AddRectFilled(p_min, p_max, ImGui.IM_COL32(0.21 * 255, 0.21 * 255, 0.21 * 255, 255));

        draw_list.ChannelsSetCurrent(0);
        
        ImGui.SliderFloat("##RadiusSlider", [radius], 1.0);

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 1.0, ImGui.GetCursorPos().y + 10));
        ImGui.Text("Strength");
        
        ImGui.SameLine((total_w / 2) - 15);
        ImGui.SetNextItemWidth(total_w / 2);

        var p_min = new ImGui.ImVec2(ImGui.GetCursorScreenPos().x, ImGui.GetCursorScreenPos().y + 5);
        var p_max = new ImGui.ImVec2(ImGui.GetCursorScreenPos().x + (total_w / 2) - 1, ImGui.GetCursorScreenPos().y + 18);


        draw_list.ChannelsSetCurrent(0);

        draw_list.AddRectFilled(p_min, p_max, ImGui.IM_COL32(0.21 * 255, 0.21 * 255, 0.21 * 255, 255));

        draw_list.ChannelsSetCurrent(0);

        ImGui.SliderFloat("##StrengthSlider", [strength], 1.0);
    }

    // ImGui.PopStyleColor();
    // ImGui.PopStyleColor();
    // ImGui.PopStyleColor();
    // ImGui.PopStyleColor();
    // ImGui.PopStyleColor();

    ImGui.EndChild();
}