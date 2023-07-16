import { transformPanel } from "./transformPanel.js";
import { sculptPanel } from "./sculptPanel.js";
import { addEntityPanel } from "./addEntityPanel.js";
import { changeCameraPanel } from "./changeCameraPanel.js";
import { materialPanel } from "./materialPanel.js";
import { environmentPanel } from "./environmentPanel.js";
import { exportPanel } from "./exportPanel.js";
import { pbrPanel } from "./pbrPanel.js";
import { shaderPanel } from "./shaderPanel.js";

export function selectedModePanel(canvas, gl, properties, io) {
    if (properties.selectedMode === "Transform") {
        transformPanel(canvas, properties);
    }

    if (properties.selectedMode === "Sculpt") {
        sculptPanel(canvas, properties);
    }

    if (properties.selectedMode === "Add") {
        addEntityPanel(canvas, gl, properties, io);
    }

    if (properties.selectedMode === "Select camera") {
        changeCameraPanel(canvas, properties);
    }

    if (properties.selectedMode === "Material") {
        materialPanel(canvas, properties);
    }

    if (properties.selectedMode === "Environment") {
        environmentPanel(canvas, properties);
    }

    if (properties.selectedMode === "Export") {
        exportPanel(canvas, properties);
    }

    if (properties.selectedMode === "PBR") {
        pbrPanel(gl, canvas, properties);
    }

    if (properties.selectedMode === "Shader") {
        shaderPanel(gl, canvas, properties);
    }
}

