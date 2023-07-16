import fs from "fs";

export function exportObj(model: any) {
    var file = "o Cube";
    file = file.concat('\n');

    for (var i = 0; i < model.vertices.length; i += 3) {
        file = file.concat("v " + model.vertices[i].position[0] + " " + model.vertices[i + 1].position[1] + " " + model.vertices[i + 2].position[2]);
        file = file.concat('\n');
    }

    for (var i = 0; i < model.texturecoords.length; i += 2) {
        file = file.concat("vt " + model.texturecoords[i] + " " + model.texturecoords[i + 1]);
        file = file.concat('\n');
    }

    for (var i = 0; i < model.normals.length; i += 3) {
        file = file.concat("vn " + model.normals[i] + " " + model.normals[i + 1] + " " + model.normals[i + 2]);
        file = file.concat('\n');
    }

    for (var i = 1; i <= model.vertices.length / 3; i += 4) {
      file = file.concat("f " + i + " " + (i + 1) + " " + (i + 2));
      file = file.concat('\n');
      file = file.concat("f " + i + " " + (i + 2) + " " + (i + 3));
      file = file.concat('\n');
    }

    fs.writeFile("Output.obj", file, (err) => {
        if (err) throw err;
    });
}
