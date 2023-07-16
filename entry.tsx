import { Application } from "./src/application";
import { Scene } from "./src/scene";
import { WebGLContext } from "./src/context";
import { UI } from "./src/UI/UI";
import { SocketHandler } from "./src/sockets/socketHandler";

export async function main(canvas: any, modelName: string): Promise<void> {
    var newScene: Scene = new Scene();
    var UIcontext: WebGLContext = new WebGLContext(canvas);
    var context: WebGLContext = new WebGLContext(canvas);
    var socketHandler: SocketHandler = new SocketHandler();
    var ui: UI = new UI(canvas, UIcontext, socketHandler);
    
    const app: Application = new Application(newScene, ui, canvas, context);
    
    app.run(context.gl, modelName);
}