import fetch from "node-fetch";

export async function loadGLTF(url) {
    const gltf = await loadJSON(url);
   
    // load all the referenced files relative to the gltf file
    const baseURL = new URL(url);
    gltf.buffers = await Promise.all(gltf.buffers.map((buffer) => {
      const url = new URL(buffer.uri, baseURL.href);
      return loadBinary(url.href);
    }));

    // console.log(gltf.accessors);
}

async function loadFile(url, typeFunc) {
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`could not load: ${url}`);
}
return await response[typeFunc]();
}

async function loadBinary(url) {
return loadFile(url, 'arrayBuffer');
}

async function loadJSON(url) {
return loadFile(url, 'json');
}