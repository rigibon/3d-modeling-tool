import { Model } from "../model";
import { mat4, vec3, glMatrix } from "gl-matrix";
import { UI, setEntity } from "../UI/UI";
import { Entity } from "../entity";
import { Tool } from "./tool";
import { selectEntity } from "../geometry/algorithms";

export class EditTool implements Tool {
    isActive: boolean = false;
    name: "Edit";
    ui: UI;
    picking: any;
    pick: boolean = false;

    constructor(model: Model = null, ui: UI, picking: any) {
        this.name = "Edit";
        this.ui = ui;
        this.picking = picking;
    }

    use() {

    }

    mouseMoveCallback = (event: any): void => {

    }

    mouseUpCallback = (event: any): void => {

    }

    mouseDownCallback = (event: any): void => {
        var entity = selectEntity(
            event,
            this.picking,
            this.ui.canvas, 
            this.ui.properties.scene.cameras[this.ui.properties.scene.activeCamera], 
            this.ui.properties.scene.entities
        );

        if (entity) {
            setEntity(entity, this.ui.properties);
        }
    }
}