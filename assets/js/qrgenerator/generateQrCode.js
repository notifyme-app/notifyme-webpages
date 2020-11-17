import QRCode from 'qrcode'

var defaultOptions = {
    errorCorrectionLevel: 'L',
    margin: 0,
}

export const generateDataURL = async (data, options) => {
    const mergedOptions = Object.assign({}, defaultOptions, options);
    const dataURL = await QRCode.toDataURL(data, mergedOptions);
    return dataURL;
}
