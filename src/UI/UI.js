import * as ImGui from "../../../imgui-js/dist/imgui.umd.js";
import * as ImGuiImpl from "../../../imgui-js/dist/imgui_impl.umd.js";
import { sideBar } from "./components/sideBar";
import { selectedModePanel } from "./components/selectedModePanel.js";
import { styleConfig } from "./styleConfig";
import { loadFonts } from "./loadFonts";
import { UIproperties } from "./UIproperties";
import { mainMenuBar } from "./components/mainMenuBar.js";
import { sceneHierarchyPanel } from "./components/sceneHierarchyPanel.js";
import {
    cubeTextures,
    coatTextures,
    glassesTextures,
} from "./components/modelTextures";
import { loadTexture, loadMatcapTextures } from "../texture";
import * as icons from "./icons/icons.js";
import { inspectorPanel } from "./refactor/inspector.js";
import { sceneHierarchy } from "./refactor/sceneHierarchy.js";
import { sculptPanel } from "./refactor/sculptPanel.js";
import { materialPanel } from "./refactor/materialPanel.js";
import { editPanel } from "./refactor/editPanel.js";
import { toolBar } from "./refactor/toolBar.js";
import { chat } from "./refactor/chat.js";
import { importPanel } from "./refactor/importPanel.js";
import $ from "jquery";
import { vec3, mat4, quat } from "gl-matrix";
import { greenBlueCrayola, lightGreenBlueCrayola } from "./styleConfig";

var modes = ["Scene", "Edit", "Sculpt"];
var renderingModes = ["Wireframe"];
var renderingModesIcons = [
    icons.shading_wire,
    icons.shading_solid,
    icons.shading_rendered,
];
var selectedMode = "";
var selectedTool = "";
var selectedRenderingMode = "";
var color = new ImGui.ImVec4(0.35, 0.35, 0.35, 1.0);

function anotherBar(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(canvas.clientWidth, 26);
    var position = new ImGui.ImVec2(0, 0);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var buttonSize = new ImGui.ImVec2(62.0, 14.0);

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.primary);
    }

    var padding = new ImGui.ImVec2(0, 0);
    var buttonTextAlign = new ImGui.ImVec2(0.5, 0.7);
    var buttonPadding = new ImGui.ImVec2(65.0 + 10.0, 0.0);

    var color = new ImGui.ImVec4(0.5, 0.0, 0.0, 1.0);

    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, padding);
    ImGui.PushStyleVar(ImGui.StyleVar.SelectableTextAlign, buttonTextAlign);

    ImGui.PushStyleVar(ImGui.StyleVar.FrameRounding, 0.0);

    ImGui.Begin(
        "#Bar",
        null,
        ImGui.WindowFlags.NoTitleBar |
            ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoBringToFrontOnFocus |
            ImGui.WindowFlags.NoResize
    );

    var initPos = new ImGui.ImVec2(8.0, 6.0);

    ImGui.SetCursorPos(initPos);

    const draw_list = ImGui.GetWindowDrawList();

    var active = new ImGui.ImVec4(28 / 255, 141 / 255, 217 / 255, 1.0);
    var hovered = new ImGui.ImVec4(35 / 255, 35 / 255, 35 / 255, 1.0);

    ImGui.PushStyleColor(ImGui.ImGuiCol.Header, active);

    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderHovered, hovered);

    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderActive, active);

    for (var i = 0; i < modes.length; i++) {
        var startPos = ImGui.GetCursorPos();

        draw_list.ChannelsSplit(3);

        draw_list.ChannelsSetCurrent(1);

        ImGui.PushStyleVar(
            ImGui.StyleVar.FramePadding,
            new ImGui.ImVec2(0.0, 0.0)
        );

        if (
            ImGui.Selectable(
                modes[i],
                properties.selectedMode === modes[i],
                0 | ImGui.SelectableFlags.SelectOnClick,
                buttonSize
            )
        ) {
            // if (modes[i] !== "Import") {
                properties.selectedMode = modes[i];
            // } else {
            // }
        }

        if (!ImGui.IsItemHovered()) {
            draw_list.ChannelsSetCurrent(0);
            var p_min = ImGui.GetItemRectMin();
            var p_max = ImGui.GetItemRectMax();
            draw_list.AddRectFilled(p_min, p_max, ImGui.COL32(28, 28, 28, 255));
        }

        draw_list.ChannelsMerge();

        ImGui.SameLine();

        var nextPos = new ImGui.ImVec2(
            startPos.x + buttonPadding.x,
            startPos.y + buttonPadding.y
        );

        ImGui.SetCursorPos(nextPos);

        ImGui.PopStyleVar();
    }

    ImGui.PushStyleVar(
        ImGui.StyleVar.FramePadding,
        new ImGui.ImVec2(0.0, 0.0)
    );

    ImGui.PopStyleVar();

    ImGui.SetCursorPos(
        new ImGui.ImVec2(canvas.clientWidth - 75, ImGui.GetCursorPos().y)
    );

    // if (
    //     ImGui.Selectable(
    //         icons.preferences + " Settings",
    //         properties.selectedMode === modes[i],
    //         0,
    //         ImGui.SelectableFlags.SelectOnClick
    //     )
    // ) {
    //     properties.selectedMode = "Settings";
    // }

    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
}

function renderingModesPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(28, 25);
    var position = new ImGui.ImVec2(990, 80);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var buttonSize = new ImGui.ImVec2(12.0, 14.0);

    var padding = new ImGui.ImVec2(0, 0);
    var buttonTextAlign = new ImGui.ImVec2(0.5, 0.7);
    var buttonPadding = new ImGui.ImVec2(12.0 + 10.0, 0.0);

    var color = new ImGui.ImVec4(0.5, 0.0, 0.0, 1.0);

    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, padding);
    ImGui.PushStyleVar(ImGui.StyleVar.SelectableTextAlign, buttonTextAlign);

    ImGui.PushStyleVar(ImGui.StyleVar.FrameRounding, 0.0);

    ImGui.Begin(
        "##RenderingMode",
        null,
        ImGui.WindowFlags.NoTitleBar |
            ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoBringToFrontOnFocus |
            ImGui.WindowFlags.NoResize
    );

    var initPos = new ImGui.ImVec2(8.0, 6.0);

    ImGui.SetCursorPos(initPos);

    const draw_list = ImGui.GetWindowDrawList();

    var active = new ImGui.ImVec4(28 / 255, 141 / 255, 217 / 255, 1.0);
    var hovered = new ImGui.ImVec4(45 / 255, 45 / 255, 45 / 255, 1.0);

    ImGui.PushStyleColor(ImGui.ImGuiCol.Header, active);

    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderHovered, hovered);

    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderActive, active);

    for (var i = 0; i < renderingModes.length; i++) {
        var startPos = ImGui.GetCursorPos();

        draw_list.ChannelsSplit(3);

        draw_list.ChannelsSetCurrent(1);

        ImGui.PushStyleVar(
            ImGui.StyleVar.FramePadding,
            new ImGui.ImVec2(0.0, 0.0)
        );

        if (
            ImGui.Selectable(
                renderingModesIcons[i],
                properties.selectedRenderingMode === renderingModes[i],
                0 | ImGui.SelectableFlags.SelectOnClick,
                buttonSize
            )
        ) {
            if (properties.selectedRenderingMode === renderingModes[i]) {
                properties.selectedRenderingMode = "";
            } else {
                properties.selectedRenderingMode = renderingModes[i];
            }
        }

        ImGui.PopStyleVar();

        if (!ImGui.IsItemHovered()) {
            draw_list.ChannelsSetCurrent(0);
            var p_min = ImGui.GetItemRectMin();
            var p_max = ImGui.GetItemRectMax();
            draw_list.AddRectFilled(p_min, p_max, ImGui.COL32(35, 35, 35, 255));
        }

        draw_list.ChannelsMerge();

        ImGui.SameLine();

        var nextPos = new ImGui.ImVec2(
            startPos.x + buttonPadding.x,
            startPos.y + buttonPadding.y
        );

        ImGui.SetCursorPos(nextPos);
    }

    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
}

function cameraSwitchPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(30, 25);
    var position = new ImGui.ImVec2(850, 40);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var buttonSize = new ImGui.ImVec2(75.0, 25.0);
    
    var padding = new ImGui.ImVec2(0, 0);
    var buttonTextAlign = new ImGui.ImVec2(0.5, 0.7);
    var buttonPadding = new ImGui.ImVec2(12.0 + 10.0, 0.0);

    var color = new ImGui.ImVec4(0.5, 0.0, 0.0, 1.0);

    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, padding);
    ImGui.PushStyleVar(ImGui.StyleVar.SelectableTextAlign, buttonTextAlign);

    ImGui.PushStyleVar(ImGui.StyleVar.FrameRounding, 0.0);

    ImGui.Begin(
        "##CameraSwitch",
        null,
        ImGui.WindowFlags.NoTitleBar |
            ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoBringToFrontOnFocus |
            ImGui.WindowFlags.NoResize
    );

    var initPos = new ImGui.ImVec2(8.0, 6.0);

    ImGui.SetCursorPos(initPos);

    const draw_list = ImGui.GetWindowDrawList();

    var active = new ImGui.ImVec4(28 / 255, 141 / 255, 217 / 255, 1.0);
    var hovered = new ImGui.ImVec4(35 / 255, 35 / 255, 35 / 255, 1.0);

    ImGui.PushStyleColor(ImGui.ImGuiCol.Header, active);

    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderHovered, hovered);

    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderActive, active);

    ImGui.Text(icons.restrict_render_off);

    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.PopupBorderSize, 0.0);

    if (ImGui.IsItemHovered()) {
        ImGui.BeginTooltip();
        ImGui.Text("Camera type");
        ImGui.EndTooltip();
    }

    ImGui.PopStyleVar();

    // ImGui.SameLine();

    var size = new ImGui.ImVec2(75, 25);
    var position = new ImGui.ImVec2(880, 40);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    ImGui.Begin(
        "##CameraSelector",
        null,
        ImGui.WindowFlags.NoTitleBar |
            ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoBringToFrontOnFocus |
            ImGui.WindowFlags.NoResize
    );

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.Button,
        new ImGui.ImVec4(0.1, 0.1, 0.1, 1.0)
    );

    if (ImGui.Button(properties.selectedCameraType, buttonSize)) {
        ImGui.OpenPopup("cameraTypes");
    }

    ImGui.PopStyleColor();

    var size = new ImGui.ImVec2(70, 25);

    // ImGui.PushStyleVar(
    //     ImGui.ImGuiStyleVar.WindowPadding,
    //     new ImGui.ImVec2(5.0, 5.0)
    // );

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.PopupBg,
        new ImGui.ImVec4(0.1, 0.1, 0.1, 1.0)
    );

    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.PopupBorderSize, 0.0);

    if (ImGui.BeginPopup("cameraTypes")) {
        for (var i = 0; i < properties.cameraTypes.length; i++) {
            if (
                ImGui.Selectable(
                    properties.cameraTypes[i],
                    properties.selectedCameraType === properties.cameraTypes[i],
                    0,
                    size
                )
            ) {
                if (
                    properties.selectedCameraType !== properties.cameraTypes[i]
                ) {
                    properties.changeCamera = true;
                }

                properties.selectedCameraType = properties.cameraTypes[i];
            }
        }
    }

    ImGui.PopStyleVar();

    // ImGui.PopStyleVar();
    ImGui.PopStyleColor();

    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
}

function toolSideBar(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(0.0);

    var size = new ImGui.ImVec2(50, 58.0 * 4);
    var position = new ImGui.ImVec2(8, 125);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    var buttonSize = new ImGui.ImVec2(24.0, 24.0);
    var color = new ImGui.ImVec4(0.1, 0.1, 0.1, 1.0);

    var align = new ImGui.ImVec2(0.5, 0.7);

    ImGui.PushStyleVar(ImGui.StyleVar.SelectableTextAlign, align);
    // ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, color);

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.primary);
    }

    var buttonPadding = new ImGui.ImVec2(0.0, 34.0);

    var active = new ImGui.ImVec4(28 / 255, 141 / 255, 217 / 255, 1.0);
    var activeLight = new ImGui.ImVec4(38 / 255, 148 / 255, 225 / 255, 1.0);

    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(9, 0));
    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, new ImGui.ImVec2(9, 0));

    ImGui.PushStyleColor(ImGui.ImGuiCol.Header, active);
    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderHovered, activeLight);
    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderActive, active);

    if (
        ImGui.Begin(
            "#Tools",
            null,
            ImGui.WindowFlags.NoTitleBar | ImGui.WindowFlags.NoCollapse
        )
    ) {
        const draw_list = ImGui.GetWindowDrawList();

        for (var i = 0; i < properties.toolIcons.length; i++) {
            var startPos = ImGui.GetCursorPos();

            draw_list.ChannelsSplit(2);

            draw_list.ChannelsSetCurrent(1);

            if (
                ImGui.Selectable(
                    properties.toolIcons[i],
                    properties.selectedTool === properties.transformTools[i],
                    0,
                    buttonSize
                )
            ) {
                if (properties.selectedTool === properties.transformTools[i]) {
                    properties.selectedTool = "";
                } else {
                    properties.selectedTool = properties.transformTools[i];
                }

                properties.newToolSelected = true;
            }

            if (!ImGui.IsItemHovered()) {
                // Render background behind Selectable().
                draw_list.ChannelsSetCurrent(0);
                var p_min = ImGui.GetItemRectMin();
                var p_max = ImGui.GetItemRectMax();
                draw_list.AddRectFilled(
                    p_min,
                    p_max,
                    ImGui.COL32(0.15 * 255, 0.15 * 255, 0.15 * 255, 255)
                );
            }

            draw_list.ChannelsMerge();

            ImGui.PushStyleVar(ImGui.ImGuiStyleVar.PopupBorderSize, 0.0);

            if (ImGui.IsItemHovered()) {
                ImGui.BeginTooltip();
                ImGui.Text(properties.transformTools[i]);
                ImGui.EndTooltip();
            }

            ImGui.PopStyleVar();

            var nextPos = new ImGui.ImVec2(
                startPos.x + buttonPadding.x,
                startPos.y + buttonPadding.y
            );

            ImGui.SetCursorPos(nextPos);
        }
    }

    if (properties.fonts) {
        ImGui.PopFont();
    }

    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    // ImGui.PopStyleColor();
    // ImGui.PopStyleColor();
}

function newScenePanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(canvas.clientWidth, canvas.clientHeight);
    var position = new ImGui.ImVec2(0, 0);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.primary);
    }

    var padding = new ImGui.ImVec2(0, 0);
    var buttonTextAlign = new ImGui.ImVec2(0.5, 0.7);
    var buttonPadding = new ImGui.ImVec2(12.0 + 10.0, 0.0);

    var color = new ImGui.ImVec4(0.5, 0.0, 0.0, 1.0);

    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, padding);
    ImGui.PushStyleVar(ImGui.StyleVar.SelectableTextAlign, buttonTextAlign);

    ImGui.PushStyleVar(ImGui.StyleVar.FrameRounding, 0.0);

    ImGui.Begin(
        "##newScenePanel",
        null,
        ImGui.WindowFlags.NoTitleBar |
            ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoBringToFrontOnFocus |
            ImGui.WindowFlags.NoResize
    );

    if (properties.fonts) {
        ImGui.PopFont();
    }

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.secondary);
    }

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 100.0,
            ImGui.GetCursorPos().y + 85
        )
    );

    var firstPos = ImGui.GetCursorPos();

    ImGui.Text("Open recent scene");

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 100.0,
            ImGui.GetCursorPos().y + 25
        )
    );

    if (properties.fonts) {
        ImGui.PopFont();
    }

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.primary);
    }

    ImGui.PushItemWidth(250.0);

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.FrameBg,
        new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)
    );

    if (properties.sceneInput) {
        ImGui.InputText(
            "##sceneInput",
            properties.sceneInput,
            100,
            ImGui.InputTextFlags.EnterReturnsTrue
        );
    }

    ImGui.PopStyleColor();

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 100.0,
            ImGui.GetCursorPos().y + 15
        )
    );

    ImGui.Text("There are no recent scenes.");

    if (properties.fonts) {
        ImGui.PopFont();
    }

    ImGui.SetCursorPos(firstPos);

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x + 650.0, ImGui.GetCursorPos().y)
    );

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.secondary);
    }

    ImGui.Text("Get started");

    if (properties.fonts) {
        ImGui.PopFont();
    }

    ImGui.SetCursorPos(firstPos);

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 650,
            ImGui.GetCursorPos().y + 40.0
        )
    );

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.chat);
    }

    var size = new ImGui.ImVec2(150.0, 35.0);

    if (ImGui.Button("Create new scene", size)) {
        properties.creatingScene = true;
    }

    if (properties.fonts) {
        ImGui.PopFont();
    }
}

function sceneCreatorPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(canvas.clientWidth, canvas.clientHeight);
    var position = new ImGui.ImVec2(0, 0);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.primary);
    }

    var padding = new ImGui.ImVec2(0, 0);
    var buttonTextAlign = new ImGui.ImVec2(0.5, 0.7);

    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, padding);
    ImGui.PushStyleVar(ImGui.StyleVar.SelectableTextAlign, buttonTextAlign);

    ImGui.PushStyleVar(ImGui.StyleVar.FrameRounding, 0.0);

    ImGui.Begin(
        "##newScenePanel",
        null,
        ImGui.WindowFlags.NoTitleBar |
            ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoBringToFrontOnFocus |
            ImGui.WindowFlags.NoResize
    );

    if (properties.fonts) {
        ImGui.PopFont();
    }

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.secondary);
    }

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 100.0,
            ImGui.GetCursorPos().y + 85
        )
    );

    var firstPos = ImGui.GetCursorPos();

    ImGui.Text("Create a new scene");

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 100.0,
            ImGui.GetCursorPos().y + 25
        )
    );

    if (properties.fonts) {
        ImGui.PopFont();
    }

    if (properties.fonts) {
        ImGui.PushFont(properties.fonts.chat);
    }

    ImGui.Text("Name");

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 100.0,
            ImGui.GetCursorPos().y + 8
        )
    );

    ImGui.PushItemWidth(250.0);

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.FrameBg,
        new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)
    );

    if (properties.sceneNameInput) {
        ImGui.InputText(
            "##sceneNameInput",
            properties.sceneNameInput,
            100,
            ImGui.InputTextFlags.EnterReturnsTrue
        );
    }

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 180.0,
            ImGui.GetCursorPos().y + 8
        )
    );

    ImGui.PushItemWidth(250.0);

    var size = new ImGui.ImVec2(100.0, 25.0);

    if (ImGui.Button("Create", size)) {
        properties.loadNewScene = true;
    }

    ImGui.PopStyleColor();

    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
}

export class UI {
    rendering = false;
    io;
    canvas;
    gl;
    properties = UIproperties;
    socketHandler;
    loadingFonts = true;
    value = 0;
    dir_value = 1.0;
    loading = true;
    scenes = true;
    loadingComponent = "Creating scene";

    constructor(canvas, context, socketHandler) {
        this.canvas = canvas;
        this.gl = context.gl;
        this.properties.gl = this.gl;
        this.socketHandler = socketHandler;

        this.socketHandler.getPropsFromServer(this.properties);
        this.socketHandler.getModifiedVertexDataFromServer(this.properties);
        this.socketHandler.getEntityToAddFromServer(this.properties);
        this.socketHandler.getChatMessageFromServer(this.properties);

        this.properties.socketHandler = this.socketHandler;

        loadMatcapTextures(this.gl, this.properties);
    }

    init = async () => {
        ImGui.default().then(async () => {
            ImGui.CreateContext();
            this.io = ImGui.GetIO();
            ImGui.StyleColorsDark();
            this.io.Fonts.AddFontDefault();
            this.rendering = true;

            this.properties.io = this.io;

            this.io.ConfigInputTextCursorBlink = false;

            styleConfig();

            this.properties.fonts = await loadFonts(this.io);

            this.properties.message = new ImGui.StringBuffer(
                64,
                "Enter a message..."
            );

            this.properties.sceneName = new ImGui.StringBuffer(64, "New Scene");

            this.properties.sceneInput = new ImGui.StringBuffer(
                50,
                "Enter scene name to search"
            );

            this.properties.sceneNameInput = new ImGui.StringBuffer(
                50,
                "Scene name"
            );

            this.properties.steps = 40;

            ImGuiImpl.Init(this.canvas);
        });
    };

    newFrame() {
        ImGuiImpl.NewFrame();
        ImGui.NewFrame();
    }

    render() {
        ImGui.End();

        ImGui.Render();
        ImGuiImpl.RenderDrawData(ImGui.GetDrawData());

        ImGui.EndFrame();
    }

    setCurrentMaterialTextures() {
        this.properties.albedoTexture = this.properties.selectedEntity.albedo;
        this.properties.normalTexture = this.properties.selectedEntity.normal;
        this.properties.metallicTexture =
            this.properties.selectedEntity.metallic;
        this.properties.roughnessTexture =
            this.properties.selectedEntity.roughness;
        this.properties.aoTexture = this.properties.selectedEntity.ao;
    }

    instantiate(renderTexture, then) {
        if (this.rendering) {
            this.newFrame();

            this.scenes = false;
            this.properties.creatingScene = false;
            // this.properties.loadNewScene = true;

            setTimeout(() => {
                this.loadingComponent = "Loading objects";
            }, 1200);

            setTimeout(() => {
                // this.value = 1.0;
                this.loading = false;
            }, 2400);

            // if (this.properties.creatingScene) {
            //     sceneCreatorPanel(this.canvas, this.properties);
            // }

            // if (this.scenes && !this.properties.creatingScene) {
            //     newScenePanel(this.canvas, this.properties);
            // }

            if (this.loading) {
                ImGui.SetNextWindowBgAlpha(1.0);

                var size = new ImGui.ImVec2(
                    this.canvas.clientWidth,
                    this.canvas.clientHeight
                );
                var position = new ImGui.ImVec2(0, 0);

                ImGui.SetNextWindowSize(size);
                ImGui.SetNextWindowPos(position);

                ImGui.PushStyleColor(
                    ImGui.ImGuiCol.WindowBg,
                    new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)
                );

                ImGui.Begin(
                    "##BackgroundLoading",
                    null,
                    ImGui.WindowFlags.NoTitleBar |
                        ImGui.WindowFlags.NoCollapse |
                        ImGui.WindowFlags.NoBringToFrontOnFocus
                );

                ImGui.PopStyleColor();

                ImGui.SetNextWindowBgAlpha(1.0);

                var size = new ImGui.ImVec2(400.0, this.canvas.clientHeight);
                var position = new ImGui.ImVec2(
                    this.canvas.clientWidth / 2 - 200,
                    this.canvas.clientHeight / 2
                );

                ImGui.SetNextWindowSize(size);
                ImGui.SetNextWindowPos(position);

                ImGui.PushStyleColor(
                    ImGui.ImGuiCol.WindowBg,
                    new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)
                );

                ImGui.Begin(
                    "##Loading",
                    null,
                    ImGui.WindowFlags.NoTitleBar | ImGui.WindowFlags.NoCollapse
                );

                if (this.properties.fonts) {
                    ImGui.PushFont(this.properties.fonts.primary);
                }

                ImGui.SetCursorPos(
                    new ImGui.ImVec2(
                        ImGui.GetCursorPos().x + 160,
                        ImGui.GetCursorPos().y
                    )
                );

                ImGui.Text(this.loadingComponent);

                if (this.properties.fonts) {
                    ImGui.PopFont();
                }

                this.value += 0.008 * then;

                ImGui.PushStyleVar(
                    ImGui.StyleVar.FramePadding,
                    new ImGui.ImVec2(4.0, 0.0)
                );

                ImGui.PushStyleColor(
                    ImGui.ImGuiCol.PlotHistogram,
                    lightGreenBlueCrayola
                );

                if (this.properties.fonts) {
                    ImGui.PushFont(this.properties.fonts.details);
                }

                ImGui.ProgressBar(this.value);

                if (this.properties.fonts) {
                    ImGui.PopFont();
                }

                ImGui.PopStyleVar();
                ImGui.PopStyleColor();
                ImGui.PopStyleColor();
            } else if (!this.loading) {
                ImGui.PushStyleVar(ImGui.StyleVar.ScrollbarRounding, 0.0);
                ImGui.PushStyleVar(ImGui.StyleVar.WindowBorderSize, 0.0);

                var size = new ImGui.ImVec2(
                    this.canvas.clientWidth - 300,
                    this.canvas.clientHeight - 50
                );
                var position = new ImGui.ImVec2(0, 50);

                ImGui.SetNextWindowSize(size);
                ImGui.SetNextWindowPos(position);

                var padding = new ImGui.ImVec2(0, 0);

                var colorBg = new ImGui.ImVec4(1.0, 1.0, 1.0, 1.0);

                // ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, colorBg);

                ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, padding);

                // ImGui.Begin("Scene", null, ImGui.WindowFlags.NoTitleBar | ImGui.WindowFlags.NoCollapse | ImGui.WindowFlags.NoBringToFrontOnFocus);

                // if (ImGui.IsWindowHovered()) {
                //     this.properties.renderWindow = true;
                // } else {
                //     this.properties.renderWindow = false;
                // }

                // ImGui.PopStyleColor();
                ImGui.PopStyleVar();
                ImGui.PopStyleVar();

                this.io.ConfigInputTextCursorBlink = false;

                ImGui.PushStyleVar(ImGui.StyleVar.FrameBorderSize, 0.0);

                anotherBar(this.canvas, this.properties);

                if (this.properties.selectedMode !== "Scene" && this.properties.selectedMode !== "Sculpt")
                    toolBar(this.canvas, this.properties);

                if (this.properties.selectedMode === "Edit") {
                    renderingModesPanel(this.canvas, this.properties);

                    inspectorPanel(this.gl, this.canvas, this.properties);
                }

                if (this.properties.selectedMode === "Scene") {
                    cameraSwitchPanel(this.canvas, this.properties);
                    sceneHierarchy(this.gl, this.canvas, this.properties);
                    toolSideBar(this.canvas, this.properties);
                }

                var wsize = new ImGui.ImVec2(
                    ImGui.GetWindowSize().x,
                    ImGui.GetWindowSize().y
                );

                if (this.properties.selectedMode === "Sculpt") {
                    sculptPanel(this.canvas, this.properties);
                    ImGui.Image(
                        renderTexture,
                        wsize,
                        new ImGui.ImVec2(0, 1),
                        new ImGui.ImVec2(1, 0)
                    );
                }

                // if (this.properties.selectedMode === "Material")
                //     materialPanel(this.canvas, this.properties);

                // if (this.properties.selectedMode == "Edit")
                //     editPanel(this.gl, this.canvas, this.properties);

                ImGui.SetNextWindowBgAlpha(1.0);
            
                var size = new ImGui.ImVec2(75, 24);
                var position = new ImGui.ImVec2(230, 2);

                ImGui.SetNextWindowSize(size);
                ImGui.SetNextWindowPos(position);

                ImGui.PushStyleVar(ImGui.ImGuiStyleVar.WindowPadding, new ImGui.ImVec2(0.0, 0.0));
                ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, new ImGui.ImVec4(0.5, 0.1, 0.8, 1.0));

                ImGui.Begin(
                    "##ImportButton",
                    null,
                    ImGui.WindowFlags.NoTitleBar |
                        ImGui.WindowFlags.NoCollapse | 
                        ImGui.WindowFlags.NoResize | ImGui.WindowFlags.NoScrollBar | ImGui.WindowFlags.NoBackground
                );

                ImGui.PopStyleVar();

                ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(15.0, 0.0));
                ImGui.PushStyleColor(ImGui.ImGuiCol.Button, new ImGui.ImVec4(0.11, 0.11, 0.11, 1.0));
                ImGui.PushStyleColor(ImGui.ImGuiCol.ButtonHovered, new ImGui.ImVec4(0.14, 0.14, 0.14, 1.0));
                ImGui.PushStyleColor(ImGui.ImGuiCol.ButtonActive, greenBlueCrayola);

                var bSize = new ImGui.ImVec2(65.0, 18.0);

                ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y + 2));

                if (
                    ImGui.Button("Import", bSize)
                ) 
                {
                    ImGui.OpenPopup("Import settings");
                }

                ImGui.PopStyleVar();
                ImGui.PopStyleColor();
                ImGui.PopStyleColor();
                ImGui.PopStyleColor();
            
                ImGui.SetNextWindowBgAlpha(1.0);
            
                var size = new ImGui.ImVec2(300, 212);
                var position = new ImGui.ImVec2((this.canvas.clientWidth / 2) - 150, (this.canvas.clientHeight / 2) - 150);
            
                ImGui.SetNextWindowSize(size);
                ImGui.SetNextWindowPos(position);
            
                ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBg, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));
                ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBgActive, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));
                ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(8.0, 4.0));
                ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, new ImGui.ImVec2(20.0, 20.0));
            
                ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 7.8, ImGui.GetCursorPos().y + 0.0));
            
                // var buttonSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x / 2.0, 20.0);

                importPanel(this.canvas, this.properties);
            
                // if (ImGui.BeginPopup("import_Panel")) {
                //     ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x - 5.0, ImGui.GetCursorPos().y + 18.0));
                //     ImGui.Text("Hola");
                //     ImGui.EndPopup();
                // }
            
                // ImGui.PopStyleColor();
                ImGui.PopStyleColor();
                ImGui.PopStyleColor();

                if (this.properties.selectedMode !== "Scene" && this.properties.selectedMode !== "Sculpt") {
                    ImGui.PopStyleColor();
                    ImGui.PopStyleColor();
                    ImGui.PopStyleVar();
                }

                if (this.properties.selectedMode !== "Sculpt") {
                    ImGui.PopStyleVar();
                }
                
                ImGui.PopStyleVar();
                ImGui.PopStyleVar();
                ImGui.PopStyleVar();
                ImGui.PopStyleVar();
                // ImGui.PopStyleVar();
                // ImGui.PopStyleVar();

                // importPanel(this.gl, this.canvas, this.properties);

                // chat(this.canvas, this.properties, this.socketHandler);
                // }

                // sideBar(this.canvas, this.properties);

                // sceneHierarchyPanel(this.canvas, this.properties);

                // selectedModePanel(this.canvas, this.gl, this.properties, this.io);

                // var properties = {
                //     transformPosition: this.properties.transformPosition,
                //     transformRotation: this.properties.transformRotation,
                //     transformScale: this.properties.transformScale,
                //     selectedIndex: this.properties.selectedEntity.id
                // }

                // this.socketHandler.sendPropsToServer(properties);
            }

            this.render();
        }
        // }
    }

    resetMessage() {
        this.properties.message.buffer = "";
    }
}

export function setEntity(entity, properties, index) {
    if (properties.selectedEntity) {
        properties.selectedEntity.isSelected = false;
    }

    properties.selectedEntity = entity;
    properties.selectedMeshFromEntity = entity.topMeshes[0];
    properties.selectedIndex = index;

    var _translation = vec3.create();
    var _rotation = quat.create();
    var _scale = vec3.create();

    decompose(entity.worldMatrix, _translation, _rotation, _scale);

    // // console.log(_translation);

    properties.transformPosition = _translation;
    properties.transformRotation = _rotation;

    if (!entity.type) {
        properties.transformScale = _scale;
    }

    properties.selectedEntity.isSelected = true;
    properties.newSelected = true;
}

export function setCamera(camera, properties) {
    if (properties.activeCamera !== -1) {
        properties.scene.lastCamera = properties.activeCamera;
        properties.scene.cameras[properties.scene.lastCamera].active = false;
    }

    properties.scene.activeCamera += 1;
    properties.scene.cameras[properties.scene.activeCamera].active = true;
    properties.activeCamera = properties.scene.activeCamera;

    properties.newCameraSelected = true;
    properties.newSelected = true;

    properties.selectedEntity = camera;
}

function decompose(srcMat, dstTranslation, dstRotation, dstScale) {
    var sx = vec3.length([srcMat[0], srcMat[1], srcMat[2]]);
    const sy = vec3.length([srcMat[4], srcMat[5], srcMat[6]]);
    const sz = vec3.length([srcMat[8], srcMat[9], srcMat[10]]);

    // if determine is negative, we need to invert one scale
    const det = mat4.determinant(srcMat);
    if (det < 0) sx = -sx;

    dstTranslation[0] = srcMat[12];
    dstTranslation[1] = srcMat[13];
    dstTranslation[2] = srcMat[14];

    // scale the rotation part
    const _m1 = srcMat.slice();

    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;

    _m1[0] *= invSX;
    _m1[1] *= invSX;
    _m1[2] *= invSX;

    _m1[4] *= invSY;
    _m1[5] *= invSY;
    _m1[6] *= invSY;

    _m1[8] *= invSZ;
    _m1[9] *= invSZ;
    _m1[10] *= invSZ;

    mat4.getRotation(dstRotation, _m1);

    dstScale[0] = sx;
    dstScale[1] = sy;
    dstScale[2] = sz;
}
