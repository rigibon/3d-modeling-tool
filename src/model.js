import { Vertex, Halfedge, Face } from "./geometry/structures";
import { Meshs } from "./mesh";
import { Entity } from "./entity";
import { vec3, mat4, mat3, vec4, vec2 } from "gl-matrix";
import { Shader } from "./shader";
import { GeometryProcessing } from "./geometry/processing";
import { generateHalfedges } from "./geometry/halfedge";
import { data as cube } from "./models/real_cube";
import { data as a } from "./models/a";
import { data as b } from "./models/b";
import { data as box_non } from "./models/box_non";
import { data as non_ball } from "./models/non-ball";
import { data as monkey } from "./models/monkey";
import { data as glasses } from "./models/glasses";
import { data as coat } from "./models/coat";
import { Material } from "./material";
import { Skybox } from "./skybox";
import { Utils } from "./test/utils.js";
import MeshResolution from "./test/meshResolution.js";
import Mesh from "./test/mesh.js";
import Subdivision from "./test/subdivision.js";
import Reversion from "./test/reversion.js";
import OctreeCell from "./test/octree.js";
import Enums from "./test/enums.js";
import Buffer from "./test/buffer.js";
import MultiMesh from "./test/multimesh.js";
import Primitives, { createMesh } from "./test/primitives.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import axios from "axios";
import $ from "jquery";
import { loadTexture } from "./texture.js";

export class Model {
    meshes = new Array();
    vertices = new Array();
    indices = new Array();
    edges;
    faces = new Array();
    name;
    position;
    rotation = vec3.fromValues(0.0, 0.0, 0.0);
    scale = vec3.fromValues(1.0, 1.0, 1.0);
    worldMatrix = mat4.create();
    isSelected = false;
    show = true;
    modelViewMatrix = mat4.create();
    octree;
    material;
    id = 0;
    color;
    tempIndex;
    shader;
    showed = false;
    _transformData;
    _meshData;
    _id;
    _renderData;
    _isVisible;
    isAlt = false;
    triangles = 0;
    topMesh = null;
    topMeshes = [];
    isExternal = false;
    texCoordsBuffer = null;
    texCoords = [];
    albedoTexture = null;
    normalTexture = null;
    metallicTexture = null;
    roughnessTexture = null;
    aoTexture = null;
    enablePBR = false;
    IBLenabled = true;
    aoTextureSource = "";
    shadingType = "Flat";

    constructor(gl, name, position, color, mesh = null, isAlt = true, shader = null, isSphere = false) {
        this.name = name;
        this.position = position;
        this.worldMatrix = mat4.create();
        mat4.translate(this.worldMatrix, this.worldMatrix, position);
        this.color = color;

        if (!mesh) {
            mesh = Primitives.createCube(gl);
        }

        this.shadingType = "Flat";

        // if (mesh) {
        //     this.topMesh = new MultiMesh(mesh);
        //     this.topMesh.worldMatrix = this.worldMatrix;
        //     this.topMesh.normalizeSize();
            // if (isSphere) {
            //     this.subdivideClamp(this.topMesh, false, 50000);
            // }
        //     this.topMesh.init();
        //     this.topMesh.setBuffers(gl);
        // } else {
            this.topMesh = new MultiMesh(mesh);
            this.topMesh.worldMatrix = this.worldMatrix;
            this.topMesh.normalizeSize();
            if (isSphere) {
                this.subdivideClamp(this.topMesh, false, 50000);
            }
            this.topMesh.init();
            this.topMesh.setBuffers(gl);
        // }
        
        // var secondMesh = new MultiMesh(Primitives.createArrow(gl));
        // secondMesh.worldMatrix = this.worldMatrix;
        // secondMesh.normalizeSize();
        // secondMesh.init();
        // secondMesh.setBuffers(gl);

        // this.texCoords = this.topMesh._meshData._texCoordsST;
        this.topMesh.texCoordsBuffer = gl.createBuffer();

        this.isAlt = isAlt;

        this.topMesh._name = "Cube";
        this.topMesh.texCoords = this.topMesh._meshData._texCoordsST;
        // secondMesh._name = "Arrow";

        if (this.isAlt) {
            this.setupAltBuffers(gl, this.topMesh);
            // this.setupAltBuffers(gl, secondMesh);
        }

        this.topMeshes.push(this.topMesh);
        // this.topMeshes.push(secondMesh);
    }

    loadNewModel(gl, src) {
        var loader = new GLTFLoader();
        this.topMeshes = [];

        this.isExternal = true;

        this.enablePBR = true;

        loader.load(`http://localhost:5500/downloadModel/${src}`, (gltf) => {
            var materials = gltf.parser.json.materials;
            var j = 0;

            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    var geometry = child.geometry;

                    var faces = [];
                    var vertices = [];
                    var uv = [];

                    for (var i = 0; i < geometry.index.array.length; i += 3) {
                        faces.push(geometry.index.array[i + 0]);
                        faces.push(geometry.index.array[i + 1]);
                        faces.push(geometry.index.array[i + 2]);
                        faces.push(Utils.TRI_INDEX);
                    }

                    vertices = geometry.attributes.position.array;
                    uv = geometry.attributes.uv.array;

                    var newArr = {
                        vertices: vertices,
                        faces: faces,
                    };

                    var newMesh = createMesh(gl, newArr);
                    var topMesh = new MultiMesh(newMesh);
                    topMesh.texCoords = uv;
                    topMesh.texCoordsBuffer = gl.createBuffer();
                    topMesh.worldMatrix = this.worldMatrix;
                    topMesh.normalizeSize();
                    topMesh.init();
                    topMesh.setBuffers(gl);
                    topMesh._name = child.name
                    // if (materials[j]) {
                    //     topMesh._name = materials[j].name;
                    // } else {
                    //     topMesh._name = "Mesh" + j;
                    // }
                    
                    j++;

                    this.setupAltBuffers(gl, topMesh);

                    this.topMeshes.push(topMesh);
                }
            });

            const parser = gltf.parser;
            const bufferPromises = parser.json.images.map((imageDef) => {
                return parser.getDependency('bufferView', imageDef.bufferView);
            });

            var texturesURLs = [];

            Promise.all(bufferPromises).then((buffers) => {
                // for (var i = 0, j = 0; i < buffers.length; i++) {
                //     if (materials[])
                // }

                for (var i = 0; i < buffers.length; i++) {
                    var arrayBufferView = new Uint8Array(buffers[i]);
                    var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
                    var urlCreator = window.URL || window.webkitURL;
                    var imageUrl = urlCreator.createObjectURL( blob );
                    texturesURLs.push(imageUrl);
                    // this.topMeshes[0].albedoTexture = loadTexture(gl, imageUrl);
                }

                var meshes = gltf.parser.json.meshes;

                for (var j = 0; j < this.topMeshes.length; j++) {
                    var topMesh = this.topMeshes[j];
                    var materialIndex = meshes[j].primitives[0].material;
                    var material = materials[materialIndex];

                    // if (materials.length > 1) {
                    //     material = materials[j];
                    // } else {
                    //     material = materials[0];
                    // }

                    if (material.normalTexture) {
                        topMesh.normalTexture = loadTexture(gl, texturesURLs[material.normalTexture.index]);
                    }

                    if (material.pbrMetallicRoughness.baseColorTexture) {
                        topMesh.albedoTexture = loadTexture(gl, texturesURLs[material.pbrMetallicRoughness.baseColorTexture.index]);
                    } else {
                        topMesh.baseColorFactor = material.pbrMetallicRoughness.baseColorFactor;
                    }

                    if (material.pbrMetallicRoughness.metallicRoughnessTexture) {
                        topMesh.metallicTexture = loadTexture(gl, texturesURLs[material.pbrMetallicRoughness.metallicRoughnessTexture.index]);
                    } else {
                        topMesh.metallicFactor = material.pbrMetallicRoughness.metallicFactor;
                        topMesh.roughnessFactor = material.pbrMetallicRoughness.roughnessFactor;
                    }

                    if (material.occlusionTexture) {
                        topMesh.aoTexture = loadTexture(gl, texturesURLs[material.occlusionTexture.index]);
                    } else if (material.pbrMetallicRoughness.metallicRoughnessTexture) {
                        topMesh.aoTexture = loadTexture(gl, texturesURLs[material.pbrMetallicRoughness.metallicRoughnessTexture.index]);
                    } else {
                        if (topMesh.metallicFactor !== 0) {
                            topMesh.aoFactor = material.pbrMetallicRoughness.metallicFactor;
                        } else {
                            topMesh.aoFactor = material.pbrMetallicRoughness.roughnessFactor;
                        }
                    }
                }

                // var arrayBufferView = new Uint8Array(buffers[0]);
                // var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
                // var urlCreator = window.URL || window.webkitURL;
                // var imageUrl = urlCreator.createObjectURL( blob );
                // this.topMeshes[0].albedoTexture = loadTexture(gl, imageUrl);

                // var arrayBufferView = new Uint8Array(buffers[1]);
                // var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
                // var urlCreator = window.URL || window.webkitURL;
                // var imageUrl = urlCreator.createObjectURL( blob );
                // this.metallicTexture = loadTexture(gl, imageUrl);

                // var arrayBufferView = new Uint8Array(buffers[2]);
                // var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
                // var urlCreator = window.URL || window.webkitURL;
                // var imageUrl = urlCreator.createObjectURL( blob );
                // this.normalTexture = loadTexture(gl, imageUrl);
            });
        });
    }

    loadGlasses(gl) {
        var loader = new GLTFLoader();
        this.topMeshes = [];

        this.isExternal = true;

        this.enablePBR = true;

        loader.load(`http://localhost:3000/uploads/medieval_house_low_poly_for_gamedev.glb`, (gltf) => {
            var materials = gltf.parser.json.materials;
            var j = 0;

            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    var geometry = child.geometry;

                    var faces = [];
                    var vertices = [];
                    var uv = [];

                    for (var i = 0; i < geometry.index.array.length; i += 3) {
                        faces.push(geometry.index.array[i + 0]);
                        faces.push(geometry.index.array[i + 1]);
                        faces.push(geometry.index.array[i + 2]);
                        faces.push(Utils.TRI_INDEX);
                    }

                    vertices = geometry.attributes.position.array;
                    uv = geometry.attributes.uv.array;

                    var newArr = {
                        vertices: vertices,
                        faces: faces,
                    };

                    // console.log("ACA ------------");
                    // console.log(uv);

                    var newMesh = createMesh(gl, newArr);
                    var topMesh = new MultiMesh(newMesh);
                    topMesh.texCoords = uv;
                    topMesh.texCoordsBuffer = gl.createBuffer();
                    // console.log(uv);
                    topMesh.worldMatrix = this.worldMatrix;
                    topMesh.normalizeSize();
                    topMesh.init();
                    topMesh.setBuffers(gl);
                    topMesh._name = child.name;
                    // if (materials[j]) {
                    //     topMesh._name = materials[j].name;
                    //     j++;
                    // }

                    this.setupAltBuffers(gl, topMesh);

                    this.topMeshes.push(topMesh);
                }
            });

            const parser = gltf.parser;
            const bufferPromises = parser.json.images.map((imageDef) => {
                return parser.getDependency('bufferView', imageDef.bufferView);
            });

            var texturesURLs = [];

            Promise.all(bufferPromises).then((buffers) => {
                // for (var i = 0, j = 0; i < buffers.length; i++) {
                //     if (materials[])
                // }

                for (var i = 0; i < buffers.length; i++) {
                    var arrayBufferView = new Uint8Array(buffers[i]);
                    var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
                    var urlCreator = window.URL || window.webkitURL;
                    var imageUrl = urlCreator.createObjectURL( blob );
                    texturesURLs.push(imageUrl);
                    // this.topMeshes[0].albedoTexture = loadTexture(gl, imageUrl);
                }

                for (var j = 0; j < this.topMeshes.length; j++) {
                    var topMesh = this.topMeshes[j];
                    var material;

                    if (materials.length > 1) {
                        material = materials[j];
                    } else {
                        material = materials[0];
                    }

                    if (material.normalTexture) {
                        topMesh.normalTexture = loadTexture(gl, texturesURLs[material.normalTexture.index]);
                    }

                    if (material.pbrMetallicRoughness.baseColorTexture) {
                        topMesh.albedoTexture = loadTexture(gl, texturesURLs[material.pbrMetallicRoughness.baseColorTexture.index]);
                    }

                    if (material.pbrMetallicRoughness.metallicRoughnessTexture) {
                        topMesh.metallicTexture = loadTexture(gl, texturesURLs[material.pbrMetallicRoughness.metallicRoughnessTexture.index]);
                    }

                    if (material.occlusionTexture) {
                        topMesh.aoTexture = loadTexture(gl, texturesURLs[material.occlusionTexture.index]);
                    } else if (material.pbrMetallicRoughness.metallicRoughnessTexture) {
                        topMesh.aoTexture = loadTexture(gl, texturesURLs[material.pbrMetallicRoughness.metallicRoughnessTexture.index]);
                    }
                }

                // var arrayBufferView = new Uint8Array(buffers[0]);
                // var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
                // var urlCreator = window.URL || window.webkitURL;
                // var imageUrl = urlCreator.createObjectURL( blob );
                // this.topMeshes[0].albedoTexture = loadTexture(gl, imageUrl);

                // var arrayBufferView = new Uint8Array(buffers[1]);
                // var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
                // var urlCreator = window.URL || window.webkitURL;
                // var imageUrl = urlCreator.createObjectURL( blob );
                // this.metallicTexture = loadTexture(gl, imageUrl);

                // var arrayBufferView = new Uint8Array(buffers[2]);
                // var blob = new Blob( [ arrayBufferView ], { type: "image/png" } );
                // var urlCreator = window.URL || window.webkitURL;
                // var imageUrl = urlCreator.createObjectURL( blob );
                // this.normalTexture = loadTexture(gl, imageUrl);
            });
        });
    }

    drawMesh(gl, mesh, usingPBR, properties, shader, skybox, isOutline = false) {
        if (!isOutline) {
            if (this.enablePBR) {
                shader.setInt("usingPBR", 1);
                usingPBR = true;
            } else {
                shader.setInt("usingPBR", 0);
                usingPBR = false;
            }
        }

        if (this.shadingType === "Flat") {
            shader.setInt("flatShading", 1);
        } else {
            shader.setInt("flatShading", 0);
        }

        if (usingPBR && !isOutline) {
            if (properties.loadAlbedo) {
                $.get("http://localhost:3000/uploads/" + properties.currentAlbedoName)
                .done(() => {
                    setTimeout(() => {
                        if (properties.loadAlbedo) {
                            this.albedoTexture = loadTexture(gl, "http://localhost:3000/uploads/" + properties.currentAlbedoName);
                            properties.loadAlbedo = false;
                        }
                    }, 2000);
                    
                }).fail(() => {

                });
            }

            if (properties.loadNormal) {
                $.get("http://localhost:3000/uploads/" + properties.currentNormalName)
                .done(() => {
                    setTimeout(() => {
                        if (properties.loadNormal) {
                            this.normalTexture = loadTexture(gl, "http://localhost:3000/uploads/" + properties.currentNormalName);
                            properties.loadNormal = false;
                        }
                    }, 2000)
                    
                }).fail(() => {

                });
            } 

            if (properties.loadMetallic) {
                $.get("http://localhost:3000/uploads/" + properties.currentMetallicName)
                .done(() => {
                    setTimeout(() => {
                        if (properties.loadMetallic) {
                            this.metallicTexture = loadTexture(gl, "http://localhost:3000/uploads/" + properties.currentMetallicName);
                            properties.loadMetallic = false;
                        }
                    }, 2000)
                    
                }).fail(() => {

                });
            }

            if (properties.loadRoughness) {
                $.get("http://localhost:3000/uploads/" + properties.currentRoughnessName)
                .done(() => {
                    setTimeout(() => {
                        if (properties.loadRoughness) {
                            this.roughnessTexture = loadTexture(gl, "http://localhost:3000/uploads/" + properties.currentRoughnessName);
                            properties.loadRoughness = false;
                        }
                    }, 2000)
                }).fail(() => {

                });
            }

            if (properties.loadAo) {
                this.aoTextureSource = "http://localhost:3000/uploads/" + properties.currentAoName;
                $.get("http://localhost:3000/uploads/" + properties.currentAoName)
                .done(() => {
                    setTimeout(() => {
                        if (properties.loadAo) {
                            this.aoTexture = loadTexture(gl, "http://localhost:3000/uploads/" + properties.currentAoName);
                            properties.loadAo = false;
                        }
                    }, 2000)
                }).fail(() => {

                });
            }

            shader.use();

            if (mesh.albedoTexture) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, mesh.albedoTexture);
                shader.setInt("usingBaseColorFactor", 0);
            } else if (mesh.baseColorFactor){
                shader.setVec3("baseColorFactor", mesh.baseColorFactor[0], mesh.baseColorFactor[1], mesh.baseColorFactor[2]);
                shader.setInt("usingBaseColorFactor", 1);
            } else {
                shader.setInt("usingBaseColorFactor", 0);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
            
            if (mesh.normalTexture) {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, mesh.normalTexture);
            } else {
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            if (mesh.metallicTexture) {
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, mesh.metallicTexture);
                shader.setInt("usingMetallicFactor", 0);
            } else if (mesh.metallicFactor) {
                shader.setFloat("metallicFactor", mesh.metallicFactor)
                shader.setInt("usingMetallicFactor", 1);
            } else {
                shader.setInt("usingMetallicFactor", 0);
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            if (mesh.roughnessTexture) {
                gl.activeTexture(gl.TEXTURE3);
                gl.bindTexture(gl.TEXTURE_2D, mesh.roughnessTexture);
                shader.setInt("usingRoughnessFactor", 0);
            } else if (mesh.roughnessFactor) {
                shader.setFloat("roughnessFactor", mesh.roughnessFactor);
                shader.setInt("usingRoughnessFactor", 1);
            } else {
                shader.setInt("usingRoughnessFactor", 0);
                gl.activeTexture(gl.TEXTURE3);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            if (mesh.aoTexture) {
                gl.activeTexture(gl.TEXTURE4);
                gl.bindTexture(gl.TEXTURE_2D, mesh.aoTexture);
                shader.setInt("usingAoFactor", 0);
                
            } else if (mesh.aoFactor) {
                shader.setFloat("aoFactor", mesh.aoFactor);
                shader.setInt("usingAoFactor", 1);
            } else {
                shader.setInt("usingAoFactor", 0);
                gl.activeTexture(gl.TEXTURE4);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }
        }

        if (this.IBLenabled && skybox && skybox.shader) {
            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(
                gl.TEXTURE_CUBE_MAP,
                skybox.irradianceMap
            );

            gl.activeTexture(gl.TEXTURE6);
            gl.bindTexture(
                gl.TEXTURE_CUBE_MAP,
                skybox.prefilterMap
            );

            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_2D, skybox.brdfLUTTexture);
        } else {
            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(
                gl.TEXTURE_CUBE_MAP,
                null
            );

            gl.activeTexture(gl.TEXTURE6);
            gl.bindTexture(
                gl.TEXTURE_CUBE_MAP,
                null
            );

            gl.activeTexture(gl.TEXTURE7);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        var topMesh = mesh;

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            topMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, topMesh.getVertexBuffer()._buffer);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(1);
        gl.bindBuffer(gl.ARRAY_BUFFER, topMesh.getNormalBuffer()._buffer);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(2);
        gl.bindBuffer(gl.ARRAY_BUFFER, topMesh.texCoordsBuffer);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

        gl.drawElements(
            gl.TRIANGLES,
            topMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );
    }

    drawSculptMesh(gl, mesh, shader) {
        var topMesh = mesh;

        shader.use();

        shader.setInt("usingPBR", 0);

        if (this.shadingType === "Flat") {
            shader.setInt("flatShading", 1);
        } else {
            shader.setInt("flatShading", 0);
        }

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            topMesh.getIndexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, topMesh.getVertexBuffer()._buffer);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(1);
        gl.bindBuffer(gl.ARRAY_BUFFER, topMesh.getNormalBuffer()._buffer);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        // gl.enableVertexAttribArray(2);
        // gl.bindBuffer(gl.ARRAY_BUFFER, topMesh.texCoordsBuffer);
        // gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

        gl.drawElements(
            gl.TRIANGLES,
            topMesh.getTriangles().length,
            gl.UNSIGNED_INT,
            0
        );
    }

    drawMeshes(gl, usingPBR, properties, shader, skybox, isOutline = false) {
        // if (usingPBR) {
        //     if (properties.loadAlbedo) {
        //         $.get("http://localhost:3000/DefaultMaterial_albedo.jpg")
        //         .done(() => { 
        //                 this.albedoTexture = loadTexture(gl, "http://localhost:3000/DefaultMaterial_albedo.jpg");
        //                 properties.loadAlbedo = false;
        //         }).fail(function() { 
        //         });    
        //     }

        //     shader.use();

        //     gl.activeTexture(gl.TEXTURE0);
        //     gl.bindTexture(gl.TEXTURE_2D, this.albedoTexture);
        // }
        
        // shader.use();

        // shader.setInt("usingPBR", 0);

        // shader.use();

        if (!isOutline) {
            if (this.enablePBR) {
                shader.setInt("usingPBR", 1);
                usingPBR = true;
            } else {
                shader.setInt("usingPBR", 0);
                usingPBR = false;
            }
        }

        if (this.shadingType === "Flat") {
            shader.setInt("flatShading", 1);
        } else {
            shader.setInt("flatShading", 0);
        }

        for (var i = 0; i < this.topMeshes.length; i++) {
            if (this.enablePBR && !isOutline) {
                shader.use();

                if (this.topMeshes[i].albedoTexture) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, this.topMeshes[i].albedoTexture);
                    shader.setInt("usingBaseColorFactor", 0);
                } else if (this.topMeshes[i].baseColorFactor){
                    shader.setVec3("baseColorFactor", this.topMeshes[i].baseColorFactor[0], this.topMeshes[i].baseColorFactor[1], this.topMeshes[i].baseColorFactor[2]);
                    shader.setInt("usingBaseColorFactor", 1);
                } else {
                    shader.setInt("usingBaseColorFactor", 0);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
                
                if (this.topMeshes[i].normalTexture) {
                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, this.topMeshes[i].normalTexture);
                } else {
                    gl.activeTexture(gl.TEXTURE1);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }

                if (this.topMeshes[i].metallicTexture) {
                    gl.activeTexture(gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, this.topMeshes[i].metallicTexture);
                    shader.setInt("usingMetallicFactor", 0);
                } else if (this.topMeshes[i].metallicFactor) {
                    shader.setFloat("metallicFactor", this.topMeshes[i].metallicFactor)
                    shader.setInt("usingMetallicFactor", 1);
                } else {
                    shader.setInt("usingMetallicFactor", 0);
                    gl.activeTexture(gl.TEXTURE2);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }

                if (this.topMeshes[i].roughnessTexture) {
                    gl.activeTexture(gl.TEXTURE3);
                    gl.bindTexture(gl.TEXTURE_2D, this.topMeshes[i].roughnessTexture);
                    shader.setInt("usingRoughnessFactor", 0);
                } else if (this.topMeshes[i].roughnessFactor) {
                    shader.setFloat("roughnessFactor", this.topMeshes[i].roughnessFactor);
                    shader.setInt("usingRoughnessFactor", 1);
                } else {
                    shader.setInt("usingRoughnessFactor", 0);
                    gl.activeTexture(gl.TEXTURE3);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }

                if (this.topMeshes[i].aoTexture) {
                    gl.activeTexture(gl.TEXTURE4);
                    gl.bindTexture(gl.TEXTURE_2D, this.topMeshes[i].aoTexture);
                    shader.setInt("usingAoFactor", 0);
                    
                } else if (this.topMeshes[i].aoFactor) {
                    shader.setFloat("aoFactor", this.topMeshes[i].aoFactor);
                    shader.setInt("usingAoFactor", 1);
                } else {
                    shader.setInt("usingAoFactor", 0);
                    gl.activeTexture(gl.TEXTURE4);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }   
            }

            if (this.IBLenabled && skybox && skybox.shader) {
                gl.activeTexture(gl.TEXTURE5);
                gl.bindTexture(
                    gl.TEXTURE_CUBE_MAP,
                    skybox.irradianceMap
                );
    
                gl.activeTexture(gl.TEXTURE6);
                gl.bindTexture(
                    gl.TEXTURE_CUBE_MAP,
                    skybox.prefilterMap
                );
    
                gl.activeTexture(gl.TEXTURE7);
                gl.bindTexture(gl.TEXTURE_2D, skybox.brdfLUTTexture);
            }

            if (this.topMeshes[i]) {
                var topMesh = this.topMeshes[i];

                gl.bindBuffer(
                    gl.ELEMENT_ARRAY_BUFFER,
                    topMesh.getIndexBuffer()._buffer
                );

                gl.enableVertexAttribArray(0);
                gl.bindBuffer(
                    gl.ARRAY_BUFFER,
                    topMesh.getVertexBuffer()._buffer
                );
                gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

                gl.enableVertexAttribArray(1);
                gl.bindBuffer(
                    gl.ARRAY_BUFFER,
                    topMesh.getNormalBuffer()._buffer
                );
                gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

                if (topMesh.texCoords) {
                    gl.enableVertexAttribArray(2);
                    gl.bindBuffer(gl.ARRAY_BUFFER, topMesh.texCoordsBuffer);
                    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
    
                    gl.enableVertexAttribArray(2);
                }
    
                gl.drawElements(
                    gl.TRIANGLES,
                    topMesh.getTriangles().length,
                    gl.UNSIGNED_INT,
                    0
                );
            }
        }
    }

    drawPoints(gl, mesh) {
        var topMesh = mesh;

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            topMesh.getVertexBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, topMesh.getVertexBuffer()._buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(topMesh.getVertices()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // gl.clear(gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(
            gl.POINTS,
            0,
            topMesh.getVertices().length / 3
        );
    }

    drawWireframe(gl, mesh) {
        var topMesh = mesh;

        gl.bindBuffer(
            gl.ELEMENT_ARRAY_BUFFER,
            topMesh.getWireframeBuffer()._buffer
        );

        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, topMesh.getVertexBuffer()._buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(topMesh.getVertices()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.drawElements(
            gl.LINES,
            topMesh.getRenderNbEdges() * 2,
            gl.UNSIGNED_INT,
            0
        );
    }

    getMeshWireframe(mesh) {
        var nbEdges = mesh.getNbEdges();
        var cdw;
        if (
            mesh._meshData._drawElementsWireframe &&
            mesh._meshData._drawElementsWireframe.length === nbEdges * 2
        ) {
            return mesh._meshData._drawElementsWireframe;
        }
        cdw = mesh._meshData._drawElementsWireframe = new Uint32Array(
            nbEdges * 2
        );

        var fAr = mesh.getFaces();
        var feAr = mesh.getFaceEdges();
        var nbFaces = mesh.getNbFaces();

        var nbLines = 0;
        var tagEdges = new Uint8Array(nbEdges);

        for (var i = 0; i < nbFaces; ++i) {
            var id = i * 4;

            var iv1, iv2, iv3;
            var iv4 = fAr[id + 3];
            var isQuad = iv4 !== Utils.TRI_INDEX;

            iv1 = fAr[id];
            iv2 = fAr[id + 1];
            iv3 = fAr[id + 2];

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
        return mesh._meshData._drawElementsWireframe;
    }

    getWireframe() {
        var nbEdges = this.topMesh.getNbEdges();
        var cdw;
        if (
            this._meshData._drawElementsWireframe &&
            this._meshData._drawElementsWireframe.length === nbEdges * 2
        ) {
            return this._meshData._drawElementsWireframe;
        }
        cdw = this._meshData._drawElementsWireframe = new Uint32Array(
            nbEdges * 2
        );

        var fAr = this.topMesh.getFaces();
        var feAr = this.topMesh.getFaceEdges();
        var nbFaces = this.topMesh.getNbFaces();

        var nbLines = 0;
        var tagEdges = new Uint8Array(nbEdges);

        for (var i = 0; i < nbFaces; ++i) {
            var id = i * 4;

            var iv1, iv2, iv3;
            var iv4 = fAr[id + 3];
            var isQuad = iv4 !== Utils.TRI_INDEX;

            iv1 = fAr[id];
            iv2 = fAr[id + 1];
            iv3 = fAr[id + 2];

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
        return this._meshData._drawElementsWireframe;
    }

    render(
        gl,
        shader,
        altShader,
        outlineShader,
        wireframeShader,
        viewMatrix,
        projectionMatrix,
        skybox = null,
        properties = null
    ) {
        this.drawMeshes(gl);
        // console.log("A");
    }

    setupAltBuffers(gl, mesh = null, subdivide = false) {
        if (!mesh) {
            gl.bindBuffer(
                gl.ELEMENT_ARRAY_BUFFER,
                this.topMesh.getWireframeBuffer()._buffer
            );
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint32Array(this.getWireframe()),
                gl.STATIC_DRAW
            );

            gl.bindBuffer(
                gl.ELEMENT_ARRAY_BUFFER,
                this.topMesh.getIndexBuffer()._buffer
            );
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint32Array(this.topMesh.getTriangles()),
                gl.STATIC_DRAW
            );
            gl.bindBuffer(
                gl.ELEMENT_ARRAY_BUFFER,
                this.topMesh.getIndexBuffer()._buffer
            );

            gl.enableVertexAttribArray(0);
            gl.bindBuffer(
                gl.ARRAY_BUFFER,
                this.topMesh.getVertexBuffer()._buffer
            );
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(this.topMesh.getVertices()),
                gl.DYNAMIC_DRAW
            );
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(0);

            gl.enableVertexAttribArray(1);
            gl.bindBuffer(
                gl.ARRAY_BUFFER,
                this.topMesh.getNormalBuffer()._buffer
            );
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(this.topMesh.getNormals()),
                gl.DYNAMIC_DRAW
            );
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(1);

            gl.enableVertexAttribArray(2);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(this.texCoords),
                gl.DYNAMIC_DRAW
            );
            gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(2);
        } else {
            gl.bindBuffer(
                gl.ELEMENT_ARRAY_BUFFER,
                mesh.getWireframeBuffer()._buffer
            );
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint32Array(this.getMeshWireframe(mesh)),
                gl.STATIC_DRAW
            );

            gl.bindBuffer(
                gl.ELEMENT_ARRAY_BUFFER,
                mesh.getIndexBuffer()._buffer
            );
            gl.bufferData(
                gl.ELEMENT_ARRAY_BUFFER,
                new Uint32Array(mesh.getTriangles()),
                gl.STATIC_DRAW
            );
            gl.bindBuffer(
                gl.ELEMENT_ARRAY_BUFFER,
                mesh.getIndexBuffer()._buffer
            );

            gl.enableVertexAttribArray(0);
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getVertexBuffer()._buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(mesh.getVertices()),
                gl.DYNAMIC_DRAW
            );
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(0);

            gl.enableVertexAttribArray(1);
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.getNormalBuffer()._buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(mesh.getNormals()),
                gl.DYNAMIC_DRAW
            );
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);


            if (!subdivide && mesh.texCoords) {
                gl.enableVertexAttribArray(2);

                gl.enableVertexAttribArray(2);
                gl.bindBuffer(gl.ARRAY_BUFFER, mesh.texCoordsBuffer);
                gl.bufferData(
                    gl.ARRAY_BUFFER,
                    new Float32Array(mesh.texCoords),
                    gl.DYNAMIC_DRAW
                );
                gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
    
                gl.enableVertexAttribArray(2);
            }
        }
    }

    setNormalMatrix(viewMatrix, shader) {
        var inverseViewMatrix = mat4.create();

        mat4.invert(inverseViewMatrix, viewMatrix);
        mat4.multiply(
            this.modelViewMatrix,
            this.worldMatrix,
            inverseViewMatrix
        );
        mat4.transpose(this.modelViewMatrix, this.modelViewMatrix);
        mat4.invert(this.modelViewMatrix, this.modelViewMatrix);

        shader.setMat4("normalMatrix", this.modelViewMatrix);
    }

    updateTopology(gl, topEditor, shader, newMesh) {
        shader.use();

        this.topMesh._meshData = newMesh._meshData;

        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, newMesh.getIndexBuffer()._buffer);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(newMesh.getTriangles()), gl.STATIC_DRAW);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, newMesh.getIndexBuffer()._buffer);

        // gl.enableVertexAttribArray(0);
        // gl.bindBuffer(gl.ARRAY_BUFFER, newMesh.getVertexBuffer()._buffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newMesh.getVertices()), gl.DYNAMIC_DRAW);
        // gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // gl.enableVertexAttribArray(1);
        // gl.bindBuffer(gl.ARRAY_BUFFER, newMesh.getNormalBuffer()._buffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newMesh.getNormals()), gl.DYNAMIC_DRAW);
        // gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        // topEditor._topologyPick.RestartPicking();
    }

    renderAlt(
        gl,
        shader,
        outlineShader,
        viewMatrix,
        projectionMatrix,
        skybox,
        properties
    ) {
        for (var i = 0; i < this.meshes.length; i++) {
            if (this.show) {
                shader.use();
                shader.setMat4("worldMatrix", mat4.create());
                shader.setMat4("viewMatrix", viewMatrix);
                shader.setMat4("projectionMatrix", projectionMatrix);

                this.meshes[i].draw(gl, shader, outlineShader, false);
            }
        }
    }

    loadMultipleMeshes(gl, data) {
        for (var i = 0; i < data.meshes.length; i++) {
            var mesh = data.meshes[i];
            var mesh_faces = mesh.faces;
            var mesh_vertices = [];
            var mesh_indices = [];
            var name = mesh.name;
            mesh_indices = mesh_indices.concat([].concat.apply([], mesh_faces));

            var offset = 0;

            if (i > 0) {
                var prev_mesh_faces = data.meshes[i - 1].faces;

                var prev_mesh_indices = [];
                prev_mesh_indices = prev_mesh_indices.concat(
                    [].concat.apply([], prev_mesh_faces)
                );
                var prev_indices_count = prev_mesh_indices.length;
                offset = prev_mesh_indices[prev_indices_count - 1] + 1;
            }

            // vertices
            for (
                var j = 0, k = 0, n = 0;
                j < mesh.vertices.length;
                j += 3, k += 2, n++
            ) {
                // var position = vec3.fromValues(mesh.vertices[j], mesh.vertices[j + 1], mesh.vertices[j + 2]);
                var position = [
                    mesh.vertices[j],
                    mesh.vertices[j + 1],
                    mesh.vertices[j + 2],
                ];
                var normal = vec3.fromValues(
                    mesh.normals[j],
                    mesh.normals[j + 1],
                    mesh.normals[j + 2]
                );
                var texcoord = vec2.fromValues(
                    mesh.texturecoords[0][k],
                    mesh.texturecoords[0][k + 1]
                );

                var vertex = new Vertex(position, normal, texcoord);
                // vertex.position = position;
                // vertex.normal = normal;
                // vertex.texcoord = texcoord;
                vertex.index = j + offset;
                vertex.mesh_index = i;
                vertex.offset = offset;
                vertex.pos = vec4.fromValues(
                    position[0],
                    position[1],
                    position[2],
                    n
                );

                mesh_vertices.push(vertex);
            }

            // transform matrix

            // var transform_array = [];

            // for (const item in this.data.rootnode.children) {
            //     if (this.data.rootnode.children[item].meshes == i) {
            //         transform_array = this.data.rootnode.children[item].transformation;
            //     }
            // }

            // create mesh
            var meshd = new Mesh(name, mesh_vertices, mesh_indices, mesh_faces);

            meshd.setupMesh(gl);

            this.vertices = this.vertices.concat(mesh_vertices);
            this.indices = this.indices.concat(mesh_indices);
            this.faces = this.faces.concat(mesh_faces);
            this.meshes.push(meshd);
        }

        // ESTO NO ME ACUERDO PARA QUE ERA PERO SCULPT FUNCIONA SI LO COMENTO
        // for (var i = 0; i < this.meshes.length; i++) {
        //     this.meshes[i].transformVertices();
        // }
    }

    load(gl, modelID, data = null) {
        var modelData;

        if (data) {
            modelData = data;
        } else {
            switch (modelID) {
                case 0:
                    modelData = cube;
                    break;
                case 1:
                    modelData = a;
                    break;
                case 2:
                    modelData = b;
                    break;
                case 3:
                    modelData = box_non;
                    break;
                case 4:
                    modelData = non_ball;
                    break;
                case 5:
                    modelData = monkey;
                    break;
                case 6:
                    modelData = glasses;
                    break;
                case 7:
                    modelData = coat;
                    break;
                default:
                    return;
            }
        }

        for (var i = 0; i < modelData.meshes.length; i++) {
            var dataMesh = modelData.meshes[i];
            var dataFaces = dataMesh.faces;
            var vertices = new Array();
            var indices = new Array();
            var name = dataMesh.name;

            indices = indices.concat([].concat.apply([], dataFaces));

            var offset = 0;

            if (i > 0) {
                var prev_mesh_faces = modelData.meshes[i - 1].faces;

                var prev_mesh_indices = [];
                prev_mesh_indices = prev_mesh_indices.concat(
                    [].concat.apply([], prev_mesh_faces)
                );
                var prev_indices_count = prev_mesh_indices.length;
                offset = prev_mesh_indices[prev_indices_count - 1] + 1;
            }

            for (
                var j = 0, k = 0, n = 0;
                j < dataMesh.vertices.length;
                j += 3, k++, n += 2
            ) {
                var position = vec3.fromValues(
                    dataMesh.vertices[j],
                    dataMesh.vertices[j + 1],
                    dataMesh.vertices[j + 2]
                );

                var normal = vec3.fromValues(
                    dataMesh.normals[j],
                    dataMesh.normals[j + 1],
                    dataMesh.normals[j + 2]
                );

                var texCoords = vec2.fromValues(
                    dataMesh.texturecoords[0][n],
                    dataMesh.texturecoords[0][n + 1]
                );

                var vertex = new Vertex(
                    [position[0], position[1], position[2]],
                    normal,
                    texCoords
                );

                vertex.mesh_index = i;
                vertex.offset = offset;
                vertex.index = j + offset;
                vertex.pos = vec4.fromValues(
                    position[0],
                    position[1],
                    position[2],
                    k
                );

                vertices.push(vertex);
            }

            var mesh = new Meshs(name, vertices, indices);

            mesh.setupMesh(gl);

            this.vertices = this.vertices.concat(vertices);
            this.indices = this.indices.concat(indices);
            this.faces = this.faces.concat(dataFaces);
            this.meshes.push(mesh);
        }

        // CREATE OCTREE
        // var geomProc: GeometryProcessing = new GeometryProcessing(null);
        // this.octree = geomProc.generateOctree(this.vertices);

        // CREATE HALF EDGES
        // this.edges = generateHalfedges(this.vertices, this.indices, this.faces);
    }

    // loadFromObj(gl: any, modelData: any) {
    //     var dataFaces: any = modelData.geometries[0].data.faces;
    //     var vertices: Vertex[] = new Array();
    //     var indices: number[] = new Array();
    //     var name: any = modelData.geometries[0].object ? modelData.geometries[0].object : "newModel";

    //     if (modelData.geometries[0].data.colors) {
    //         // console.log("Model has colors.");
    //     }

    //     indices = indices.concat([].concat.apply([], dataFaces));

    //     var offset = 0;

    //     for (var i = 0; i < modelData.geometries.length; i++) {
    //         for (var j = 0, k = 0; j < modelData.geometries[i].data.vertices.length; j += 3, k++) {
    //             var data = modelData.geometries[i].data;

    //             var position: vec3 = vec3.fromValues(data.vertices[j], data.vertices[j + 1], data.vertices[j + 2]);

    //             var normal: vec3 = vec3.fromValues(data.normals[j], data.normals[j + 1], data.normals[j + 2]);

    //             var vertex: Vertex = new Vertex(position, normal, null);

    //             vertex.mesh_index = 0;
    //             vertex.offset = offset;
    //             vertex.index = j + offset;
    //             vertex.pos = vec4.fromValues(position[0], position[1], position[2], k);

    //             vertices.push(vertex);
    //         }

    //     }

    //     var mesh: Mesh = new Mesh(name, vertices, indices);

    //     mesh.setupMesh(gl);

    //     this.vertices = this.vertices.concat(vertices);
    //     this.indices = this.indices.concat(indices);
    //     this.faces = this.faces.concat(dataFaces);

    //     this.meshes.push(mesh);

    //     // CREATE OCTREE
    //     var geomProc: GeometryProcessing = new GeometryProcessing(null);
    //     this.octree = geomProc.generateOctree(this.vertices);

    //     // // CREATE HALF EDGES
    //     // this.edges = generateHalfedges(this.vertices, this.indices, this.faces);
    // }

    subdivideClamp(mesh, linear, steps) {
        Subdivision.LINEAR = !!linear;
        // mesh.addLevel();
        while (mesh.getNbFaces() < steps) mesh.addLevel();
        // keep at max 4 multires
        mesh._meshes.splice(0, Math.min(mesh._meshes.length - 4, 4));
        mesh._sel = mesh._meshes.length - 1;
        Subdivision.LINEAR = false;
    }

    getPositionBuffer() {
        var vertices = new Array();

        for (var i = 0; i < this.vertices.length; i++) {
            vertices.push(this.vertices[i].position[0]);
            vertices.push(this.vertices[i].position[1]);
            vertices.push(this.vertices[i].position[2]);
        }

        return vertices;
    }

    getNormalBuffer() {
        var normals = new Array();

        for (var i = 0; i < this.vertices.length / 2; i++) {
            normals.push(this.vertices[i].normal[0]);
            normals.push(this.vertices[i].normal[1]);
            normals.push(this.vertices[i].normal[2]);
        }

        return normals;
    }

    getActiveUniforms() {
        return this.shader.getActiveUniforms();
    }

    setForGenerateHalfEdge(data) {
        var meshes = data.meshes;

        if (meshes[1]) {
            var offset = 0;
            for (var i = 1; i < meshes.length; i++) {
                var mesh_faces = meshes[i - 1].faces;

                var mesh_indices = [];
                mesh_indices = mesh_indices.concat(
                    [].concat.apply([], mesh_faces)
                );

                var prev_indices_count = mesh_indices.length;
                offset = mesh_indices[prev_indices_count - 1] + 1;

                for (
                    var j = 0, q = 0;
                    j < meshes[i].faces.length;
                    j++, q += 3
                ) {
                    var face = meshes[i].faces[j];

                    for (var k = 0; k < 3; k++) {
                        face[k] += offset;
                    }
                }
            }
        }
    }

    setForDraw(gl) {
        if (this.meshes[1]) {
            var offset = 0;
            for (var i = 1; i < this.meshes.length; i++) {
                var mesh_faces = this.meshes[i - 1].faces;

                var mesh_indices = [];
                mesh_indices = mesh_indices.concat(
                    [].concat.apply([], mesh_faces)
                );

                var prev_indices_count = mesh_indices.length;
                offset = mesh_indices[prev_indices_count - 1] + 1;

                // console.log(offset);

                for (var j = 0; j < this.meshes[i].indices.length; j++) {
                    this.meshes[i].indices[j] -= offset;
                }

                gl.bindBuffer(
                    gl.ELEMENT_ARRAY_BUFFER,
                    this.meshes[i].indexBuffer
                );
                gl.bufferData(
                    gl.ELEMENT_ARRAY_BUFFER,
                    new Uint32Array(this.meshes[i].indices),
                    gl.DYNAMIC_DRAW
                );
            }
        }
    }

    setBuffers(gl) {
        this._useDrawArrays = false;
        this._vertexBuffer = new Buffer(gl, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
        this._normalBuffer = new Buffer(gl, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
        this._colorBuffer = new Buffer(gl, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
        this._materialBuffer = new Buffer(gl, gl.ARRAY_BUFFER, gl.DYNAMIC_DRAW);
        this._s = new Buffer(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        this._indexBuffer = new Buffer(
            gl,
            gl.ELEMENT_ARRAY_BUFFER,
            gl.STATIC_DRAW
        );
        this._wireframeBuffer = new Buffer(
            gl,
            gl.ELEMENT_ARRAY_BUFFER,
            gl.STATIC_DRAW
        );

        var index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.getIndexBuffer()._buffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint32Array(this.getTriangles()),
            gl.STATIC_DRAW
        );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

        gl.enableVertexAttribArray(0);
        var position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.getVertexBuffer()._buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.getVertices()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(1);
        var normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.getNormalBuffer()._buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.getNormals()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(2);
        var color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.getColors()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(3);
        var material_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, material_buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(this.getMaterials()),
            gl.DYNAMIC_DRAW
        );
        gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(0);

        this.triangles = this.getTriangles();
    }

    /** Return wireframe array (or compute it if not up to date) */
    getWireframe() {
        var nbEdges = this.topMesh.getNbEdges();
        var cdw;
        var useDrawArrays = this.topMesh.isUsingDrawArrays();
        if (useDrawArrays) {
            if (
                this.topMesh._meshData._drawArraysWireframe &&
                this.topMesh._meshData._drawArraysWireframe.length ===
                    nbEdges * 2
            ) {
                return this.topMesh._meshData._drawArraysWireframe;
            }
            cdw = this.topMesh._meshData._drawArraysWireframe = new Uint32Array(
                nbEdges * 2
            );
        } else {
            if (
                this.topMesh._meshData._drawElementsWireframe &&
                this.topMesh._meshData._drawElementsWireframe.length ===
                    nbEdges * 2
            ) {
                return this.topMesh._meshData._drawElementsWireframe;
            }
            cdw = this.topMesh._meshData._drawElementsWireframe =
                new Uint32Array(nbEdges * 2);
        }

        var fAr = this.topMesh.getFaces();
        var feAr = this.topMesh.getFaceEdges();
        var nbFaces = this.topMesh.getNbFaces();
        var facesToTris = this.topMesh.getFacesToTriangles();

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
            ? this.topMesh._meshData._drawArraysWireframe
            : this.topMesh._meshData._drawElementsWireframe;
    }
}