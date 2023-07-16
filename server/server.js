import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import fetch from "node-fetch";
import { exportOBJ, parseOBJ } from "./obj_handler.js";
import { loadGLTF } from "./gltf_handler.js";
import { Server } from "socket.io";
import path, { dirname } from "path";
import multer from "multer";
import { fileURLToPath } from "url";
// import info from "./models/ball.json" assert { type: "json" };
// import info from "./models/ball2.json" assert { type: "json" };

var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);

var firstTriangle = true;

async function main() {
}

var app = express();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));

var storage = multer.diskStorage(
  {
      destination: './public/uploads/',
      filename: function ( req, file, cb ) {
          //req.body is empty...
          //How could I get the new_file_name property sent from client here?
          cb( null, file.originalname );
      }
  }
);

var textureStorage = multer.diskStorage(
  {
      destination: './public/uploads/textures/',
      filename: function ( req, file, cb ) {
          //req.body is empty...
          //How could I get the new_file_name property sent from client here?
          cb( null, file.originalname );
      }
  }
);

const upload = multer({ storage: storage });
const textureUpload = multer({ storage: textureStorage });

// app.use(express.static(path.join(__dirname, "/dist")));

// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "/dist/index.html"));
// });

app.post('/uploadGLBObject', upload.single('file'), (req, res, next) => {
  const file = req.file
  // console.log(file);
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
});

app.post('/uploadGLTFTexture', textureUpload.single('GLTFTexture'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a texture')
    error.httpStatusCode = 400
    return next(error)
  }
});

app.post('/uploadGLTFBin', upload.single('GLTFBin'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a bin')
    error.httpStatusCode = 400
    return next(error)
  }
});

app.post("/uploadAlbedo", upload.single("albedo"), (req, res, next) => {

    const file = req.file;
    if (!file) {
        const error = new Error("Please upload a texture");
        error.httpStatusCode = 400;
        return next(error);
    }
});

app.post("/uploadNormal", upload.single("normal"), (req, res, next) => {

  const file = req.file;
  if (!file) {
      const error = new Error("Please upload a texture");
      error.httpStatusCode = 400;
      return next(error);
  }
});

app.post("/uploadMetallic", upload.single("metallic"), (req, res, next) => {

  const file = req.file;
  if (!file) {
      const error = new Error("Please upload a texture");
      error.httpStatusCode = 400;
      return next(error);
  }
});

app.post("/uploadRoughness", upload.single("roughness"), (req, res, next) => {

  const file = req.file;
  if (!file) {
      const error = new Error("Please upload a texture");
      error.httpStatusCode = 400;
      return next(error);
  }
});

app.post("/uploadAo", upload.single("ao"), (req, res, next) => {

  const file = req.file;
  if (!file) {
      const error = new Error("Please upload a texture");
      error.httpStatusCode = 400;
      return next(error);
  }
});

app.get('/search', function (req, res) {
    res.header("Content-Type", 'application/json');
    // res.send(JSON.stringify(info));
})

app.get('/obj-import', async function (req, res) {
  res.header("Content-Type", 'application/json');
  // const response = await fetch('https://webglfundamentals.org/webgl/resources/models/cube/cube.obj');
  // const response = await fetch('http://localhost:3000/sphere.obj');
  const response = await fetch('http://localhost:3000/cube.obj');
  const text = await response.text();
  const datum = parseOBJ(text);

  // console.log(datum);

  res.send(JSON.stringify(datum));
})

app.post('/obj-export', function (req, res) {
  exportOBJ(req.body.vertices, req.body.normals, req.body.faces);
  // console.log(req.get("content-length"));
})

app.get('/gltf-import', async function (req, res) {
  res.header("Content-Type", 'application/json');
  const response = await fetch('http://localhost:3000/cube.gltf');
  var gltf = await loadGLTF('http://localhost:3000/cube.gltf');
  // // console.log(gltf);
  res.send(gltf);
})

app.post('/search', function (req, res) {
    // console.log(req.body);
})

const server = app.listen(3000, () => {
  // console.log("Running");
});

const io = new Server(server, {});

io.on("connection", (socket) => {
  socket.join("room");
  
  socket.on("addedNewModel", (data) => {
      // io.emit("addModel", data);
  socket.broadcast.to("room").emit("addModel", data);
  });

  socket.on("moveVertex", (data) => {
    socket.broadcast.to("room").emit("moveV", data);
  });

  socket.on("changeAmbientColor", (data) => {
    socket.broadcast.to("room").emit("changeAmbientC", data);
  });

  socket.on("propsFromClient", (data) => {
    socket.broadcast.to("room").emit("propsFromServer", data);
    // io.to("room").emit("propsFromServer", "Hola");
  });

  socket.on("modifiedVertexDataFromClient", (modifiedVertexData) => {
    socket.broadcast.to("room").emit("modifiedVertexDataFromServer", modifiedVertexData);
  });

  socket.on("entityToAddFromClient", (entityToAdd) => {
    socket.broadcast.to("room").emit("entityToAddFromServer", entityToAdd);
  });

  socket.on("sendToServer", (sculptData) => {
    socket.broadcast.to("room").emit("getFromServer", sculptData);
    // console.log(Buffer.byteLength(JSON.stringify(sculptData), "utf8") / 1024);
  });

  socket.on("sendChatMessageToServer", (message) => {
    socket.broadcast.to("room").emit("getChatMessageFromServer", message);
  })
});

main();