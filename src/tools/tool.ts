import {selectEntity} from "../geometry/algorithms";

export interface Tool {
    isActive: boolean;
    name: string;
    pick: boolean;
    
    use(): void;

    mouseDownCallback(event: any): void;
    mouseMoveCallback(event: any): void;
    mouseUpCallback(event: any): void;
}