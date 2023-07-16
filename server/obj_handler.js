import fs from "fs";

export function exportOBJ(vertices, normals, faces) {
var file = "o Cube";
file = file.concat('\n');

for (var i = 0; i < vertices.length; i += 3) {
    file = file.concat("v " + vertices[i] + " " + vertices[i + 1] + " " + vertices[i + 2]);
    file = file.concat('\n');
}

// for (var i = 0; i < texturecoords.length; i += 2) {
//     file = file.concat("vt " + texturecoords[i] + " " + texturecoords[i + 1]);
//     file = file.concat('\n');
// }

for (var i = 0; i < vertices.length; i += 3) {
    file = file.concat("vn " + normals[i] + " " + normals[i + 1] + " " + normals[i + 2]);
    file = file.concat('\n');
}

for (var i = 0; i < faces.length; i++) {
    file = file.concat("f " + (faces[i][0] + 1) + " " + (faces[i][1] + 1) + " " + (faces[i][2] + 1));
    file = file.concat('\n');
    // file = file.concat("f " + i + " " + (i + 2) + " " + (i + 3));
    // file = file.concat('\n');
}

fs.writeFile("NewModel.obj", file, (err) => {
    if (err) throw err;
});
}

export function parseOBJ(text) {
    // // because indices are base 1 let's just fill in the 0th data
    var geometry;
    const geometries = [];
    var groups = ['default'];
    var material = 'default';
    var object = 'default';
    var faceIndex = 0;
    var cantidad = 0;
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
    const faces = [];
    const objColors = [[0, 0, 0]];
    const materialLibs = [];
    const noop = () => {};

    // same order as `f` indices
    const objVertexData = [
    objPositions,
    objTexcoords,
    objNormals,
    faces,
    objColors,
    ];

    // same order as `f` indices
    let webglVertexData = [
    [],   // positions
    [],   // texcoords
    [],   // normals
    [],   // faces
    [],   // colors
    ];

    function newGeometry() {
    // If there is an existing geometry and it's
    // not empty then start a new one.
    if (geometry && geometry.data.vertices.length) {
        geometry = undefined;
    }
    setGeometry();
    }

    function setGeometry() {
        if (!geometry) {
          const vertices = [];
          const texcoord = [];
          const normals = [];
          const faces = [];
          const colors = [];
          webglVertexData = [
            vertices,
            texcoord,
            normals,
            faces,
            colors,
          ];
          geometry = {
            object,
            groups,
            data: {
              vertices,
              texcoord,
              normals,
              faces,
              colors,
            },
          };
          geometries.push(geometry);
        }
      }

    function addVertex(vert) {
    if (vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
        if (!objIndexStr) {
            return;
        }
        const objIndex = parseInt(objIndexStr);
        const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
        webglVertexData[i].push(...objVertexData[i][index]);
        // if this is the position index (index 0) and we parsed
        if (i === 0 && objColors.length > 1) {
            geometry.data.colors.push(...objColors[index]);
        }
        //, vertex colors then copy the vertex colors to the webgl vertex color data
        });
    }
    
    }

    const keywords = {
    v(parts) {
        // objPositions.push(parts.map(parseFloat));
        if (parts.length > 3) {
            objPositions.push(parts.slice(0, 3).map(parseFloat));
        } else {
            objPositions.push(parts.map(parseFloat));
        }
        objColors.push(parts.slice(3).map(parseFloat));
    },
    vn(parts) {
        objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
        // should check for missing v and extra w?
        objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
        setGeometry();
        addVertex(parts[0]);
        addVertex(parts[1]);
        addVertex(parts[2]);
        if (parts[3]) {
        addVertex(parts[3]);
        webglVertexData[3].push([faceIndex, faceIndex + 1, faceIndex + 2]);
        webglVertexData[3].push([faceIndex, faceIndex + 2, faceIndex + 3]);
        faceIndex += 4;
        } else {
        webglVertexData[3].push([faceIndex, faceIndex + 1, faceIndex + 2]);
        faceIndex += 3;
        }
    },
    usemtl(parts, unparsedArgs) {
        material = unparsedArgs;
        newGeometry();
      },
    mtllib(parts, unparsedArgs) {
        materialLibs.push(unparsedArgs);
    },
    o(parts, unparsedArgs) {
      object = unparsedArgs;
      newGeometry();
    },
    s: noop,
    g(parts) {
      groups = parts;
      newGeometry()
    },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
        continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
        continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    
    const handler = keywords[keyword];
    if (!handler) {
        // console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
        continue;
    }
    handler(parts, unparsedArgs);
    }

    for (const geometry of geometries) {
        geometry.data = Object.fromEntries(
        Object.entries(geometry.data).filter(([, array]) => array.length > 0));
    }

    return {
    materialLibs,
    geometries
    };
}