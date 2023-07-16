import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import * as icons from "../icons/icons.js";
import { loadTexture } from "../../texture.js";
import axios from "axios";
import {
    greenBlueCrayola,
    lightGreenBlueCrayola,
    eerieBlack,
    lightEerieBlack,
    gainsboro,
    lightGainsboro,
} from "../styleConfig.js";

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
var color = new ImGui.ImVec4(0.05, 0.05, 0.05, 1.0);
var childBgColor = new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0);
var nameSectionBgColor = greenBlueCrayola;
var nameInputBgColor = lightGreenBlueCrayola;
var frameBgColor = new ImGui.ImVec4(0.2, 0.2, 0.2, 255 / 255);
var lightFrameBgColor = new ImGui.ImVec4(0.25, 0.25, 0.25, 255 / 255);
var textureElementBgColor = lightEerieBlack;
var headerBgColor = new ImGui.ImVec4(0.05, 0.05, 0.05, 255 / 255);
var matcapID = 0;
var textureType = 1;
var t = [textureType];
var isOpen = false;
var propertiesIsOpen = false;

var inspectorIsOpen = false;

var albedoTextureName = new ImGui.StringBuffer(250);
var normalTextureName = new ImGui.StringBuffer(250);
var metallicTextureName = new ImGui.StringBuffer(250);
var roughnessTextureName = new ImGui.StringBuffer(250);
var aoTextureName = new ImGui.StringBuffer(250);

export function inspectorPanel(gl, canvas, properties) {
    // ImGui.PushStyleVar(ImGui.StyleVar.ScrollbarRounding, 0.0);

    ImGui.SetCursorPos(new ImGui.ImVec2(25, 25));

    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(250, 15.0);
    var position = new ImGui.ImVec2(25, canvas.clientHeight - 25);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.WindowPadding, new ImGui.ImVec2(0.0, 0.0));

    ImGui.Begin(
        "##SelectedMeshToolTip",
        null,
        ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoScrollBar |
            ImGui.WindowFlags.NoTitleBar |
            ImGui.WindowFlags.NoResize |
            ImGui.WindowFlags.NoBackground
    );

    ImGui.PopStyleVar();

    ImGui.PushStyleColor(ImGui.ImGuiCol.Text, new ImGui.ImVec4(1.0, 1.0, 1.0, 1.0));

    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(0.0, 0.0));

    if (properties.selectedEntity && properties.selectedMeshFromEntity) {
        ImGui.Text(
            "Editing    /" +
                properties.selectedEntity.name +
                "/" +
                properties.selectedMeshFromEntity._name
        );
    } else {
        ImGui.Text(icons.error + "  No mesh selected");
    }

    ImGui.PopStyleVar();

    ImGui.PopStyleColor();

    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(300, canvas.clientHeight + 15.0);
    var position = new ImGui.ImVec2(canvas.clientWidth - 300, 26);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    ImGui.PushStyleVar(
        ImGui.StyleVar.ItemInnerSpacing,
        new ImGui.ImVec2(0.0, 0.0)
    );

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.TitleBg,
        new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)
    );

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.TitleBgActive,
        new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0)
    );

    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(8.0, 4.0));

    if (inspectorIsOpen) {
        ImGui.Begin(
            "##Inspector2",
            null,
            ImGui.WindowFlags.NoScrollBar | ImGui.WindowFlags.NoCollapse | ImGui.WindowFlags.NoResize | ImGui.WindowFlags.NoTitleBar
        );

        if (!properties.selectedEntity) {
            ImGui.Text(icons.error + "  No mesh selected to modify");
            return;
        }

        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.ButtonTextAlign, new ImGui.ImVec2(0.0, 0.0));
        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(0.0, 0.0));
        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.WindowPadding, new ImGui.ImVec2(0.0, 0.0));
        ImGui.PushStyleColor(ImGui.ImGuiCol.Button, new ImGui.ImVec4(0.11, 0.11, 0.11, 1.0));
        ImGui.PushStyleColor(ImGui.ImGuiCol.ButtonHovered, new ImGui.ImVec4(0.11, 0.11, 0.11, 1.0));
        ImGui.PushStyleColor(ImGui.ImGuiCol.ButtonActive, lightGreenBlueCrayola);

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x - 5, ImGui.GetCursorPos().y - 5));

        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(3.0, 5.0));

        var bSize = new ImGui.ImVec2(300.0, 25.0);

        if (ImGui.Button("  " + icons.rightarrow_thin + " Inspector", bSize)) {
            inspectorIsOpen = false;
        }

        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
        ImGui.PopStyleColor();
        ImGui.PopStyleColor();
        ImGui.PopStyleColor();
    
        ImGui.PopStyleVar();
    
        var initTabPos = ImGui.GetCursorPos();
        var pos = new ImGui.ImVec2(initTabPos.x, initTabPos.y - 10);
    
        ImGui.SetCursorPos(pos);
    
        var FramePadding = new ImGui.ImVec2(0, 8);
        ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(50, 6));
        ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, FramePadding);
        ImGui.PushStyleVar(ImGui.StyleVar.TabRounding, 0.0);
    
        var frameBg = new ImGui.ImVec4(0.15, 0.15, 0.15, 1);
        ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, frameBg);
    
        if (properties.selectedEntity) {
            var modelNameBuffer = new ImGui.StringBuffer(
                64,
                properties.selectedEntity.name
            );
            var materialNameBuffer = new ImGui.StringBuffer(
                64,
                properties.selectedEntity.name
            );
        }
    
        ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderHovered, lightEerieBlack);
        ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderActive, lightEerieBlack);
    
        ImGui.SetCursorPos(
            new ImGui.ImVec2(
                ImGui.GetCursorPos().x + 5,
                ImGui.GetCursorPos().y + 17
            )
        );
    
        if (
            ImGui.BeginChild(
                "##BeginChild",
                new ImGui.Vec2(284, canvas.clientHeight - 60),
                false,
                ImGui.WindowFlags.NoScrollBar
            )
        ) {
            ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, FramePadding);
            ImGui.PushItemWidth(150.0);
            ImGui.PushStyleVar(
                ImGui.StyleVar.FramePadding,
                new ImGui.ImVec2(0.0, 1.5)
            );
            ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, nameInputBgColor);
    
            pos = ImGui.GetCursorScreenPos();
    
            ImGui.PushStyleColor(ImGui.ImGuiCol.ChildBg, nameSectionBgColor);
    
            ImGui.PushStyleVar(
                ImGui.StyleVar.WindowPadding,
                new ImGui.ImVec2(0, 0)
            );
    
            if (
                ImGui.BeginChild(
                    "##NameChild",
                    new ImGui.Vec2(300, 50),
                    false,
                    ImGui.WindowFlags.NoScrollBar
                )
            ) {
                ImGui.PushID(1);
                ImGui.SetCursorPos(
                    new ImGui.ImVec2(
                        ImGui.GetCursorPos().x + 15,
                        ImGui.GetCursorPos().y + 15
                    )
                );
    
                if (modelNameBuffer)
                    ImGui.InputText("##modelName", modelNameBuffer, 128);
    
                ImGui.PopID();
            }
    
            ImGui.PopStyleColor();
            ImGui.PopStyleColor();
    
            ImGui.EndChild();
    
            ImGui.SetCursorPos(
                new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y + 4)
            );
    
            ImGui.PushStyleColor(ImGui.ImGuiCol.Header, headerBgColor);
    
            ImGui.PushStyleVar(
                ImGui.StyleVar.ItemInnerSpacing,
                new ImGui.ImVec2(0, 0)
            );
            ImGui.PushStyleVar(ImGui.StyleVar.ItemSpacing, new ImGui.ImVec2(0, 4));
    
            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 10,
                    ImGui.GetCursorPos().y
                )
            );
    
            transformSection(properties);
    
            renderingSection(properties);
    
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
    
            ImGui.PopItemWidth();
    
            ImGui.PopStyleVar();
            ImGui.PopStyleVar();
            ImGui.PopStyleVar();
            ImGui.PopStyleVar();
            ImGui.PopStyleVar();
            // ImGui.PopStyleVar();
    
            ImGui.PopStyleColor();
        }
    
        ImGui.PopStyleColor();
        ImGui.PopStyleColor();
        ImGui.PopStyleColor();
        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
        // ImGui.PopStyleColor();
    
        ImGui.EndChild();
    } else {
        ImGui.SetNextWindowBgAlpha(1.0);

        var size = new ImGui.ImVec2(300, 51);
        var position = new ImGui.ImVec2(canvas.clientWidth - 300, 26);

        ImGui.SetNextWindowSize(size);
        ImGui.SetNextWindowPos(position);

        ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));

        ImGui.Begin(
            "##Inspector",
            null,
            ImGui.WindowFlags.NoScrollBar | ImGui.WindowFlags.NoCollapse | ImGui.WindowFlags.NoResize | ImGui.WindowFlags.NoTitleBar
        );

        if (!properties.selectedEntity) {
            ImGui.Text(icons.error + "  No mesh selected to modify");
            ImGui.PopStyleColor();
            return;
        }

        ImGui.PopStyleColor();
    
        // ImGui.PopStyleVar();
    
        var initTabPos = ImGui.GetCursorPos();
        var pos = new ImGui.ImVec2(initTabPos.x - 5, initTabPos.y - 12);
    
        ImGui.SetCursorPos(pos);
    
        var FramePadding = new ImGui.ImVec2(0, 8);
        ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(50, 6));
        ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, FramePadding);
        ImGui.PushStyleVar(ImGui.StyleVar.TabRounding, 0.0);
    
        var frameBg = new ImGui.ImVec4(0.15, 0.15, 0.15, 1);
        ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, frameBg);
    
        if (properties.selectedEntity) {
            var modelNameBuffer = new ImGui.StringBuffer(
                64,
                properties.selectedEntity.name
            );
            var materialNameBuffer = new ImGui.StringBuffer(
                64,
                properties.selectedEntity.name
            );
        }
    
        ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderHovered, lightEerieBlack);
        ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderActive, lightEerieBlack);
    
        ImGui.SetCursorPos(
            new ImGui.ImVec2(
                ImGui.GetCursorPos().x + 8,
                ImGui.GetCursorPos().y + 17
            )
        );

        var size = new ImGui.ImVec2(310.0, 25.0);

        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.ButtonTextAlign, new ImGui.ImVec2(0.0, 0.0));
        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(0.0, 0.0));
        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.WindowPadding, new ImGui.ImVec2(0.0, 0.0));
        ImGui.PushStyleColor(ImGui.ImGuiCol.Button, new ImGui.ImVec4(0.11, 0.11, 0.11, 1.0));
        ImGui.PushStyleColor(ImGui.ImGuiCol.ButtonHovered, new ImGui.ImVec4(0.11, 0.11, 0.11, 1.0));
        ImGui.PushStyleColor(ImGui.ImGuiCol.ButtonActive, lightGreenBlueCrayola);

        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x - 8, ImGui.GetCursorPos().y - 9));

        // ImGui.PushStyleColor(ImGui.ImGuiCol.Button, new ImGui.ImVec2(0.5, 0.5, 0.5, 1.0));

        ImGui.PushStyleVar(ImGui.ImGuiStyleVar.FramePadding, new ImGui.ImVec2(0.0, 4.0));

        if (ImGui.Button("  " + icons.downarrow_hlt + " Inspector", size)) {
            inspectorIsOpen = true;
        }

        ImGui.PopStyleVar();

        // ImGui.PopStyleColor();

        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
        ImGui.PopStyleVar();
        ImGui.PopStyleColor();
        ImGui.PopStyleColor();
        ImGui.PopStyleColor();

        // ImGui.SameLine();

        // ImGui.Text(" Inspector");
    
        ImGui.PopStyleColor();
        ImGui.PopStyleColor();
        ImGui.PopStyleColor();
        // ImGui.PopStyleColor();
    
        ImGui.EndChild();
    }
}

function renderingSection(properties) {
    ImGui.PushStyleColor(ImGui.ImGuiCol.Header, childBgColor);

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x + 4, ImGui.GetCursorPos().y)
    );

    var firstPos = ImGui.GetCursorPos();

    ImGui.PushID(1);

    var arrowIcon = !propertiesIsOpen
        ? icons.rightarrow_thin
        : icons.downarrow_hlt;

    // ImGui.Unindent();

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x - 20, ImGui.GetCursorPos().y)
    );

    if (ImGui.CollapsingHeader("##Rendering")) {
        propertiesIsOpen = true;

        // ImGui.Indent();

        ImGui.PushStyleColor(ImGui.ImGuiCol.ChildBg, childBgColor);

        ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, frameBgColor);

        ImGui.PushStyleVar(
            ImGui.StyleVar.WindowPadding,
            new ImGui.ImVec2(0, 0)
        );

        ImGui.SetCursorPos(
            new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y - 4)
        );

        var ySize = properties.selectedEntity.enablePBR ? 340 : 210;

        if (
            ImGui.BeginChild(
                "##RenderingChild",
                new ImGui.Vec2(300, ySize),
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
                    ImGui.GetCursorPos().x,
                    ImGui.GetCursorPos().y + 4
                )
            );

            ImGui.Text("Shading type");

            ImGui.SameLine(total_w / 2 - 32);

            var buttonSize = new ImGui.ImVec2(125.0, 17.0);

            if (ImGui.Button(properties.selectedShadingType, buttonSize)) {
                ImGui.OpenPopup("shadingType");
            }

            // ImGui.SetItemAllowOverlap();

            ImGui.SetNextWindowBgAlpha(1.0);
            ImGui.SetNextWindowSize(new ImGui.ImVec2(125.0, 34.0));
            ImGui.PushStyleColor(
                ImGui.ImGuiCol.PopupBg,
                new ImGui.ImVec4(0.18, 0.18, 0.18, 1.0)
            );

            properties.selectedShadingType = properties.selectedEntity.shadingType;

            if (ImGui.BeginPopup("shadingType")) {
                for (var i = 0; i < properties.shadingTypes.length; i++) {
                    if (
                        ImGui.Selectable(
                            properties.shadingTypes[i],
                            properties.selectedShadingType ===
                                properties.shadingTypes[i]
                        )
                    ) {
                        properties.selectedShadingType =
                            properties.shadingTypes[i];
                    }
                }

                ImGui.EndPopup();
            }

            properties.selectedEntity.shadingType = properties.selectedShadingType;

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x,
                    ImGui.GetCursorPos().y + 14
                )
            );

            ImGui.Separator();

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 8,
                    ImGui.GetCursorPos().y + 12
                )
            );

            ImGui.Text("Physically based rendering");

            var enablePBR = [properties.selectedEntity.enablePBR];

            ImGui.PopItemWidth();

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 14,
                    ImGui.GetCursorPos().y
                )
            );

            // var total_w = ImGui.GetContentRegionAvail();

            ImGui.Text("Enable");

            ImGui.SameLine(130.0);

            ImGui.Checkbox("##Enable", enablePBR);

            properties.selectedEntity.enablePBR = enablePBR[0];

            if (properties.selectedEntity.enablePBR) {
                var albedoInputButton =
                document.getElementById("albedoInputButton");

            var sendAlbedoButton = document.getElementById("sendAlbedoButton");

            albedoInputButton.onchange = function () {
                albedoTextureName.buffer = this.value.slice(12);
                properties.currentAlbedoName = albedoTextureName.buffer;
                sendAlbedoButton.click();
                properties.loadAlbedo = true;   
            };

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 14,
                    ImGui.GetCursorPos().y + 7
                )
            );

            ImGui.Text("Albedo texture");

            ImGui.SameLine(total_w / 2 - 20);

            ImGui.PushItemWidth(115.0);

            ImGui.InputText("##albedoTexture", albedoTextureName, 250);

            ImGui.SameLine();

            if (ImGui.Button(icons.downarrow_hlt)) {
                albedoInputButton.click();
            }

            var normalInputButton =
                document.getElementById("normalInputButton");

            var sendNormalButton = document.getElementById("sendNormalButton");

            normalInputButton.onchange = function () {
                normalTextureName.buffer = this.value.slice(12);
                properties.currentNormalName = normalTextureName.buffer;
                sendNormalButton.click();
                properties.loadNormal = true;
            };

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 14,
                    ImGui.GetCursorPos().y + 4
                )
            );

            ImGui.Text("Normal texture");

            ImGui.SameLine(total_w / 2 - 20);

            ImGui.PushItemWidth(115.0);

            ImGui.InputText("##normalTexture", normalTextureName, 250);

            ImGui.SameLine();

            ImGui.PushID(0);

            if (ImGui.Button(icons.downarrow_hlt)) {
                normalInputButton.click();
            }

            ImGui.PopID();

            var metallicInputButton =
                document.getElementById("metallicInputButton");

            var sendMetallicButton = document.getElementById("sendMetallicButton");

            metallicInputButton.onchange = function () {
                metallicTextureName.buffer = this.value.slice(12);
                properties.currentMetallicName = metallicTextureName.buffer;
                sendMetallicButton.click();
                properties.loadMetallic = true;
            };

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 14,
                    ImGui.GetCursorPos().y + 4
                )
            );

            ImGui.Text("Metallic texture");

            ImGui.SameLine(total_w / 2 - 20);

            ImGui.PushItemWidth(115.0);

            ImGui.InputText("##metallicTexture", metallicTextureName, 250);

            ImGui.SameLine();

            ImGui.PushID(1);

            if (ImGui.Button(icons.downarrow_hlt)) {
                metallicInputButton.click();
            }

            ImGui.PopID();

            if (properties.selectedEntity.enablePBR) {
                var roughnessInputButton =
                document.getElementById("roughnessInputButton");

            var sendRoughnessButton = document.getElementById("sendRoughnessButton");

            roughnessInputButton.onchange = function () {
                roughnessTextureName.buffer = this.value.slice(12);
                properties.currentRoughnessName = roughnessTextureName.buffer;
                sendRoughnessButton.click();
                properties.loadRoughness = true;
            };
            } 

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 14,
                    ImGui.GetCursorPos().y + 4
                )
            );

            ImGui.Text("Roughness texture");

            ImGui.SameLine(total_w / 2 - 20);

            ImGui.PushItemWidth(115.0);

            ImGui.InputText("##roughnessTexture", roughnessTextureName, 250);

            ImGui.SameLine();

            ImGui.PushID(2);

            if (ImGui.Button(icons.downarrow_hlt)) {
                roughnessInputButton.click();
            }

            ImGui.PopID();

            var aoInputButton =
                document.getElementById("aoInputButton");

            var sendRoughnessButton = document.getElementById("sendAoButton");

            aoInputButton.onchange = function () {
                aoTextureName.buffer = this.value.slice(12);
                properties.currentAoName = aoTextureName.buffer;
                sendAoButton.click();
                properties.loadAo = true;
            };

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 14,
                    ImGui.GetCursorPos().y + 4
                )
            );

            ImGui.Text("Ao texture");

            ImGui.SameLine(total_w / 2 - 20);

            ImGui.PushItemWidth(115.0);

            ImGui.InputText("##aoTexture", aoTextureName, 250);

            ImGui.SameLine();

            ImGui.PushID(3);

            if (ImGui.Button(icons.downarrow_hlt)) {
                aoInputButton.click();
            }

            ImGui.PopID();
            }

            ImGui.Separator();

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 8,
                    ImGui.GetCursorPos().y + 12
                )
            );

            ImGui.Text("Image based lighting");

            var IBLenabled = [properties.selectedEntity.IBLenabled];

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 15,
                    ImGui.GetCursorPos().y
                )
            );

            ImGui.Text("Enable");

            ImGui.SameLine(130.0);

            ImGui.Checkbox("##IBLenabled", IBLenabled);

            properties.selectedEntity.IBLenabled = IBLenabled[0];

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 15,
                    ImGui.GetCursorPos().y + 15
                )
            );

            var bSize = new ImGui.ImVec2(75.0, 25.0);

            if (ImGui.Button("Generate", bSize)) {
                properties.generateSkybox = true;
            }

            ImGui.PopStyleColor();
            
        }

        ImGui.PopStyleColor();
        ImGui.PopStyleColor();

        ImGui.PopStyleVar();

        ImGui.EndChild();
    } else {
        propertiesIsOpen = false;
    }

    ImGui.PopStyleColor();

    ImGui.SetItemAllowOverlap();

    var lastPos = ImGui.GetCursorPos();

    ImGui.SetCursorPos(new ImGui.ImVec2(firstPos.x, firstPos.y + 1.8));

    ImGui.Text(arrowIcon + " Rendering");

    ImGui.SetCursorPos(lastPos);

    ImGui.PopID();
}

function transformSection(properties) {
    ImGui.PushStyleColor(ImGui.ImGuiCol.Header, childBgColor);

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x - 6, ImGui.GetCursorPos().y)
    );

    var firstPos = ImGui.GetCursorPos();

    ImGui.PushID(1);

    var arrowIcon = !isOpen ? icons.rightarrow_thin : icons.downarrow_hlt;

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x - 70, ImGui.GetCursorPos().y)
    );

    // ImGui.Unindent();

    if (
        ImGui.CollapsingHeader("##Transform", ImGui.TreeNodeFlags.DefaultOpen)
    ) {
        isOpen = true;

        // ImGui.Indent();

        ImGui.PushStyleColor(ImGui.ImGuiCol.ChildBg, childBgColor);

        ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, frameBgColor);

        ImGui.PushStyleVar(
            ImGui.StyleVar.WindowPadding,
            new ImGui.ImVec2(0, 0)
        );

        ImGui.SetCursorPos(
            new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y - 4)
        );

        if (
            ImGui.BeginChild(
                "##TransformChild",
                new ImGui.Vec2(300, 325),
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
                    ImGui.GetCursorPos().x,
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

            var pos = new ImGui.GetCursorPos();
            ImGui.SetCursorPos(new ImGui.ImVec2(pos.x + 20, pos.y + 5));

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x,
                    ImGui.GetCursorPos().y + 4
                )
            );

            // TRANSLATE

            ImGui.Text("Translate");

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y
                )
            );
            ImGui.Text("X");
            ImGui.SameLine(total_w / 2 - 32);

            var tempX = [properties.transformPosition[0]];

            ImGui.DragFloat("##X", tempX, 0.1);
            properties.transformPosition[0] = tempX[0];
            // ImGui.Spacing();

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y
                )
            );
            ImGui.Text("Y");
            ImGui.SameLine(total_w / 2 - 32);

            var tempY = [properties.transformPosition[1]];

            ImGui.DragFloat("##Y", tempY, 0.1);
            properties.transformPosition[1] = tempY[0];
            // ImGui.Spacing();

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y
                )
            );
            ImGui.Text("Z");
            ImGui.SameLine(total_w / 2 - 32);

            var tempZ = [properties.transformPosition[2]];

            ImGui.DragFloat("##Z", tempZ, 0.1);
            properties.transformPosition[2] = tempZ[0];
            // ImGui.Spacing();

            ImGui.Separator();

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y + 15
                )
            );

            // ROTATE

            ImGui.Text("Euler rotation");

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y
                )
            );
            ImGui.Text("X");
            ImGui.SameLine(total_w / 2 - 32);

            var lastRotationX = properties.transformRotation[0];
            var tempRotX = [properties.transformRotation[0]];
            ImGui.DragFloat("##Xr", tempRotX, 0.1);
            properties.transformRotation[0] = tempRotX[0];
            // ImGui.Spacing();

            properties.rotationOffsetX =
                lastRotationX - properties.transformRotation[0];

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y
                )
            );
            ImGui.Text("Y");
            ImGui.SameLine(total_w / 2 - 32);

            var lastRotationY = properties.transformRotation[1];
            var tempRotY = [properties.transformRotation[1]];
            ImGui.DragFloat("##Yr", tempRotY, 0.1);
            properties.transformRotation[1] = tempRotY[0];
            // ImGui.Spacing();

            properties.rotationOffsetY =
                lastRotationY - properties.transformRotation[1];

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y
                )
            );
            ImGui.Text("Z");
            ImGui.SameLine(total_w / 2 - 32);

            var lastRotationZ = properties.transformRotation[2];
            var tempRotZ = [properties.transformRotation[2]];
            ImGui.DragFloat("##Zr", tempRotZ, 0.1);
            properties.transformRotation[2] = tempRotZ[0];
            // ImGui.Spacing();

            properties.rotationOffsetZ =
                lastRotationZ - properties.transformRotation[2];

            ImGui.Separator();

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y + 15
                )
            );

            // SCALE

            ImGui.Text("Scale");

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y
                )
            );
            ImGui.Text("X");
            ImGui.SameLine(total_w / 2 - 32);

            var tempScaleX = [properties.transformScale[0]];
            ImGui.DragFloat("##Xs", tempScaleX, 0.1);
            properties.transformScale[0] = tempScaleX[0];
            // ImGui.Spacing();

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y
                )
            );
            ImGui.Text("Y");
            ImGui.SameLine(total_w / 2 - 32);

            var tempScaleY = [properties.transformScale[1]];
            ImGui.DragFloat("##Ys", tempScaleY, 0.1);
            properties.transformScale[1] = tempScaleY[0];
            // ImGui.Spacing();

            ImGui.SetCursorPos(
                new ImGui.ImVec2(
                    ImGui.GetCursorPos().x + 22,
                    ImGui.GetCursorPos().y
                )
            );
            ImGui.Text("Z");
            ImGui.SameLine(total_w / 2 - 32);

            var tempScaleZ = [properties.transformScale[2]];
            ImGui.DragFloat("##Zs", tempScaleZ, 0.1);
            properties.transformScale[2] = tempScaleZ[0];
            // ImGui.Spacing();

            ImGui.PopItemWidth();
        }

        ImGui.PopStyleColor();
        ImGui.PopStyleColor();

        ImGui.PopStyleVar();

        ImGui.EndChild();
    } else {
        isOpen = false;
    }

    ImGui.PopStyleColor();

    ImGui.SetItemAllowOverlap();

    var lastPos = ImGui.GetCursorPos();

    ImGui.SetCursorPos(new ImGui.ImVec2(firstPos.x, firstPos.y + 1.8));

    ImGui.Text(arrowIcon + " Transform");

    ImGui.SetCursorPos(lastPos);

    ImGui.PopID();
}