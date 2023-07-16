import * as icons from "./icons/icons";
import { matcapIDs } from "./textures.js";

export var UIproperties = {
    transformPosition: [0, 0, 0],
    transformRotation: [0, 0, 0],
    transformScale: [1, 1, 1],
    icons: [
        icons.edge,
        icons.up_down_left_right,
        icons.pen_fancy,
        icons.plus,
        icons.camera,
        icons.globe,
        icons.earth_americas,
        icons.file_export,
        "PBR",
        "Shader",
    ],
    modes: [
        "Edit",
        "Transform",
        "Sculpt",
        "Add",
        "Select camera",
        "Material",
        "Environment",
        "Export",
        "PBR",
        "Shader",
    ],
    modelNames: [
        "Cube",
        "Ball",
        "Sphere",
        "Non-manifold Cube",
        "Non-manifold Sphere",
        "Monkey",
        "Glasses",
        "Coat",
    ],
    selectedMode: "Scene",
    scene: null,
    backgroundColor: [125 / 255, 125 / 255, 125 / 255],
    activeCamera: -1,
    newCameraSelected: false,
    newSelected: false,
    selectedEntity: null,
    selectedIndex: -1,
    grid: true,
    font: null,
    iconsfont: null,
    io: null,
    hoveredItem: false,
    dblclick: false,
    displayInputText: false,
    brushSize: 0.1,
    strength: 1,
    gl: null,
    socketHandler: null,
    iblEnabled: true,
    irradianceMap: true,
    prefilterMap: true,
    brdfLUTTexture: true,
    albedo: true,
    normal: true,
    metallic: true,
    roughness: true,
    ao: true,
    skybox: true,
    albedoTexture: null,
    normalTexture: null,
    metallicTexture: null,
    roughnessTexture: null,
    aoTexture: null,
    fonts: null,
    renderWindow: false,
    matcapID: 0,
    matcapTexture: null,
    loadedNewTexture: false,
    matcapIDs: matcapIDs,
    matcapTextures: [],
    selectedTopMode: "",
    newTopModeSelected: false,
    newToolSelected: false,
    selectedTool: "",
    message: null,
    chatMessages: [],
    focusChatInputText: false,
    newMessage: false,
    loadNewModel: false,
    modelSrc: "",
    steps: 40,
    linear: false,
    subdivide: false,
    selectedRenderingMode: "Solid",
    rotationOffsetX: 0,
    rotationOffsetY: 0,
    rotationOffsetZ: 0,
    updateGizmoPosition: false,
    selectedCameraType: "Trackball",
    cameraTypes: ["Trackball", "Free"],
    changeCamera: false,
    toolIcons: [
        icons.empty_arrows,
        icons.orientational_gimbal,
        icons.particle_data,
    ],
    transformTools: ["Translate", "Rotate", "Scale"],
    sceneName: null,
    selectedShadingType: "Flat",
    shadingTypes: ["Flat", "Smooth"],
    alpha: 1,
    selectedMeshFromEntity: null,
    sceneInput: null,
    sceneNameInput: null,
    loadNewScene: true,
    loadAlbedo: false,
    loadNormal: false,
    loadMetallic: false,
    loadRoughness: false,
    loadAo: false,
    currentFileName: "",
    currentAlbedoName: "",
    currentNormalName: "",
    currentMetallicName: "",
    currentRoughnessName: "",
    currentAoName: "",
    lastModelLoaded: "",
    negativeSculpt: false,
    skyboxEnabled: false,
    generateIrradiance: false,
    meshExtruded: false,
    lastRadius: 0,
    generateSkybox: false,
    newModelSelected: false
};