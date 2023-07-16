import * as HDRImage from "./hdrpng.min.js";
import { matcapIDs } from "./UI/textures.js";

export class Texture {
    constructor(gl, texturePath, isHDR, wrap, filter, callback) {
        if (!Texture.nbTextureToLoad) {
            Texture.nbTextureToLoad = 0;
        }
        Texture.nbTextureToLoad++;

        var image;
        if (!isHDR) {
            image = new Image();
        } else {
            image = new HDRImage();
        }
        image.crossOrigin = "anonymous";

        image.onload = () => {
            var texture = Texture.generateTextureFromData(
                gl,
                image,
                image.width,
                image.height,
                isHDR,
                wrap,
                filter
            );
            //// console.log("Loaded " + texturePath + " successfully");

            // Keep track of how much there is left to load
            if (!Texture.nbTextureLoaded) {
                Texture.nbTextureLoaded = 0;
            }
            Texture.nbTextureLoaded++;

            if (callback) {
                callback(texture);
            }
        };

        image.onerror = function () {
            // console.log("Couldn't load " + texturePath);
        };

        image.src = texturePath; // execute the test
    }

    static generateTextureFromData(
        gl,
        data,
        width,
        height,
        isHDR,
        wrap,
        filter
    ) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        // set the texture wrapping/filtering options (on the currently bound texture object)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        // load and generate the texture
        if (!isHDR) {
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGB,
                width,
                height,
                0,
                gl.RGB,
                gl.UNSIGNED_BYTE,
                data
            );
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGB16F,
                width,
                height,
                0,
                gl.RGB,
                gl.FLOAT,
                data.dataFloat
            );
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        return texture;
    }

    static loadDefaultTexture(gl) {
        // Generate a 1*1 pixel white texture
        Texture.defaultTexture = Texture.generateTextureFromData(
            gl,
            new Uint8Array([255.0, 255.0, 255.0]),
            1,
            1,
            false,
            gl.REPEAT,
            gl.NEAREST
        );
    }
}

export function loadTexture(gl, source, callback = null, data = null) {
    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.

    if (data) {
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            data
        );
    } else {
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255])
        );
        // Asynchronously load an image
        var image = new Image();
        image.crossOrigin = "anonymous";
        image.src = source;
        image.onload = () => {
            // Now that the image has loaded make copy it to the texture.
            //gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                image
            );
            gl.generateMipmap(gl.TEXTURE_2D);
    
            if (callback) {
                callback(texture);
            }
        };
    }
    
    // image.addEventListener("onload", function () {
        // // Now that the image has loaded make copy it to the texture.
        // //gl.activeTexture(gl.TEXTURE0);
        // gl.bindTexture(gl.TEXTURE_2D, texture);
        // gl.texImage2D(
        //     gl.TEXTURE_2D,
        //     0,
        //     gl.RGBA,
        //     gl.RGBA,
        //     gl.UNSIGNED_BYTE,
        //     image
        // );
        // gl.generateMipmap(gl.TEXTURE_2D);

        // if (callback) {
        //     callback(texture);
        // }
    // });

    return texture;
}

export function loadMatcapTextures(gl, properties) {
    for (var i = 0; i < 50; i++) {
        var src =
            "https://makio135.com/matcaps/1024/" +
            properties.matcapIDs[i + 250] +
            ".png";
        properties.matcapTextures[i] = loadTexture(gl, src);
    }
}
