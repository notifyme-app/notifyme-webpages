import QRCode from "qrcode";

const defaultOptions = {
    errorCorrectionLevel: "L",
    margin: 2,
};

const defaultSvgOptions = Object.assign({}, defaultOptions, { type: "svg" });

export const generateDataURL = async (data, options) => {
    const mergedOptions = Object.assign({}, defaultOptions, options);
    const dataURL = await QRCode.toDataURL(data, mergedOptions);
    return dataURL;
};

export const generateSvg = async (data, options) => {
    const mergedOptions = Object.assign({}, defaultSvgOptions, options);
    const svg = await QRCode.toString(data, mergedOptions);
    return svg;
}
