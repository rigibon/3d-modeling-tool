import { Tool } from "./tool";
import { TransformTool } from "./transformTool";
import { EditTool } from "./editTool";
import { SculptTool } from "./sculptTool";
import { UI } from "../UI/UI";
import { SocketHandler } from "../sockets/socketHandler";

export class ToolManager {
    ui: UI;
    transformTool: TransformTool;
    editTool: EditTool;
    sculptTool: SculptTool;
    activeTool: Tool;
    socketHandler: SocketHandler;

    constructor(ui: UI, mesh: any, picking: any, camera: any, canvas: any) {
        this.ui = ui;
        this.socketHandler = ui.socketHandler;

        this.transformTool = new TransformTool(null, ui);
        this.editTool = new EditTool(null, ui, picking);
        this.sculptTool = new SculptTool(
            null,
            ui,
            this.socketHandler,
            mesh,
            picking,
            camera,
            canvas
        );
    }

    setActiveTool(tool: Tool = null) {
        this.removeToolCallbacks();

        if (this.ui.properties.selectedMode === "Edit" || this.ui.properties.selectedMode === "Scene")
            this.activeTool = this.transformTool;

        if (this.ui.properties.selectedMode === "Sculpt")
            this.activeTool = this.sculptTool;
        // } else if (this.ui.properties.selectedMode === "Edit") {
        //     this.activeTool = this.editTool;
        // } else if (this.ui.properties.selectedMode === "Sculpt") {
        //     this.activeTool = this.sculptTool;
        // } else {
        //     this.activeTool = this.transformTool;
        // }

        // this.activeTool = this.sculptTool;

        this.activeTool.isActive = true;

        // this.setToolCallbacks(this.activeTool);

        this.activeTool.use();
    }

    removeToolCallbacks() {
        if (this.activeTool) {
            window.removeEventListener(
                "mousedown",
                this.activeTool.mouseDownCallback
            );
            window.removeEventListener(
                "mousemove",
                this.activeTool.mouseMoveCallback
            );
            window.removeEventListener(
                "mouseup",
                this.activeTool.mouseUpCallback
            );

            this.activeTool.isActive = false;
        }
    }

    setToolCallbacks(tool: Tool) {
        window.addEventListener("mousedown", tool.mouseDownCallback);
        window.addEventListener("mousemove", tool.mouseMoveCallback);
        window.addEventListener("mouseup", tool.mouseUpCallback);
    }

    getActiveTool(tool: Tool) {
        return this.activeTool;
    }

    instantiate(texture: any, then: any) {
        this.ui.instantiate(texture, then);

        // if (this.ui.properties.selectedMode === "Sculpt")
        if (this.ui.properties.selectedEntity) this.setActiveTool();
    }
}
