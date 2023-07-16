import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import { PhongLight } from "../../light.ts";
import { Model } from "../../model.js";
import { TrackballCamera } from "../../cameras/trackballCamera.ts";
import { ThirdPersonCamera } from "../../cameras/thirdPersonCamera.ts";
import { vec3 } from "gl-matrix";
import { setEntity, setCamera } from "../UI.js";

export function addEntityPanel(canvas, gl, properties, io) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);

    const buttonSize = new ImGui.Vec2(ImGui.GetFontSize() * 16.0, 0.0);

    if (ImGui.Begin("Scene", null, 32, 4, 2, 128)) {
        if (ImGui.Button("Add light", buttonSize)) {
            var phongLight = new PhongLight("phongLight" + properties.scene.entities.length, vec3.fromValues(5.0, 5.0, 5.0));
            properties.scene.addLight(phongLight);
            properties.newSelected = true;

            properties.selectedEntity = phongLight;
        }

        if (ImGui.Button("Add model", buttonSize)) {
            ImGui.OpenPopup("models_popup");
        }

        if (ImGui.BeginPopup("models_popup")) {
            for (var i = 0; i < properties.modelNames.length; i++) {
                if (ImGui.Button(properties.modelNames[i])) {
                    var newModel = new Model(properties.modelNames[i] + properties.scene.entities.length, vec3.fromValues(0.0, 0.0, 0.0));
                    newModel.load(gl, i);
                    properties.scene.addModel(newModel);

                    setEntity(newModel, properties, i);

                    var entityProps = { name: "newEntity", type: i };

                    properties.socketHandler.sendEntityToAddToServer(entityProps);
                }
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
}