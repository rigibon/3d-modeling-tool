import { Vertex, Halfedge, Face } from "./structures";
import { vec3, mat4, vec4 } from "gl-matrix";
import { GLU } from "../GLU";
const THREE = require("three");
const oct = require("linear-octree");
import { OctreeRaycaster } from "sparse-octree";
import { intersectsOctree, GeometryProcessing } from "./processing";

export var pickedVertices = [];

var _TMP_MAT = mat4.create();
var _viewport = mat4.create();

function CheckCull(VecFromCameraToSurface, SurfaceNormal) {
    return vec3.dot(VecFromCameraToSurface, SurfaceNormal) > 0.0;
}

export function getIntersectedPoint(event, gl, camera, model, canvas, brushSize, strength, socketHandler) {
    var geomProc = new GeometryProcessing(socketHandler);
    var modelview = mat4.create();
    mat4.multiply(modelview, camera.viewMatrix, model.worldMatrix);
    var camPos = camera.getPosition();

    // SI EL PANEL DE HERRAMIENTAS ESTA ABIERTO ESTE VIEWPORT SE MODIFICA
    var viewport = [0, 0, canvas.clientWidth  - 300, canvas.clientHeight  - 50];

    var start = [];
    var end = [];
    
    GLU.unProject(event.clientX, Math.abs(event.clientY - 50 - viewport[3]), 0.0, modelview, camera.projectionMatrix, viewport, start);
    GLU.unProject(event.clientX, Math.abs(event.clientY - 50 - viewport[3]), 1.0, modelview, camera.projectionMatrix, viewport, end);
    
    var direction = vec3.create();
    vec3.subtract(direction, end, start);
    vec3.normalize(direction, direction);
    var origin = vec3.fromValues(start[0], start[1], start[2]);
    var dest = vec3.fromValues(direction[0], direction[1], direction[2]);
    
    var origin = new THREE.Vector3(start[0], start[1], start[2]);
    var dest = new THREE.Vector3(end[0], end[1], end[2]);
    var dir = new THREE.Vector3(direction[0], direction[1], direction[2]);
    var raycaster = new THREE.Raycaster(origin, dir, 0.0, 1.0);

    model.octree.visit((node, x0, y0, z0, x1, y1, z1) => {
        var min = new THREE.Vector3(x0, y0, z0);
        var max = new THREE.Vector3(x1, y1, z1);

        var box = new THREE.Box3(min, max);

        var intersection = new THREE.Vector3();

        if (!raycaster.ray.intersectBox(box, intersection)) {
            return true;
        }
        
        if (!node.length) {
            var index = node.data[3]; 

            var vertex_position = vec3.fromValues(intersection.x, intersection.y, intersection.z);

            var VecFromCameraToSurface = vec3.create();
            vec3.subtract(VecFromCameraToSurface, vertex_position, camPos);

            var SurfaceNormal = model.vertices[index].normal;
            
            if (!CheckCull(VecFromCameraToSurface, SurfaceNormal)) {
                geomProc.findNearbyPoints(gl, model.octree, vertex_position, brushSize, strength, pickedVertices, VecFromCameraToSurface, model, model.edges);
                return;
            }
        }

        return false;
    });
}

export function selectEntity(event, picking, canvas, camera, entities) {
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].isAlt && picking.intersectionMouseMesh(canvas, camera, entities[i], event.clientX, event.clientY, entities[i].worldMatrix)) {
            return entities[i];
        }
    }
    
    return null;
}