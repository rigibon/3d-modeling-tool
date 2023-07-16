import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";
import { cubeTextures, coatTextures, glassesTextures } from "./modelTextures";
import { loadTexture } from "../../texture";

var albedoTextures = [cubeTextures.albedo, coatTextures.albedo, glassesTextures.albedo];
var normalTextures = [cubeTextures.normal, coatTextures.normal, glassesTextures.normal];
var metallicTextures = [cubeTextures.metallic, coatTextures.metallic, glassesTextures.metallic];
var roughnessTextures = [cubeTextures.roughness, coatTextures.roughness, glassesTextures.roughness];
var aoTextures = [cubeTextures.ao, coatTextures.ao, glassesTextures.ao];

export function pbrPanel(gl, canvas, properties) {
    // var texture = loadTexture(gl, glassesTextures.albedo);

    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);
    
    if (properties.selectedMode == "PBR") {
        if (ImGui.Begin("PBR", null, 32, 4, 2, 128)) {
            var iblEnabled = [properties.iblEnabled];
            ImGui.Checkbox("IBL", iblEnabled);
            properties.iblEnabled = iblEnabled[0];
            ImGui.Spacing();
            var irradianceMap = [properties.irradianceMap];
            ImGui.Checkbox("Irradiance map", irradianceMap);
            properties.irradianceMap = irradianceMap[0];
            ImGui.Spacing();
            var prefilterMap = [properties.prefilterMap];
            ImGui.Checkbox("Prefilter map", prefilterMap);
            properties.prefilterMap = prefilterMap[0];
            ImGui.Spacing();
            var brdfLUTTexture = [properties.brdfLUTTexture];
            ImGui.Checkbox("BrdfLUT texture", brdfLUTTexture);
            properties.brdfLUTTexture = brdfLUTTexture[0];
            ImGui.Spacing();
            var skybox = [properties.skybox];
            ImGui.Checkbox("Render skybox", skybox);
            properties.skybox = skybox[0];

            if (!properties.selectedEntity.type) {
                ImGui.Spacing();
                ImGui.Text("Albedo texture");
                if (ImGui.ImageButton(properties.selectedEntity.material.aT, new ImGui.Vec2(128, 128))) {
                    ImGui.OpenPopup("albedoTextures_popup");
                }
    
                if (ImGui.BeginPopup("albedoTextures_popup")) {
                    for (var i = 0; i < albedoTextures.length; i++) {
                        if (ImGui.Button(albedoTextures[i])) {
                            properties.selectedEntity.material.aT = loadTexture(gl, albedoTextures[i].toString());
                            properties.selectedEntity.material.albedo = loadTexture(gl, albedoTextures[i].toString());
    
                            properties.albedoTexture = properties.selectedEntity.material.aT;
                        }
                    }
        
                    ImGui.EndPopup();
                }
    
                ImGui.Spacing();
                ImGui.Text("Normal texture");
                if (ImGui.ImageButton(properties.selectedEntity.material.nT, new ImGui.Vec2(128, 128))) {
                    ImGui.OpenPopup("normalTextures_popup");
                }
    
                if (ImGui.BeginPopup("normalTextures_popup")) {
                    for (var i = 0; i < normalTextures.length; i++) {
                        if (ImGui.Button(normalTextures[i])) {
                            properties.selectedEntity.material.nT = loadTexture(gl, normalTextures[i].toString());
                            properties.selectedEntity.material.normal = loadTexture(gl, normalTextures[i].toString());
    
                            properties.normalTexture = properties.selectedEntity.material.nT
                        }
                    }
        
                    ImGui.EndPopup();
                }
    
                ImGui.Spacing();
                ImGui.Text("Metallic texture");
                if (ImGui.ImageButton(properties.selectedEntity.material.mT, new ImGui.Vec2(128, 128))) {
                    ImGui.OpenPopup("metallicTextures_popup");
                }
    
                if (ImGui.BeginPopup("metallicTextures_popup")) {
                    for (var i = 0; i < metallicTextures.length; i++) {
                        if (ImGui.Button(metallicTextures[i])) {
                            properties.selectedEntity.material.mT = loadTexture(gl, metallicTextures[i].toString());
                            properties.selectedEntity.material.metallic = loadTexture(gl, metallicTextures[i].toString());
    
                            properties.metallicTexture = properties.selectedEntity.material.mT
                        }
                    }
        
                    ImGui.EndPopup();
                }
    
                ImGui.Spacing();
                ImGui.Text("Roughness texture");
                if (ImGui.ImageButton(properties.selectedEntity.material.rT, new ImGui.Vec2(128, 128))) {
                    ImGui.OpenPopup("roughnessTextures_popup");
                }
    
                if (ImGui.BeginPopup("roughnessTextures_popup")) {
                    for (var i = 0; i < roughnessTextures.length; i++) {
                        if (ImGui.Button(roughnessTextures[i])) {
                            properties.selectedEntity.material.rT = loadTexture(gl, roughnessTextures[i].toString());
                            properties.selectedEntity.material.roughness = loadTexture(gl, roughnessTextures[i].toString());
    
                            properties.roughnessTexture = properties.selectedEntity.material.rT;
                        }
                    }
        
                    ImGui.EndPopup();
                }
    
                ImGui.Spacing();
                ImGui.Text("AO texture");
                if (ImGui.ImageButton(properties.selectedEntity.material.aoT, new ImGui.Vec2(128, 128))) {
                    ImGui.OpenPopup("aoTextures_popup");
                }
    
                if (ImGui.BeginPopup("aoTextures_popup")) {
                    for (var i = 0; i < aoTextures.length; i++) {
                        if (ImGui.Button(aoTextures[i])) {
                            properties.selectedEntity.material.aoT = loadTexture(gl, aoTextures[i].toString());
                            properties.selectedEntity.material.ao = loadTexture(gl, aoTextures[i].toString());
    
                            properties.aoTexture = properties.selectedEntity.material.aoT
                        }
                    }
        
                    ImGui.EndPopup();
                }
            } else {
                ImGui.Text("No model selected for textures.");
            }
            
        }
    }
}