import * as ImGui from "../../../imgui-js/dist/imgui.umd.js";

export var greenBlueCrayola = new ImGui.ImVec4(28 / 255, 141 / 255, 217 / 255, 255 / 255);
export var lightGreenBlueCrayola = new ImGui.ImVec4(54 / 255, 158 / 255, 227 / 255, 255 / 255);
export var eerieBlack = new ImGui.ImVec4(19 / 255, 19 / 255, 21 / 255, 255 / 255);
export var lightEerieBlack = new ImGui.ImVec4(55 / 255, 55 / 255, 55 / 255, 255 / 255);
export var rubyRed = new ImGui.ImVec4(163 / 255, 0 / 255, 21 / 255, 255 / 255);
export var gainsboro = new ImGui.ImVec4(213 / 255, 223 / 255, 229 / 255);
export var lightGainsboro = new ImGui.ImVec4(234 / 255, 245 / 255, 251 / 255, 255 / 255);

var windowBgColor = new ImGui.ImVec4(0.11, 0.11, 0.11, 1);
var frameBgColor = new ImGui.ImVec4(0.12, 0.12, 0.12, 1.0);
var frameBgHoveredColor = new ImGui.ImVec4(0.11, 0.11, 0.11, 1.0);
var frameBgActiveColor = new ImGui.ImVec4(0.10, 0.10, 0.10, 1.0);
var titleBgColor = new ImGui.ImVec4(0.08, 0.08, 0.08, 1.0);
var menuBarColor = new ImGui.ImVec4(0.17, 0.17, 0.17, 1.0);
var buttonColor = new ImGui.ImVec4(0.20, 0.20, 0.20, 1);
var buttonColorHovered = new ImGui.ImVec4(28 / 255, 141 / 255, 217 / 255, 1);
var textColor = new ImGui.ImVec4(0.9, 0.9, 0.9, 1.0);
var minWindowSize = new ImGui.ImVec2(0, 0);

export function styleConfig() {
    ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBg, titleBgColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBgActive, titleBgColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, frameBgColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBgHovered, frameBgHoveredColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBgActive, frameBgActiveColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.Button, buttonColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.ButtonHovered, buttonColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.Header, buttonColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, windowBgColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.Text, textColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.MenuBarBg, menuBarColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.Tab, greenBlueCrayola);
    ImGui.PushStyleColor(ImGui.ImGuiCol.TabActive, greenBlueCrayola);
    ImGui.PushStyleColor(ImGui.ImGuiCol.Separator, buttonColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.ResizeGrip, 0);
    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.WindowBorderSize, 0);
    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.WindowMinSize, minWindowSize);
    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.PopupBorderSize, 0.0);
    // ImGui.PushStyleVar(ImGui.ImGuiStyleVar.MenuButtonPosition, -1);
}