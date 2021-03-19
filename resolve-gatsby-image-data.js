"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveGatsbyImageData = void 0;
const gatsby_plugin_image_1 = require("gatsby-plugin-image");
const validFormats = new Set(["jpg", "png", "webp"]);
async function resolveGatsbyImageData(image, _a) {
    var { formats = ["auto", "webp"], layout = "constrained" } = _a, options = __rest(_a, ["formats", "layout"]);
    let [basename, version] = image.originalSrc.split("?");
    const dot = basename.lastIndexOf(".");
    let ext = "";
    if (dot !== -1) {
        ext = basename.slice(dot + 1);
        basename = basename.slice(0, dot);
    }
    const generateImageSource = (filename, width, height, toFormat) => {
        if (!validFormats.has(toFormat)) {
            console.warn(`${toFormat} is not a valid format. Valid formats are: ${[
                ...validFormats,
            ].join(", ")}`);
            toFormat = "jpg";
        }
        let suffix = "";
        if (toFormat === ext) {
            suffix = `.${toFormat}`;
        }
        else {
            suffix = `.${ext}.${toFormat}`;
        }
        return {
            width,
            height,
            format: toFormat,
            src: `${filename}_${width}x${height}_crop_center${suffix}?${version}`,
        };
    };
    const sourceMetadata = {
        width: image.width,
        height: image.height,
        format: ext,
    };
    return gatsby_plugin_image_1.generateImageData(Object.assign(Object.assign({}, options), { formats,
        layout,
        sourceMetadata, pluginName: `gatsby-source-shopify-experimental-cachebust`, filename: basename, generateImageSource }));
}
exports.resolveGatsbyImageData = resolveGatsbyImageData;
//# sourceMappingURL=resolve-gatsby-image-data.js.map
