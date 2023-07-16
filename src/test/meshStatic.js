import Mesh from './mesh.js';
import TransformData from './transformData.js';
import { MeshData } from './meshData.js';
import { mat4 } from "gl-matrix";

class MeshStatic extends Mesh {

  constructor(gl) {
    super();

    this._id = Mesh.ID++; // useful id to retrieve a mesh (dynamic mesh, multires mesh, voxel mesh)

    this._meshData = new MeshData();
    this._transformData = new TransformData();
    this.worldMatrix = mat4.create();
  }
}

export default MeshStatic;