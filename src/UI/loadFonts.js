import * as ImGui from "../../../imgui-js/dist/imgui.umd.js";

export async function loadFonts(io) {
    io.Fonts.AddFontDefault();

    var fonts = { primary: null, secondary: null, chat: null };

    fonts.primary = await AddFontFromFileTTF(
        "http://localhost:3000/Roboto-Thin.ttf",
        15.0
    );

    var script = new ImGui.script_ImFontConfig();
    script.MergeMode = true;
    script.PixelSnapH = true;

    var config = new ImGui.FontConfig(script);

    fonts.primary = await AddFontFromFileTTF(
        "http://localhost:3000/FontAwesome6Final-Regular.otf",
        15.0,
        config,
        20594
    );

    fonts.secondary = await AddFontFromFileTTF(
        "http://localhost:3000/Roboto-Thin.ttf",
        25.0
    );

    var script = new ImGui.script_ImFontConfig();
    script.MergeMode = true;
    script.PixelSnapH = true;

    var config = new ImGui.FontConfig(script);

    fonts.secondary = await AddFontFromFileTTF(
        "http://localhost:3000/FontAwesome6Final-Regular.otf",
        15.0,
        config,
        20594
    );

    fonts.details = await AddFontFromFileTTF(
        "http://localhost:3000/Roboto-Thin.ttf",
        11.0
    );

    return fonts;
}

var _static_map = new Map();
var Static = class Static {
    constructor(value) {
        this.value = value;
        this.access = (value = this.value) => (this.value = value);
    }
};
function UNIQUE(key) {
    return key;
}
function STATIC(key, init) {
    let value = _static_map.get(key);
    if (value === undefined) {
        _static_map.set(key, (value = new Static(init)));
    }
    return value;
}
class StaticArray {
    constructor(count, value) {
        this.count = count;
        this.value = value;
    }
    access(index) {
        return (value = this.value[index]) => (this.value[index] = value);
    }
}
const _static_array_map = new Map();
function STATIC_ARRAY(count, key, init) {
    let value = _static_array_map.get(key);
    if (value === undefined) {
        _static_array_map.set(key, (value = new StaticArray(count, init)));
    }
    return value;
}

var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next()
            );
        });
    };

function LoadArrayBuffer(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        return response.arrayBuffer();
    });
}

function AddFontFromFileTTF(
    url,
    size_pixels,
    font_cfg = null,
    glyph_ranges = null
) {
    return __awaiter(this, void 0, void 0, function* () {
        font_cfg = font_cfg || new ImGui.FontConfig();
        font_cfg.Name =
            font_cfg.Name ||
            `${url.split(/[\\\/]/).pop()}, ${size_pixels.toFixed(0)}px`;
        return ImGui.GetIO().Fonts.AddFontFromMemoryTTF(
            yield LoadArrayBuffer(url),
            size_pixels,
            font_cfg,
            glyph_ranges
        );
    });
}
