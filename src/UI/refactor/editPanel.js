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

var modes = ["Scene", "Inspector", "Sculpt", "Transform", "Edit"];
var tools = ["Select", "Translate", "Rotate", "Scale"];
var iconSymbols = [icons.edge, icons.up_down_left_right, icons.pen_fancy, icons.plus];
var selectedMode = "";
var selectedTool = "";
var color = new ImGui.ImVec4(0.35, 0.35, 0.35, 1.0);
var childBgColor = new ImGui.ImVec4(0.29, 0.29, 0.29, 1.0);

export function editPanel(gl, canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(300, canvas.clientHeight);
    var position = new ImGui.ImVec2(canvas.clientWidth - 300, 26);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBg, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));
    ImGui.PushStyleColor(ImGui.ImGuiCol.TitleBgActive, new ImGui.ImVec4(0.15, 0.15, 0.15, 1.0));
    ImGui.PushStyleVar(ImGui.StyleVar.FramePadding, new ImGui.ImVec2(8.0, 4.0));
    ImGui.Begin("Edit scene", null, ImGui.WindowFlags.NoCollapse | ImGui.WindowFlags.NoScrollBar);
    ImGui.PopStyleVar();

    var initTabPos = ImGui.GetCursorPos();
    var pos = new ImGui.ImVec2(initTabPos.x, initTabPos.y - 10);

    ImGui.SetCursorPos(pos);

    ImGui.PushStyleColor(ImGui.ImGuiCol.WindowBg, childBgColor);

    ImGui.PushStyleVar(ImGui.StyleVar.WindowPadding, new ImGui.ImVec2(20.0, 20.0));

    ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x + 7.8, ImGui.GetCursorPos().y + 0.0));

    const buttonSize = new ImGui.Vec2(ImGui.GetContentRegionAvail().x - 25.0, 20.0);

    if (ImGui.BeginChild("#editPanel", new ImGui.Vec2(300, canvas.clientHeight - 60))) {
        ImGui.SetCursorPos(new ImGui.ImVec2(ImGui.GetCursorPos().x - 5.0, ImGui.GetCursorPos().y + 10.0));

        if (ImGui.Button("Add light", buttonSize)) {
            var phongLight = new PhongLight("phongLight" + properties.scene.entities.length, vec3.fromValues(5.0, 5.0, 5.0));
            properties.scene.addLight(phongLight);
            properties.newSelected = true;

            properties.selectedEntity = phongLight;

            var button = document.getElementById("button");

            button.click();
        }

        if (ImGui.Button("Add model", buttonSize)) {
            // ImGui.OpenPopup("models_popup");

            var fileInput = document.getElementById("file");
            fileInput.click();
        }

        if (ImGui.BeginPopup("models_popup")) {
            for (var i = 0; i < properties.modelNames.length; i++) {
                if (ImGui.Button(properties.modelNames[i])) {
                    var newModel = new Model(properties.modelNames[i] + properties.scene.entities.length, vec3.fromValues(0.0, 1.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0), null, false);
                    newModel.load(gl, i);
                    properties.scene.addModel(newModel);

                    setEntity(newModel, properties, i);

                    // var entityProps = { name: "newEntity", type: i };

                    // properties.socketHandler.sendEntityToAddToServer(entityProps);
                }
            }

            if (ImGui.Button("Sculpt cube")) {
                var newMesh = new Model("Sculpt cube", vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0), Primitives.createCube(gl), true, null);
                newMesh.normalizeSize();
                subdivideClamp(newMesh, true);
                newMesh.init();
                newMesh.setBuffers(gl);
                properties.scene.addModel(newMesh);

                setEntity(newMesh, properties, 0)
            }

            if (ImGui.Button("Sculpt ball")) {
                var newMesh = new Model("Sculpt ball", vec3.fromValues(0.0, 0.0, 0.0), vec3.fromValues(0.0, 1.0, 0.0), Primitives.createCube(gl), true, null);
                newMesh.normalizeSize();
                subdivideClamp(newMesh, false);
                newMesh.init();
                newMesh.setBuffers(gl);
                properties.scene.addModel(newMesh);

                setEntity(newMesh, properties, 0)
            }

            ImGui.EndPopup();
        }

        if (ImGui.Button("Add trackball camera", buttonSize)) {
            var newTrackballCamera = new TrackballCamera(gl, "NewTrackballCam" + properties.scene.entities.length , vec3.fromValues(4.0, 4.0, 4.0), gl.canvas);
            properties.scene.addCamera(newTrackballCamera);

            setCamera(newTrackballCamera, properties);
        }

        if (ImGui.Button("Add third person camera", buttonSize)) {
            var newThirdPersonCamera = new ThirdPersonCamera(gl, "NewThirdPersonCam" + properties.scene.entities.length , vec3.fromValues(4.0, 4.0, 4.0), io, gl.canvas);
            properties.scene.addCamera(newThirdPersonCamera);

            setCamera(newThirdPersonCamera, properties);
        }
    }

    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleColor();
    ImGui.PopStyleVar();

    ImGui.EndChild();
}

function subdivideClamp(mesh, linear) {
    Subdivision.LINEAR = !!linear;
    // mesh.addLevel();
    while (mesh.getNbFaces() < 50000)
      mesh.addLevel();
    // keep at max 4 multires
    mesh._meshes.splice(0, Math.min(mesh._meshes.length - 4, 4));
    mesh._sel = mesh._meshes.length - 1;
    Subdivision.LINEAR = false;
}