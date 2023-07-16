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
import { setEntity } from "../UI.js";

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
var nameSectionBgColor = new ImGui.ImVec4(
    39 / 255,
    39 / 255,
    39 / 255,
    255 / 255
);
var nameInputBgColor = lightGreenBlueCrayola;
var frameBgColor = new ImGui.ImVec4(0.2, 0.2, 0.2, 255 / 255);
var lightFrameBgColor = new ImGui.ImVec4(0.25, 0.25, 0.25, 255 / 255);
var textureElementBgColor = lightEerieBlack;
var headerBgColor = new ImGui.ImVec4(0.05, 0.05, 0.05, 255 / 255);
var matcapID = 0;
var textureType = 1;
var t = [textureType];
var isOpen = false;

export function sceneHierarchy(gl, canvas, properties) {
    // ImGui.PushStyleVar(ImGui.StyleVar.ScrollbarRounding, 0.0);

    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(310, 340);
    var position = new ImGui.ImVec2(canvas.clientWidth - 310, 26);

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
    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(8.0, 2.0));
    ImGui.Begin(
        icons.scene_data + "  " + "Hierarchy",
        null,
        ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoScrollBar |
            ImGui.WindowFlags.NoBringToFrontOnFocus |
            ImGui.WindowFlags.NoResize
    );
    ImGui.PopStyleVar();

    // ImGui.PopStyleColor();

    var initTabPos = ImGui.GetCursorPos();
    var pos = new ImGui.ImVec2(initTabPos.x, initTabPos.y - 10);

    ImGui.SetCursorPos(pos);

    var FramePadding = new ImGui.ImVec2(0, 8);
    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(50, 6));
    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, FramePadding);
    ImGui.PushStyleVar(ImGui.StyleVar.TabRounding, 0.0);

    var frameBg = new ImGui.ImVec4(0.15, 0.15, 0.15, 1);
    ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, frameBg);

    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderHovered, frameBgColor);
    ImGui.PushStyleColor(ImGui.ImGuiCol.HeaderActive, frameBgColor);

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 8,
            ImGui.GetCursorPos().y + 17
        )
    );
    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, FramePadding);
    ImGui.PushItemWidth(150.0);
    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(1.5, 1.5));
    ImGui.PushStyleColor(ImGui.ImGuiCol.FrameBg, nameInputBgColor);

    pos = ImGui.GetCursorScreenPos();

    ImGui.PushStyleColor(ImGui.ImGuiCol.ChildBg, nameSectionBgColor);

    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, new ImGui.ImVec2(0, 0));

    if (ImGui.BeginChild("##NameChild", new ImGui.Vec2(288, 300))) {
        ImGui.PopStyleColor();
        ImGui.PopStyleColor();

        ImGui.SetCursorPos(
            new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y)
        );

        ImGui.PushStyleColor(ImGui.ImGuiCol.Header, headerBgColor);

        ImGui.PushStyleVar(
            ImGui.StyleVar.ItemInnerSpacing,
            new ImGui.ImVec2(0, 0)
        );
        ImGui.PushStyleVar(ImGui.StyleVar.ItemSpacing, new ImGui.ImVec2(0, 4));

        // ImGui.SetCursorPos(
        //     new ImGui.ImVec2(ImGui.GetCursorPos().x + 4, ImGui.GetCursorPos().y)
        // );

        entityInHierarchy(properties);

        ImGui.PopStyleColor();
        // ImGui.PopItemWidth();
        // ImGui.PopStyleVar();
        // ImGui.PopStyleVar();
    }

    ImGui.EndChild();
    // }

    // ImGui.EndChild();

    ImGui.EndTabItem();

    var FramePadding = new ImGui.ImVec2(0, 8);
    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(10, 6));
    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, FramePadding);
    ImGui.PushStyleVar(ImGui.StyleVar.TabRounding, 0.0);

    // ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();

    ImGui.PopStyleColor();
    ImGui.PopStyleColor();

    // ImGui.EndTabItem();

    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, FramePadding);
    // ImGui.EndTabBar();
    ImGui.PopStyleVar();
    // }

    ImGui.PopStyleColor();

    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(310, canvas.clientHeight);
    var position = new ImGui.ImVec2(canvas.clientWidth - 310, 340 + 26);

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
    ImGui.Begin(
        icons.world_data + "  " + "Scene properties",
        null,
        ImGui.WindowFlags.NoCollapse |
            ImGui.WindowFlags.NoScrollBar |
            ImGui.WindowFlags.NoBringToFrontOnFocus |
            ImGui.WindowFlags.NoResize
    );

    ImGui.PushItemWidth(150.0);
    var pos = ImGui.GetCursorScreenPos();

    var total_w = ImGui.GetContentRegionAvail().x;

    var pos = new ImGui.GetCursorPos();
    ImGui.SetCursorPos(new ImGui.ImVec2(pos.x + 20, pos.y + 5));

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y + 4)
    );

    ImGui.SetCursorPos(
        new ImGui.ImVec2(ImGui.GetCursorPos().x + 22, ImGui.GetCursorPos().y)
    );
    ImGui.Text("Scene name");
    ImGui.SameLine(total_w / 2 - 32);

    if (properties.sceneName) {
        ImGui.PushStyleVar(
            ImGui.ImGuiStyleVar.FramePadding,
            new ImGui.ImVec2(2.0, 2.0)
        );
        ImGui.InputText("##SceneName", properties.sceneName, 250);
        ImGui.PopStyleVar();
    }

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 42,
            ImGui.GetCursorPos().y + 5.0
        )
    );

    ImGui.Text("Skybox");

    ImGui.SameLine(total_w / 2 - 32);

    ImGui.PushItemWidth(25.0);

    ImGui.PushStyleVar(
        ImGui.ImGuiStyleVar.FramePadding,
        new ImGui.ImVec2(2.0, 2.0)
    );

    var skybox = [properties.skyboxEnabled];

    ImGui.Checkbox("##skybox", skybox);

    properties.skyboxEnabled = skybox[0];

    ImGui.PopStyleVar();

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 42,
            ImGui.GetCursorPos().y + 5.0
        )
    );

    ImGui.Text("Grid");

    ImGui.SameLine(total_w / 2 - 32);

    ImGui.PushItemWidth(25.0);

    ImGui.PushStyleVar(
        ImGui.ImGuiStyleVar.FramePadding,
        new ImGui.ImVec2(2.0, 2.0)
    );

    var grid = [properties.grid];

    ImGui.Checkbox("##grid", grid);

    properties.grid = grid[0];

    ImGui.PopStyleVar();

    ImGui.SetCursorPos(
        new ImGui.ImVec2(
            ImGui.GetCursorPos().x + 42,
            ImGui.GetCursorPos().y + 5.0
        )
    );

    ImGui.PushStyleColor(ImGui.ImGuiCol.Button, new ImGui.ImVec4(0.14, 0.14, 0.14, 1.0));
    ImGui.PushStyleColor(ImGui.ImGuiCol.ButtonHovered, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));

    var bSize = new ImGui.ImVec2(175.0, 25.0);

    if (ImGui.Button("Update Image based lighting", bSize)) {
        properties.generateSkybox = true;
    }

    ImGui.PopStyleColor();

    // ImGui.Separator();

    // ImGui.SetCursorPos(
    //     new ImGui.ImVec2(ImGui.GetCursorPos().x + 5, ImGui.GetCursorPos().y)
    // );

    // ImGui.Text("Rendering");

    // ImGui.SetCursorPos(
    //     new ImGui.ImVec2(
    //         ImGui.GetCursorPos().x + 42,
    //         ImGui.GetCursorPos().y + 5.0
    //     )
    // );

    // ImGui.Text("PBR");

    // ImGui.SameLine(total_w / 2 - 32);

    // ImGui.PushItemWidth(25.0);

    // ImGui.PushStyleVar(
    //     ImGui.ImGuiStyleVar.FramePadding,
    //     new ImGui.ImVec2(2.0, 2.0)
    // );

    // ImGui.Checkbox("##pbr", [properties.grid]);

    // ImGui.PopStyleVar();

    // ImGui.SetCursorPos(
    //     new ImGui.ImVec2(
    //         ImGui.GetCursorPos().x + 42,
    //         ImGui.GetCursorPos().y + 5.0
    //     )
    // );

    // ImGui.Text("IBL");

    // ImGui.SameLine(total_w / 2 - 32);

    // ImGui.PushItemWidth(25.0);

    // ImGui.PushStyleVar(
    //     ImGui.ImGuiStyleVar.FramePadding,
    //     new ImGui.ImVec2(2.0, 2.0)
    // );

    // ImGui.Checkbox("##ibl", [properties.grid]);

    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();

    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();
    ImGui.PopStyleVar();

    // ImGui.PopItemWidth();
    // ImGui.PopItemWidth();
    ImGui.PopItemWidth();
    ImGui.PopItemWidth();
    ImGui.PopItemWidth();
    ImGui.PopItemWidth();

    if (
        ImGui.IsMouseClicked(1) &&
        properties.io &&
        !properties.io.WantCaptureMouse
    ) {
        ImGui.OpenPopup("scenePopup");
    }

    ImGui.SetNextWindowBgAlpha(1.0);
    ImGui.SetNextWindowSize(new ImGui.ImVec2(160.0, 172.0));
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
        new ImGui.ImVec2(4.0, 4.0)
    );

    ImGui.PushStyleVar(
        ImGui.StyleVar.FramePadding,
        new ImGui.ImVec2(0.0, 2.0)
    );

    ImGui.PushStyleVar(
        ImGui.StyleVar.ButtonTextAlign,
        new ImGui.ImVec2(0.0, 0.5)
    );

    ImGui.PushStyleVar(ImGui.ImGuiStyleVar.PopupBorderSize, 0.0);

    if (ImGui.BeginPopup("scenePopup")) {
        ImGui.MenuItem("Add mesh context menu", null, false, false);
        var buttonSize = new ImGui.ImVec2(
            ImGui.GetContentRegionAvail().x,
            20.0
        );

        ImGui.Separator();

        if (ImGui.Button("          Cube", buttonSize)) {
            properties.scene.addCube(gl);
            ImGui.CloseCurrentPopup();
        }

        if (ImGui.Button("          Sphere", buttonSize)) {
            properties.scene.addSphere(gl);
            ImGui.CloseCurrentPopup();
        }

        if (ImGui.Button("          Plane", buttonSize)) {
            properties.scene.addPlane(gl);
            ImGui.CloseCurrentPopup();
        }

        if (ImGui.Button("          Arrow", buttonSize)) {
            properties.scene.addArrow(gl);
            ImGui.CloseCurrentPopup();
        }

        if (ImGui.Button("          Cylinder", buttonSize)) {
            properties.scene.addCylinder(gl);
            ImGui.CloseCurrentPopup();
        }

        if (ImGui.Button("          Torus", buttonSize)) {
            properties.scene.addTorus(gl);
            ImGui.CloseCurrentPopup();
        }

        ImGui.EndPopup();
    }

    ImGui.PopStyleVar();

    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    // ImGui.PopStyleVar();
    // ImGui.PopStyleVar();
}

function entityInHierarchy(properties) {
    ImGui.PushStyleColor(
        ImGui.ImGuiCol.Header,
        new ImGui.ImVec4(28 / 255, 28 / 255, 28 / 255, 255 / 255)
    );

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.HeaderActive,
        new ImGui.ImVec4(35 / 255, 35 / 255, 35 / 255, 255 / 255)
    );

    ImGui.PushStyleColor(
        ImGui.ImGuiCol.HeaderHovered,
        new ImGui.ImVec4(35 / 255, 35 / 255, 35 / 255, 255 / 255)
    );

    var firstPos = ImGui.GetCursorPos();

    ImGui.PushID(1);

    // ImGui.Unindent();

    var total_w = ImGui.GetContentRegionAvail().x;

    var childMeshes = ["childMesh0", "childMesh1", "childMesh2"];
    var selectedChildMesh = "";

    const draw_list = ImGui.GetWindowDrawList();
    const draw_list2 = ImGui.GetWindowDrawList();

    ImGui.PushStyleVar(
        ImGui.ImGuiStyleVar.SelectableTextAlign,
        new ImGui.ImVec2(0.02, 0.0)
    );

    for (var i = 0; i < properties.scene.entities.length; i++) {
        // draw_list.ChannelsSplit(3);

        // draw_list.ChannelsSetCurrent(1);

        // ImGui.Indent();

        var icon = properties.scene.entities[i] === properties.selectedEntity ? icons.downarrow_hlt : icons.rightarrow_thin;

        if (
            ImGui.Selectable(icon + " " +
                icons.snap_volume + "   " + properties.scene.entities[i].name,
                properties.selectedEntity === properties.scene.entities[i],
                0 | ImGui.SelectableFlags.SelectOnClick
            )
        ) {
            properties.newModelSelected = true;
            if (properties.selectedEntity && properties.selectedEntity === properties.scene.entities[i]) {
                // console.log(properties.selectedEntity);
                properties.selectedEntity.isSelected = false;
                properties.selectedEntity = null;
                if(properties.selectedMeshFromEntity) {
                    properties.selectedMeshFromEntity.isSelected = false;
                    properties.selectedMeshFromEntity = null;
                }
            } else {
                setEntity(properties.scene.entities[i], properties, 0);
            }
        }

        // if (!ImGui.IsItemHovered()) {
        //     draw_list.ChannelsSetCurrent(0);
        //     var p_min = ImGui.GetItemRectMin();
        //     var p_max = ImGui.GetItemRectMax();
        //     draw_list.AddRectFilled(p_min, p_max, ImGui.COL32(50, 50, 50, 255));
        // }

        // // ImGui.Indent();

        // draw_list.ChannelsMerge();

        if (properties.selectedEntity === properties.scene.entities[i]) {
            // draw_list2.ChannelsSplit(3);

            // draw_list2.ChannelsSetCurrent(1);

            ImGui.PushStyleColor(
                ImGui.ImGuiCol.Header,
                new ImGui.ImVec4(35 / 255, 35 / 255, 35 / 255, 255 / 255)
            );

            for (var j = 0; j < properties.selectedEntity.topMeshes.length; j++) {
                // draw_list2.ChannelsSplit(3);

                // draw_list2.ChannelsSetCurrent(1);

                if (
                    ImGui.Selectable(
                        
                            "           " + icons.mesh_data + " " +
                            properties.selectedEntity.name +
                            "/" +
                            properties.selectedEntity.topMeshes[j]._name,
                        properties.selectedMeshFromEntity ===
                            properties.selectedEntity.topMeshes[j] &&
                            properties.selectedEntity ===
                                properties.selectedEntity,
                        0 | ImGui.SelectableFlags.SelectOnClick
                    )
                ) {
                    properties.selectedMeshFromEntity =
                        properties.selectedEntity.topMeshes[j];
                }
    
                // if (!ImGui.IsItemHovered()) {
                //     draw_list.ChannelsSetCurrent(0);
                //     var p_min = ImGui.GetItemRectMin();
                //     var p_max = ImGui.GetItemRectMax();
                //     draw_list.AddRectFilled(
                //         p_min,
                //         p_max,
                //         ImGui.COL32(55, 55, 55, 255)
                //     );
                // }
    
                // draw_list2.ChannelsMerge();
            }

            ImGui.PopStyleColor();
    
            // ImGui.SetCursorPos(
            //     new ImGui.ImVec2(
            //         ImGui.GetCursorPos().x,
            //         ImGui.GetCursorPos().y + 7.0
            //     )
            // );

            // ImGui.Unindent();
        }
    }

    ImGui.PopStyleVar();

    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();

    // ImGui.Indent();

    // ImGui.SetCursorPos(
    //     new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y - 1.4)
    // );

    // if (entity.topMeshes.length > 0) {
    //     for (var i = 0; i < entity.topMeshes.length; i++) {
    // draw_list.ChannelsSplit(3);

    // draw_list.ChannelsSetCurrent(1);

    // ImGui.Indent();

    //         if (
    //             ImGui.Selectable(
    //                 icons.mesh_data + "  " + entity.topMeshes[i]._name,
    //                 selectedChildMesh === entity.topMeshes[i],
    //                 0 | ImGui.SelectableFlags.SelectOnClick
    //             )
    //         ) {
    //             selectedChildMesh = entity.topMeshes[i];
    //         }

    //         ImGui.Unindent();

    // if (!ImGui.IsItemHovered()) {
    //     draw_list.ChannelsSetCurrent(0);
    //     var p_min = ImGui.GetItemRectMin();
    //     var p_max = ImGui.GetItemRectMax();
    //     draw_list.AddRectFilled(
    //         p_min,
    //         p_max,
    //         ImGui.COL32(42, 42, 42, 255)
    //     );
    // }

    // draw_list.ChannelsMerge();
    //     }
    // }

    // ImGui.Unindent();
    // }

    // ImGui.PopStyleColor();

    // ImGui.Indent();

    // ImGui.SetItemAllowOverlap();

    // var lastPos = ImGui.GetCursorPos();

    // ImGui.SetCursorPos(new ImGui.ImVec2(firstPos.x, firstPos.y + 1.8));

    // ImGui.Text(icons.snap_volume + "    " + entity.name);

    // ImGui.SetItemAllowOverlap();

    // ImGui.SameLine(265.0);

    // ImGui.SetCursorPos(
    //     new ImGui.ImVec2(ImGui.GetCursorPos().x, ImGui.GetCursorPos().y - 1.4)
    // );

    // var buttonSize = new ImGui.ImVec2(17.0, 17.0);

    // ImGui.Button(icons.hide_off, buttonSize);

    // ImGui.SetCursorPos(lastPos);

    // ImGui.PopID();
}
