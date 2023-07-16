import * as ImGui from "../../../../imgui-js/dist/imgui.umd.js";

export function materialPanel(canvas, properties) {
    ImGui.SetNextWindowBgAlpha(1.0);

    var size = new ImGui.ImVec2(225, canvas.clientHeight);
    var position = new ImGui.ImVec2(0 + 50, 18 + 12);

    ImGui.SetNextWindowSize(size);
    ImGui.SetNextWindowPos(position);
    
    if (properties.selectedMode == "Material") {
        if (ImGui.Begin("Material", null, 32, 4, 2, 128)) {
            if (!properties.selectedEntity.type) {
                var albedo = properties.selectedEntity.material.aT ? [true] : [false];
                ImGui.Checkbox("Albedo", albedo);
                properties.selectedEntity.material.aT = albedo[0] ? properties.selectedEntity.material.albedo : null;
                properties.albedo = albedo[0];
    
                ImGui.Spacing();
                var normal = properties.selectedEntity.material.nT ? [true] : [false];
                ImGui.Checkbox("Normal", normal);
                properties.selectedEntity.material.nT = normal[0] ? properties.selectedEntity.material.normal : null;
                properties.normal = normal[0];
    
                ImGui.Spacing();
                var metallic = properties.selectedEntity.material.mT ? [true] : [false];
                ImGui.Checkbox("Metallic", metallic);
                properties.selectedEntity.material.mT = metallic[0] ? properties.selectedEntity.material.metallic : null;
                properties.metallic = metallic[0];
    
                ImGui.Spacing();
                var roughness = properties.selectedEntity.material.rT ? [true] : [false];
                ImGui.Checkbox("Roughness", roughness);
                properties.selectedEntity.material.rT = roughness[0] ? properties.selectedEntity.material.roughness : null;
                properties.roughness = roughness[0];
    
                ImGui.Spacing();
                var ao = properties.selectedEntity.material.aoT ? [true] : [false];
                ImGui.Checkbox("AO", ao);
                properties.selectedEntity.material.aoT = ao[0] ? properties.selectedEntity.material.ao : null;
                properties.ao = ao[0];
            } else {
                ImGui.Text("No model selected for materials.");
            }
        }
    }
}