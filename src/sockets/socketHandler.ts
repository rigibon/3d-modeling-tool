import { io, Socket } from "socket.io-client";
import { UIproperties } from "../UI/UIproperties";
import { vec3 } from "gl-matrix";
import { Model } from "../model";
import { setEntity } from "../UI/UI";
import { TransformTool } from "../tools/transformTool";

export class SocketHandler {
    socket: Socket;
    transformTool: TransformTool;

    constructor() {
        this.socket = io("http://localhost:3000", { transports: ["websocket"] });
        this.transformTool = new TransformTool(null, null);
    }

    getPropsFromServer(clientProps: any): void {
        this.socket.on("propsFromServer", (serverProps) => {

            if (serverProps.selectedIndex != -1) {
                if (serverProps.selectedIndex !== clientProps.selectedIndex) {
                    this.transformTool.use(clientProps.scene.entities[serverProps.selectedIndex], serverProps);
                } else {
                    clientProps.transformPosition = serverProps.transformPosition;
                    clientProps.transformRotation = serverProps.transformRotation;
                    clientProps.transformScale = serverProps.transformScale;
                }
            }

        });

        return null;
    }

    sendPropsToServer(properties: Object): void {
        this.socket.emit("propsFromClient", properties);
    }

    getModifiedVertexDataFromServer(UIproperties: any): void {
        this.socket.on("modifiedVertexDataFromServer", (modifiedVertexData) => {
            var position = modifiedVertexData.position;
            var normal = modifiedVertexData.normal;
            var meshIndex = modifiedVertexData.meshIndex;
            var vertexIndex = modifiedVertexData.index;

            UIproperties.scene.entities[modifiedVertexData.selectedIndex].meshes[meshIndex].updateVertex(UIproperties.gl, vertexIndex, vec3.fromValues(position[0], position[1], position[2]));
            UIproperties.scene.entities[modifiedVertexData.selectedIndex].meshes[meshIndex].updateNormal(UIproperties.gl, vertexIndex, vec3.fromValues(normal[0], normal[1], normal[2]));
        })
    }

    sendModifiedVertexDataToServer(modifiedVertexData: Object): void {
        this.socket.emit("modifiedVertexDataFromClient", modifiedVertexData);
    }

    getEntityToAddFromServer(UIproperties: any): void {
        this.socket.on("entityToAddFromServer", (entityToAdd) => {
            var newModel = new Model(entityToAdd.name, vec3.fromValues(0.0, 0.0, 0.0), null);
            newModel.load(UIproperties.gl, entityToAdd.type);
            UIproperties.scene.addModel(newModel);

            setEntity(newModel, UIproperties);
        })
    }

    getChatMessageFromServer(UIproperties: any): void {
        this.socket.on("getChatMessageFromServer", (message) => {
            UIproperties.chatMessages.push(message.buffer); 
        })
    }

    sendEntityToAddToServer(entityToAdd: any): void {
        this.socket.emit("entityToAddFromClient", entityToAdd);
    }

    sendSculptDataToServer(sculptData: any): void {
        this.socket.emit("sendToServer", sculptData);
    }

    sendChatMessageToServer(message: any): void {
        this.socket.emit("sendChatMessageToServer", message);
    }
}