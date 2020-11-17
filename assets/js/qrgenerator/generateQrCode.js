
import qrcode from 'qrcode-generator'

const typeNumber = 0; // automatic
const errorCorrectionLevel = 'L';
const cellSize = 4;
const margin = 0;

const generateQrCode = (data) => {
    const qrEntry = qrcode(typeNumber, errorCorrectionLevel);
    qrEntry.addData(data);
    qrEntry.make();
    return qrEntry.createSvgTag(cellSize, margin);
}

export default generateQrCode;
