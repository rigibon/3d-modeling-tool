import { Scene } from "./scene";
import { UI, setEntity } from "./UI/UI";
import { WebGLContext } from "./context";
import { Model } from "./model";
import { vec3, mat4, glMatrix } from "gl-matrix";
import { Shader } from "./shader";
import { vOutline, fOutline } from "./shaders/outline";
import { vBasic, fBasic } from "./shaders/basic";
import { ToolManager } from "./tools/toolManager";
import { fPbr, vPbr } from "./shaders/pbr";
import { Skybox } from "./skybox";
import { PhongLight } from "./light";
import { Grid } from "./grid";
import axios from "axios";
import { generateHalfedges } from "./geometry/halfedge";
import { GeometryProcessing } from "./geometry/processing";
import { data } from "./models/a";
import { Mesh } from "./test/mesh.js";
import MultiMesh from "./test/multimesh.js";
import Primitives, { createMesh } from "./test/primitives.js";
import { vMatcap, fMatcap } from "./shaders/matcapShader";
import { loadTexture } from "./texture.js";
import Subdivision from "./test/subdivision.js";
import { Utils } from "./test/utils.js";
import Picking from "./test/picking.js";
import Camera from "./test/camera.js";
import { SocketHandler } from "./sockets/socketHandler";
import { vWireframe, fWireframe } from "./shaders/wireframe";
import { TopEditor } from "./topEditor.js";
import { vEdge, fEdge } from "./shaders/edge";
import { TrackballCamera } from "./trackballRotator.js";
import {
    TransformGizmo,
    CursorEditingGizmo,
    RotationGizmo,
    ScaleGizmo,
    ExtrudeGizmo,
} from "./gizmos.js";
import { Buffer } from "buffer";
import $ from "jquery";
import { ThirdPersonCamera } from "./cameras/thirdPersonCamera";
import { vVertex, fVertex } from "./shaders/vertexHighlightShader";
import { vPoint, fPoint } from "./shaders/points";

var firstTime = true;

var modelPosition = vec3.fromValues(0.0, 0.0, 0.0);
var zoomChanged = false;

export class Application {
    context: WebGLContext;
    ui: UI;
    scene: Scene;
    canvas: any;
    skybox: Skybox;

    constructor(scene: Scene, ui: UI, canvas: any, context: WebGLContext) {
        this.scene = scene;
        this.ui = ui;
        this.canvas = canvas;
        this.context = context;

        this.canvas.oncontextmenu = function (e: any) {
            e.preventDefault();
        };

        // this.scene.skyboxInit = new Skybox(
        //     context.gl,
        //     "http://localhost:3000/HDR_040_Field_Ref.hdr",
        //     true,
        //     canvas
        // );
        this.scene.skybox = null;
        this.scene.skyboxInit = null;
    }

    run = async (gl: any, modelName: string): Promise<void> => {
        await this.ui.init();

        // @ts-ignore
        window.buffer = Buffer;

        // Set UI scene variable with this scene
        this.ui.properties.scene = this.scene;

        // Create shaders for topology types
        var edgeShader: Shader = new Shader(vEdge, fEdge, gl);

        var vertexShader: Shader = new Shader(vVertex, fVertex, gl);

        var pointShader: Shader = new Shader(vPoint, fPoint, gl);

        // Create and set all cameras in scene
        this.scene.setCameras(gl, this.canvas, modelPosition, this.ui);

        // Create default cube model
        var mesh: Model;
        var cube: Model;

        cube = new Model(
            gl,
            "Cube",
            modelPosition,
            vec3.fromValues(0.0, 0.0, 0.0),
            Primitives.createCube(gl),
            true,
            pbrShader
        );

        // Load model or instantiate default cube in scene
        if (modelName) {
            mesh = new Model(
                gl,
                modelName.split(".")[0],
                modelPosition,
                vec3.fromValues(0.0, 0.0, 0.0),
                Primitives.createCube(gl),
                true,
                pbrShader
            );
    
            mesh.loadNewModel(gl, modelName);
    
            this.scene.addModel(mesh);

            setEntity(mesh, this.ui.properties, 0);
        } else {
            this.scene.addModel(cube);

            setEntity(cube, this.ui.properties, 0);
        }

        // Set edge shader matrices and buffers
        var edgeShader = new Shader(vEdge, fEdge, gl);
        edgeShader.use();

        gl.enableVertexAttribArray(0);
        var edgeVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, edgeVertexBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([0, 0, 0, 1, 0, 0]),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        var projectionMatrix = mat4.create();
        mat4.perspective(
            projectionMatrix,
            glMatrix.toRadian(40),
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            1.0,
            100.0
        );

        var worldMatrix = mat4.create();
        mat4.translate(
            worldMatrix,
            worldMatrix,
            vec3.fromValues(0.0, 0.0, 0.0)
        );

        edgeShader.setMat4("worldMatrix", cube.worldMatrix);
        edgeShader.setMat4("viewMatrix", this.scene.activeCam.viewMatrix);
        edgeShader.setMat4("projectionMatrix", projectionMatrix);

        // Create grid
        var grid: Grid = new Grid(gl);


        // Create wireframe shader
        var wireframeShader: Shader = new Shader(vWireframe, fWireframe, gl);

        // Create and set outline shader
        var outlineShader: Shader = new Shader(vOutline, fOutline, gl);

        outlineShader.use();

        outlineShader.setMat4("projectionMatrix", projectionMatrix);

        // Create and set pbr shader
        var pbrShader: Shader = new Shader(vPbr, fPbr, gl);
        pbrShader.use();

        pbrShader.setInt("usingPBR", 1);

        pbrShader.setMat4("worldMatrix", cube.worldMatrix);
        pbrShader.setMat4("viewMatrix", this.scene.activeCam.viewMatrix);
        pbrShader.setMat4("projectionMatrix", projectionMatrix);

        var inverseViewMatrix = mat4.create();
        var modelViewMatrix = mat4.create();

        mat4.invert(inverseViewMatrix, this.scene.activeCam.viewMatrix);
        mat4.multiply(modelViewMatrix, worldMatrix, inverseViewMatrix);
        mat4.transpose(modelViewMatrix, modelViewMatrix);
        mat4.invert(modelViewMatrix, modelViewMatrix);

        pbrShader.setMat4("normalMatrix", modelViewMatrix);

        // Create picking and init alpha
        var picking = new Picking(
            this.scene.activeCam,
            cube.topMesh,
            this.canvas,
            false
        );
        picking.initAlpha();

        // Set window event listeners
        window.addEventListener("keydown", (event) => {
            if (event.shiftKey && this.ui.properties.selectedMode === "Sculpt") {
                this.ui.properties.negativeSculpt = true;
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "Shift" && this.ui.properties.selectedMode === "Sculpt") {
                this.ui.properties.negativeSculpt = false;
            }
        });

        window.addEventListener("mousemove", (event) => {
            this.scene.activeCam.mouseMoveCallback(event);
            // @ts-ignore
            var rect = event.target.getBoundingClientRect();

            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;

            var pos = { x: x, y: y };

            // @ts-ignore
            pos.x = (pos.x * event.target.width) / event.target.clientWidth;

            // @ts-ignore
            pos.y = (pos.y * event.target.height) / event.target.clientHeight;

            // @ts-ignore
            var xPos = (pos.x / this.canvas.clientWidth) * 2 - 1;
            var yPos = (pos.y / this.canvas.clientHeight) * -2 + 1;

            cursorEditingGizmo._xPos = xPos;
            cursorEditingGizmo._yPos = yPos;
        });

        window.addEventListener("mousedown", (event) => {
            this.scene.activeCam.mousePressCallback(event);
        });

        window.addEventListener("mouseup", (event) => {
            this.scene.activeCam.mouseUpCallback(event);
        });

        window.addEventListener("wheel", (event) => {
            this.scene.activeCam.zoomCallback(event);
            zoomChanged = true;
        });

        // Create and set gizmos
        var scaleGizmo = new ScaleGizmo(gl);
        scaleGizmo.Create(gl, modelPosition);
        scaleGizmo.SetBuffers(gl);

        var rotationGizmo = new RotationGizmo(gl, cube.position);

        var cursorEditingGizmo = new CursorEditingGizmo(gl);

        var transformGizmo = new TransformGizmo(gl, cube.position);

        var extrudeGizmo = new ExtrudeGizmo(gl, cube.position);

        // Create and set topology editor
        var center = cube.position;

        var topEditor = new TopEditor(picking);
        topEditor.Instantiate(
            gl,
            this.ui.properties.selectedEntity,
            rotationGizmo,
            cube.position,
            edgeShader,
            transformGizmo,
            scaleGizmo,
            this.ui,
            extrudeGizmo,
            center
        );

        // Create and set tool manager
        var toolManager: ToolManager = new ToolManager(
            this.ui,
            this.ui.properties.selectedEntity,
            picking,
            this.scene.activeCam,
            this.canvas
        );

        var then = 0;

        var newPosition = vec3.create();

        // Create and set texture for rendering viewport into ImGui
        var texts = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texts);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.canvas.clientWidth - 300,
            this.canvas.clientHeight - 50,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        var captureFBO = gl.createFramebuffer();
        var antialiasFBO = gl.createFramebuffer();
        var depthRBO = gl.createRenderbuffer();
        var captureRBO = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, captureRBO);
        gl.renderbufferStorageMultisample(
            gl.RENDERBUFFER,
            gl.getParameter(gl.MAX_SAMPLES),
            gl.RGBA8,
            this.canvas.clientWidth - 300,
            this.canvas.clientHeight - 50
        );

        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRBO);
        gl.renderbufferStorageMultisample(
            gl.RENDERBUFFER,
            gl.getParameter(gl.MAX_SAMPLES),
            gl.DEPTH_COMPONENT24,
            this.canvas.clientWidth - 300,
            this.canvas.clientHeight - 50
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, captureFBO);
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.RENDERBUFFER,
            captureRBO
        );
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            depthRBO
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, antialiasFBO);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texts,
            0
        );

        gl.viewport(
            0,
            0,
            this.canvas.clientWidth - 300,
            this.canvas.clientHeight - 50
        );

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Set PBR shader textures, variables and lights positions
        pbrShader.use();

        pbrShader.setInt("albedoMap", 0);
        pbrShader.setInt("normalMap", 1);
        pbrShader.setInt("metallicMap", 2);
        pbrShader.setInt("roughnessMap", 3);
        pbrShader.setInt("aoMap", 4);

        pbrShader.setInt("environmentMap", 5);
        pbrShader.setInt("prefilterMap", 6);
        pbrShader.setInt("brdfLUT", 7);

        pbrShader.setFloat("exposure", 1.0);
        pbrShader.setFloat("gamma", 1.5);
        pbrShader.setFloat("ambientIntensity", 1.0);

        pbrShader.setVec3("lights[0].position", 5.0, 2, 12.0);
        pbrShader.setVec3("lights[0].color", 1, 1, 1);
        pbrShader.setFloat("lights[0].intensity", 30);
        pbrShader.setFloat("lights[0].aconst", 1);
        pbrShader.setFloat("lights[0].alin", 1);
        pbrShader.setFloat("lights[0].aquad", 1);
        pbrShader.setVec3("lights[1].position", -5.0, -2, -12.0);
        pbrShader.setVec3("lights[1].color", 1, 1, 1);
        pbrShader.setFloat("lights[1].intensity", 30);
        pbrShader.setFloat("lights[1].aconst", 1);
        pbrShader.setFloat("lights[1].alin", 1);
        pbrShader.setFloat("lights[1].aquad", 1);
        pbrShader.setVec3("lights[2].position", 11.9, 5.1, 8.8);
        pbrShader.setVec3("lights[2].color", 0.996, 0.945, 0.878);
        pbrShader.setFloat("lights[2].intensity", 200);
        pbrShader.setFloat("lights[2].aconst", 1);
        pbrShader.setFloat("lights[2].alin", 1);
        pbrShader.setFloat("lights[2].aquad", 1);

        // Rendering function
        var render = (now: number): void => {
            now *= 0.001; // convert to seconds
            const deltaTime = now - then;
            then = now;

            // Setup WebGL configuration
            gl.clearDepth(1.0); // Clear everything
            gl.enable(gl.DEPTH_TEST); // Enable depth testing
            gl.enable(gl.STENCIL_TEST);
            gl.clear(
                gl.COLOR_BUFFER_BIT |
                    gl.DEPTH_BUFFER_BIT |
                    gl.STENCIL_BUFFER_BIT
            );
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clearColor(0.24, 0.24, 0.24, 1.0);
            gl.depthFunc(gl.LEQUAL);
            // gl.enable(gl.CULL_FACE);

            // Render if UI not loading
            if (!this.ui.loading) {
                if (!this.ui.properties.selectedMeshFromEntity && this.ui.properties.selectedEntity) {
                    this.ui.properties.selectedMeshFromEntity = this.ui.properties.selectedEntity.topMeshes[0];
                }
    
                // Set wantCaptureMouse for active camera in scene
                if (this.ui && this.ui.io && this.scene.activeCam) {
                    this.scene.activeCam.wantCaptureMouse = this.ui.io.WantCaptureMouse;
                }
    
                pbrShader.use();
    
                var camPos = vec3.create();
    
                if (this.scene.activeCam) {
                    camPos = this.scene.activeCam.getPosition();
                }
    
                pbrShader.setVec3("camPos", camPos[0], camPos[1], camPos[2]);
    
                if (this.ui.properties.selectedMode === "Sculpt") {
                    gl.viewport(
                        0,
                        0,
                        this.canvas.clientWidth - 300,
                        this.canvas.clientHeight - 50
                    );
                } else {
                    gl.viewport(
                        0,
                        0,
                        this.canvas.clientWidth,
                        this.canvas.clientHeight
                    );
                }
    
                this.scene.selectedEntity = this.ui.properties.selectedEntity;
    
                pbrShader.use();
    
                if (this.ui.properties.changeCamera) {
                    this.context.removeCallbacks(this.scene.activeCam, this.ui);
    
                    if (this.ui.properties.selectedCameraType === "Trackball") {
                        this.context.setupCallbacks(
                            this.scene.trackballCamera,
                            this.ui
                        );
                        this.scene.activeCam = this.scene.trackballCamera;
                    } else if (this.ui.properties.selectedCameraType === "Free") {
                        this.context.setupCallbacks(
                            this.scene.thirdPersonCamera,
                            this.ui
                        );
                        this.scene.activeCam = this.scene.thirdPersonCamera;
                    }
    
                    this.ui.properties.changeCamera = false;
                }
    
                // Set callbacks for scene mode
                if (this.ui.properties.selectedMode === "Scene") {
                    topEditor.SetSelectionMode(5);
                    if (this.ui.properties.selectedCameraType === "Trackball") {
                        this.context.setupCallbacks(
                            this.scene.trackballCamera,
                            this.ui
                        );
                        this.scene.activeCam = this.scene.trackballCamera;
                    } else if (this.ui.properties.selectedCameraType === "Free") {
                        this.context.setupCallbacks(
                            this.scene.thirdPersonCamera,
                            this.ui
                        );
                        this.scene.activeCam = this.scene.thirdPersonCamera;
                    }
                }
    
                // Set callbacks for edit
                if (this.ui.properties.selectedMode === "Edit") {
                    this.context.removeCallbacks(this.scene.activeCam, this.ui);
    
                    this.context.setupCallbacks(this.scene.editorCamera, this.ui);
    
                    this.scene.activeCam = this.scene.editorCamera;
                    if (topEditor._selectionMode === 5)
                        this.scene.activeCam.lookAt = [-this.ui.properties.transformPosition[0], -this.ui.properties.transformPosition[1], -this.ui.properties.transformPosition[2]];
    
                    this.ui.properties.changeCamera = false;
                }
    
                // Set callbacks for sculpt
                if (this.ui.properties.selectedMode === "Sculpt") {
                    this.context.removeCallbacks(this.scene.activeCam, this.ui);
    
                    this.context.setupCallbacks(this.scene.sculptCamera, this.ui);
    
                    this.scene.activeCam = this.scene.sculptCamera;
                    this.scene.activeCam.lookAt = [-this.ui.properties.transformPosition[0], -this.ui.properties.transformPosition[1], -this.ui.properties.transformPosition[2]];
    
                    topEditor.SetSelectionMode(-1);
    
                    this.ui.properties.changeCamera = false;
                }
    
                // Update free camera
                if (this.scene.activeCam.type === "Free") {
                    this.scene.activeCam.update();
                }
    
                // Handling new topology mode selected in scene
                if (this.ui.properties.newTopModeSelected) {
                    if (this.ui.properties.selectedTopMode === "") {
                        topEditor.SetSelectionMode(5);
                        topEditor._topologyPick.RestartPicking();
                    }
    
                    if (this.ui.properties.selectedTopMode === "Vertex selection") {
                        topEditor.SetSelectionMode(0);
                        topEditor.SetMode(-1);
                        topEditor._topologyPick.RestartPicking();
                    }
    
                    if (this.ui.properties.selectedTopMode === "Edge selection") {
                        topEditor.SetSelectionMode(2);
                        topEditor.SetMode(-1);
                        topEditor._topologyPick.RestartPicking();
                    }
    
                    if (this.ui.properties.selectedTopMode === "Face selection") {
                        topEditor.SetSelectionMode(1);
                        topEditor.SetMode(-1);
                        topEditor._topologyPick.RestartPicking();
                    }
    
                    // if (this.ui.properties.selectedTopMode === "Mesh selection") {
                    //     topEditor.SetSelectionMode(5);
                    //     topMode.SetMode(-1);
                    //     topEditor._topologyPick.RestartPicking();
                    // }
    
                    this.ui.properties.newTopModeSelected = false;
                }
    
                // Handling tool selected in scene 
                if (this.ui.properties.newToolSelected) {
                    if (this.ui.properties.selectedTool === "") {
                        topEditor.SetMode(-1);
                    }
    
                    if (this.ui.properties.selectedTool === "Rotate") {
                        topEditor.SetMode(4);
                        this.ui.properties.selectedTopMode = "Mesh selection";
                        topEditor._topologyPick.RestartPicking();
                    }
    
                    if (this.ui.properties.selectedTool === "Scale") {
                        topEditor.SetMode(12);
                        this.ui.properties.selectedTopMode = "Mesh selection";
                        topEditor._topologyPick.RestartPicking();
                    }
    
                    if (this.ui.properties.selectedTool === "Translate") {
                        topEditor.SetMode(25);
                    }
    
                    if (this.ui.properties.selectedTool === "Extrude") {
                        topEditor.SetMode(52);
                    }
    
                    this.ui.properties.newToolSelected = false;
                }
    
                if (this.ui.io) {
                    this.ui.io.ConfigInputTextCursorBlink = true;
                }
    
                // Handling new model loaded
                if (this.ui.properties.loadNewModel) {
                    var newMesh: Model = new Model(
                        gl,
                        "Model" + this.scene.models.length,
                        modelPosition,
                        vec3.fromValues(0.0, 0.0, 0.0),
                        Primitives.createCube(gl),
                        true,
                        pbrShader
                    );
    
                    newMesh.loadNewModel(gl, this.ui.properties.modelSrc);
    
                    this.scene.addModel(newMesh);
    
                    this.ui.properties.loadNewModel = false;
                }
    
                // Render grid
                if (this.ui.properties.selectedMode !== "Sculpt" && this.ui.properties.grid) {
                    grid.render(
                        true,
                        this.scene.activeCam.viewMatrix,
                        this.scene.activeCam.projectionMatrix
                    );
                }
    
                // Set PBR shader textures on runtime in scene
                pbrShader.use();
    
                pbrShader.setInt("albedoMap", 0);
                pbrShader.setInt("normalMap", 1);
                pbrShader.setInt("metallicMap", 2);
                pbrShader.setInt("roughnessMap", 3);
                pbrShader.setInt("aoMap", 4);
    
                pbrShader.setInt("environmentMap", 5);
                pbrShader.setInt("prefilterMap", 6);
                pbrShader.setInt("brdfLUT", 7);
    
                // Draw models in scene
                this.scene.drawModels(
                    gl,
                    pbrShader,
                    this.scene.activeCam.viewMatrix,
                    this.scene.activeCam.projectionMatrix,
                    outlineShader,
                    wireframeShader,
                    pointShader,
                    this.ui.properties
                );
    
                // Set wireframe shader buffers
                wireframeShader.use();
    
                gl.bindBuffer(
                    gl.ELEMENT_ARRAY_BUFFER,
                    cube.topMesh.getWireframeBuffer()._buffer
                );
                gl.bufferData(
                    gl.ELEMENT_ARRAY_BUFFER,
                    new Uint32Array(getWireframe(cube.topMesh)),
                    gl.STATIC_DRAW
                );
    
                pbrShader.use();

                // Handling new model selected in scene with topology editor
                if (this.ui.properties.newModelSelected) {
                    topEditor.SetSelectionMode(5);
                    this.ui.properties.selectedTopMode = "";
                    this.ui.properties.newModelSelected = false;
                    if (this.ui.properties.selectedEntity && this.ui.properties.selectedCameraType === "Trackball" && this.ui.properties.selectedMode === "Scene") {
                        this.scene.activeCam.lookAt = [-this.ui.properties.transformPosition[0], -this.ui.properties.transformPosition[1], -this.ui.properties.transformPosition[2]];
                    }
                }
    
                // Set vertex shader matrices with cameras in scene
                vertexShader.use();
    
                vertexShader.setMat4("viewMatrix", this.scene.activeCam.viewMatrix);
                vertexShader.setMat4(
                    "projectionMatrix",
                    this.scene.activeCam.projectionMatrix
                );
    
                // Set edge shader matrices with cameras in scene
                edgeShader.use();
    
                edgeShader.setMat4("viewMatrix", this.scene.activeCam.viewMatrix);
                if (this.ui.properties.selectedEntity)
                    edgeShader.setMat4("worldMatrix", this.ui.properties.selectedEntity.worldMatrix);
    
                topEditor.faceShader = edgeShader;
    
                if (this.ui.properties.selectedMode === "Sculpt") {
                    topEditor.SetMode(-1);
                    topEditor.SetSelectionMode(-1);
                }

                // Handling highlight topology
                if (
                    this.ui.properties.selectedMode !== "Sculpt" &&
                    this.ui.properties.selectedEntity
                )
                    topEditor.Highlight(
                        gl,
                        edgeShader,
                        vertexShader,
                        this.ui.properties.selectedEntity.worldMatrix
                    );
    
                // Create matrix for cursor gizmo
                var xx = this.scene.activeCam.viewMatrix[0];
                var yx = this.scene.activeCam.viewMatrix[4];
                var zx = this.scene.activeCam.viewMatrix[8];
    
                var d = Math.sqrt(
                    Math.pow(xx, 2) + Math.pow(yx, 2) + Math.pow(zx, 2)
                );
    
                var newView = mat4.fromValues(
                    d,
                    0,
                    0,
                    0,
                    0,
                    d,
                    0,
                    0,
                    0,
                    0,
                    d,
                    0,
                    0,
                    0,
                    -4,
                    1
                );
    
                // Update gizmos center
                if (this.ui.properties.selectedEntity) {
                    transformGizmo.updateCenter(this.ui.properties.selectedEntity.worldMatrix, newPosition, this.ui);
                    rotationGizmo.updateCenter(this.ui.properties.selectedEntity.worldMatrix, newPosition, this.ui);
                    scaleGizmo.updateCenter(cube.worldMatrix, newPosition, this.ui);
                }
    
                this.ui.properties.updateGizmoPosition = false;
    
                // Draw transform gizmos (rotation, scale and transform gizmos)
                if (topEditor._mode === 4 && this.ui.properties.selectedEntity) {
                    rotationGizmo.Draw(
                        gl,
                        this.scene.activeCam.viewMatrix,
                        this.ui.properties.selectedEntity.worldMatrix,
                        projectionMatrix,
                        this.scene.activeCam.getPosition()
                    );
                }
    
                if (topEditor._mode === 12 && this.ui.properties.selectedEntity) {
                    scaleGizmo.Draw(
                        gl,
                        this.scene.activeCam.viewMatrix,
                        this.ui.properties.selectedEntity.worldMatrix,
                        projectionMatrix,
                        this.scene.activeCam.getPosition()
                    );
                }
                
                if (topEditor._mode === 25 && this.ui.properties.selectedEntity) {
                    if (topEditor._selectionMode === 5) {
                        transformGizmo.Draw(
                            gl,
                            this.scene.activeCam.viewMatrix,
                            this.ui.properties.selectedEntity.worldMatrix,
                            projectionMatrix,
                            this.scene.activeCam.getPosition()
                        );
                    } else {
                        var position;
    
                        if (topEditor._selectionMode === 0) {
                            var vAr = this.ui.properties.selectedMeshFromEntity.getVertices();
    
                            var vertexIndex = topEditor._topologyPick.GetPickedVertices()[0];
    
                            position = [vAr[vertexIndex * 3 + 0], vAr[vertexIndex * 3 + 1], vAr[vertexIndex * 3 + 2]];
                        }
    
                        if (topEditor._selectionMode === 1) {
                            position = topEditor.GetAveragePositionFromFaces(
                                this.ui.properties.selectedMeshFromEntity,
                                topEditor._topologyPick.GetPickedFaces()
                            );
                        }
    
                        if (topEditor._selectionMode === 2) {
                            position = topEditor.GetAveragePositionFromEdges(
                                this.ui.properties.selectedMeshFromEntity,
                                topEditor._topologyPick.GetPickedEdges()
                            )
                        }
    
                        transformGizmo.Draw(
                            gl,
                            this.scene.activeCam.viewMatrix,
                            cube.worldMatrix,
                            projectionMatrix,
                            this.scene.activeCam.getPosition(),
                            position
                        );
                    }
                    
                    zoomChanged = false;
                }
    
                // Draw extrude gizmo
                if (topEditor._mode === 52 && this.ui.properties.selectedEntity) {
                    var facesNormal = topEditor.AverageNormalFromPickedFaces(
                        this.ui.properties.selectedMeshFromEntity
                    );
    
                    var extrudeGizmoWorldMatrix = mat4.create();
                    mat4.copy(extrudeGizmoWorldMatrix, cube.worldMatrix);
    
                    var averagePosition = topEditor.GetAveragePositionFromFaces(
                        this.ui.properties.selectedMeshFromEntity,
                        topEditor._topologyPick.GetPickedFaces()
                    );
    
                    var selectedEntityPosition = vec3.fromValues(
                        this.ui.properties.selectedEntity.worldMatrix[12],
                        this.ui.properties.selectedEntity.worldMatrix[13],
                        this.ui.properties.selectedEntity.worldMatrix[14]
                    );
    
                    extrudeGizmo.Draw(
                        gl,
                        this.scene.activeCam.viewMatrix,
                        extrudeGizmoWorldMatrix,
                        projectionMatrix,
                        this.scene.activeCam.getPosition(),
                        facesNormal,
                        averagePosition,
                        selectedEntityPosition
                    );
                }
    
                // Draw cursor gizmo
                if (this.ui.io && this.ui.io.WantCaptureMouse) {
                    cursorEditingGizmo.Draw(gl, newView);
                    document.getElementById("c").style.cursor = "default";
                } else {
                    cursorEditingGizmo.Draw(gl, newView);
                    document.getElementById("c").style.cursor = "none";
                }
    
                // Handling subdividision
                if (this.ui.properties.subdivide === true) {
                    subdivideClamp(
                        this.ui.properties.selectedMeshFromEntity,
                        this.ui.properties.linear,
                        this.ui.properties.steps
                    );
    
                    this.ui.properties.selectedEntity.setupAltBuffers(
                        gl,
                        this.ui.properties.selectedMeshFromEntity,
                        true
                    );
    
                    this.ui.properties.subdivide = false;
                }
    
                // Handle extruding mesh in scene
                if (this.ui.properties.selectedMeshFromEntity)
                    var fnAr =
                        this.ui.properties.selectedMeshFromEntity.getFaceNormals();
    
                if (topEditor.updateExtrudedMesh && firstTime) {
                    this.ui.properties.meshExtruded = true;
                    this.ui.properties.lastRadius = picking.getLocalRadius2();
                    
                    var tempW = mat4.create();
    
                    var extrudeData = topEditor.Extrude(gl);
                    extrudeData.mesh._name =
                        this.ui.properties.selectedMeshFromEntity._name;
                    extrudeData.mesh.worldMatrix =
                        this.ui.properties.selectedMeshFromEntity.worldMatrix;
    
                    extrudeData.mesh.texCoords = this.ui.properties.selectedMeshFromEntity.texCoords;
                    extrudeData.mesh.texCoordsBuffer = this.ui.properties.selectedMeshFromEntity.texCoordsBuffer;
                    this.ui.properties.selectedMeshFromEntity = extrudeData.mesh;
                    this.ui.properties.selectedEntity.topMeshes[0] =
                        extrudeData.mesh;
    
                    var fnAr =
                        this.ui.properties.selectedMeshFromEntity.getFaceNormals();
    
                    for (var i = 0; i < extrudeData.faceIndices.length; i++) {
                        var face = extrudeData.faceIndices[i];
                        fnAr[face * 3 + 0] = -fnAr[face * 3 + 0];
                        fnAr[face * 3 + 1] = -fnAr[face * 3 + 1];
                        fnAr[face * 3 + 2] = -fnAr[face * 3 + 2];
                    }
    
                    this.ui.properties.selectedEntity.setupAltBuffers(
                        gl,
                        this.ui.properties.selectedMeshFromEntity,
                        true
                    );
    
                    topEditor.updateExtrudedMesh = false;
                }
            }

            // Instantiate tool manager in scene
            toolManager.instantiate(texts, then);

            // Render from active main camera in scene
            this.scene.activeCam.render(gl, pbrShader);

            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
    };
}

// Create wireframe buffers
function getWireframe(mesh: any) {
    var nbEdges = mesh.getNbEdges();
    var cdw;
    var useDrawArrays = mesh.isUsingDrawArrays();
    if (useDrawArrays) {
        if (
            mesh._meshData._drawArraysWireframe &&
            mesh._meshData._drawArraysWireframe.length === nbEdges * 2
        ) {
            return mesh._meshData._drawArraysWireframe;
        }
        cdw = mesh._meshData._drawArraysWireframe = new Uint32Array(
            nbEdges * 2
        );
    } else {
        if (
            mesh._meshData._drawElementsWireframe &&
            mesh._meshData._drawElementsWireframe.length === nbEdges * 2
        ) {
            return mesh._meshData._drawElementsWireframe;
        }
        cdw = mesh._meshData._drawElementsWireframe = new Uint32Array(
            nbEdges * 2
        );
    }

    var fAr = mesh.getFaces();
    var feAr = mesh.getFaceEdges();
    var nbFaces = mesh.getNbFaces();
    var facesToTris = mesh.getFacesToTriangles();

    var nbLines = 0;
    var tagEdges = new Uint8Array(nbEdges);

    for (var i = 0; i < nbFaces; ++i) {
        var id = i * 4;

        var iv1, iv2, iv3;
        var iv4 = fAr[id + 3];
        var isQuad = iv4 !== Utils.TRI_INDEX;

        if (useDrawArrays) {
            var idTri = facesToTris[i] * 3;
            iv1 = idTri;
            iv2 = idTri + 1;
            iv3 = idTri + 2;
            if (isQuad) iv4 = idTri + 5;
        } else {
            iv1 = fAr[id];
            iv2 = fAr[id + 1];
            iv3 = fAr[id + 2];
        }

        var ide1 = feAr[id];
        var ide2 = feAr[id + 1];
        var ide3 = feAr[id + 2];
        var ide4 = feAr[id + 3];

        if (tagEdges[ide1] === 0) {
            tagEdges[ide1] = 1;
            cdw[nbLines * 2] = iv1;
            cdw[nbLines * 2 + 1] = iv2;
            nbLines++;
        }
        if (tagEdges[ide2] === 0) {
            tagEdges[ide2] = 1;
            cdw[nbLines * 2] = iv2;
            cdw[nbLines * 2 + 1] = iv3;
            nbLines++;
        }
        if (tagEdges[ide3] === 0) {
            tagEdges[ide3] = 1;
            cdw[nbLines * 2] = iv3;
            cdw[nbLines * 2 + 1] = isQuad ? iv4 : iv1;
            nbLines++;
        }
        if (isQuad && tagEdges[ide4] === 0) {
            tagEdges[ide4] = 1;
            cdw[nbLines * 2] = iv4;
            cdw[nbLines * 2 + 1] = iv1;
            nbLines++;
        }
    }
    return useDrawArrays
        ? mesh._meshData._drawArraysWireframe
        : mesh._meshData._drawElementsWireframe;
}

// Subdivide clamp function
function subdivideClamp(mesh: any, linear: any, steps: any) {
    Subdivision.LINEAR = !!linear;
    // mesh.addLevel();
    while (mesh.getNbFaces() < steps) mesh.addLevel();
    // keep at max 4 multires
    mesh._meshes.splice(0, Math.min(mesh._meshes.length - 4, 4));
    mesh._sel = mesh._meshes.length - 1;
    Subdivision.LINEAR = false;
}