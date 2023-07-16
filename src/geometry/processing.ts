import { Model } from "../model";
import { Vertex, Face, Halfedge } from "./structures";
import { vec3, vec4 } from "gl-matrix";
import { SocketHandler } from "../sockets/socketHandler";
const THREE = require("three");
const d3 = require("d3-octree");

export class GeometryProcessing {
	socketHandler: SocketHandler;

	constructor(socketHandler: SocketHandler) {
		this.socketHandler = socketHandler;
	}

    generateOctree(vertices: Vertex[]): any {
        var octree = new d3.octree();

		for (var i = 0; i < vertices.length; i++) {	
			octree.add([vertices[i].position[0], vertices[i].position[1], vertices[i].position[2], i]);
		}

		var verticesOrdered = octree.data();

		var aux = 0;

		while (aux < verticesOrdered.length) {
			var vert = verticesOrdered[aux];
			var firstData = verticesOrdered[aux];
			var indices: number[] = [];

			vertices[vert[3]].indicesOrder = [verticesOrdered[aux][3]];

			var currentData: any = verticesOrdered[aux];

			while (aux < verticesOrdered.length && 
				currentData[0] === firstData[0] &&
				currentData[1] === firstData[1] && 
				currentData[2] === firstData[2])
				{
					indices.push(currentData[3]);
					aux++;
					currentData = verticesOrdered[aux];
				}

			for (var i = 0; i < indices.length; i++) {
				vertices[indices[i]].indicesOrder = indices;
			}
		}

		return octree;
    }

	move_vertex(gl: any, vertex_index: any, model: any, edges: any, distance: any, radio: any, meshes: any) {
		var index = model.vertices[vertex_index].edge.index;
		var aux = model.vertices[vertex_index].edge.index;
		var normal = model.vertices[vertex_index].normal;

		var vertInd = aux[0];

		var offset = model.vertices[vertInd].offset;
		var mesh_index = model.vertices[vertInd].mesh_index;

		model.vertices[vertInd].position[0] += normal[0] * 0.01 * (radio - distance);
		model.vertices[vertInd].position[1] += normal[1] * 0.01 * (radio - distance);
		model.vertices[vertInd].position[2] += normal[2] * 0.01 * (radio - distance);

		model.meshes[mesh_index].bVertices[(vertex_index - offset) * 3] = model.vertices[vertInd].position[0];
		model.meshes[mesh_index].bVertices[((vertex_index - offset) * 3) + 1] = model.vertices[vertInd].position[1];
		model.meshes[mesh_index].bVertices[((vertex_index - offset) * 3) + 2] = model.vertices[vertInd].position[2];

		meshes.array[mesh_index] = true;

		var result = this.calculateNormal(model.vertices[vertInd].position,
							model.vertices[vertInd].edge.next.vertex.position,
							model.vertices[vertInd].edge.next.next.vertex.position);

		model.meshes[mesh_index].bNormalsDynamic[(vertInd - offset) * 3] = result[0];
		model.meshes[mesh_index].bNormalsDynamic[((vertInd - offset) * 3) + 1] = result[1];
		model.meshes[mesh_index].bNormalsDynamic[((vertInd - offset) * 3) + 2] = result[2];

		var indices = model.vertices[vertex_index].indicesOrder;

		for (var i = 0; i < indices.length; i++) {
			if (indices[i] !== vertInd) {
				var offsets = model.vertices[indices[i]].offset;
				var mesh_indexs = model.vertices[indices[i]].mesh_index;
	
				meshes.array[mesh_indexs] = true;
	
				model.vertices[indices[i]].position = model.vertices[vertInd].position;
	
				model.meshes[mesh_indexs].bVertices[(indices[i] - offsets) * 3] = model.vertices[indices[i]].position[0];
				model.meshes[mesh_indexs].bVertices[((indices[i] - offsets) * 3) + 1] = model.vertices[indices[i]].position[1];
				model.meshes[mesh_indexs].bVertices[((indices[i] - offsets) * 3) + 2] = model.vertices[indices[i]].position[2];
			}
		}
	}

	calculateNormal(a: vec3, b: vec3, c: vec3) {
		var BA = vec3.create();
		var CA = vec3.create();
	
		vec3.subtract(BA, b, a);
		vec3.subtract(CA, c, a);
	
		var result = vec3.create();
		vec3.cross(result, CA, BA);
		vec3.normalize(result, result);
		vec3.negate(result, result);
	
		return result;
	}

	findNearbyPoints(gl: any, tree: any, point: vec3, radio: number, strength: number, pickedVertices: vec3[], vecFromCameraToSurface: vec3, model: Model, edges: any) {
		var meshes = { array: [false, false, false, false, false, false] as any };

		tree.visit((node: any, x0: any, y0: any, z0: any, x1: any, y1: any, z1: any) => {
			var p = new THREE.Vector3(point[0], point[1], point[2]);
	
			if (point[0] < x0 - radio || point[0] > x1 + radio ||
				point[1] < y0 - radio || point[1] > y1 + radio ||
				point[2] < z0 - radio || point[2] > z1 + radio
			) {
				return true;
			}
	
			if (!node.length) {
				var p2 = new THREE.Vector3(node.data[0], node.data[1], node.data[2]);
				if (p2.distanceTo(p) < radio) {
					this.move_vertex(gl, node.data[3], model, edges, p2.distanceTo(p), radio, meshes);

					var aux = node;
	
					do {
						aux = aux.next;
						this.move_vertex(gl, aux.data[3], model, edges, p2.distanceTo(p), radio, meshes);
					} while (aux.next);
				}
			}
	
			return false;
		});

		for (var i = 0; i < model.meshes.length; i++) {
			if (meshes.array[i]) {
				gl.bindBuffer(gl.ARRAY_BUFFER, model.meshes[i].positionBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(model.meshes[i].bVertices));
	
				gl.bindBuffer(gl.ARRAY_BUFFER, model.meshes[i].normalBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(model.meshes[i].bNormalsDynamic));
			}
		}
	}
}