import generateProtoBufs from './generateProtoBufs'
import { generateDataURL } from './generateQrCode'
import { PDFDocument } from 'pdf-lib'
import { disableButton, enableButton } from '../utils/utils'


const showFormData = (data) => {
    document.getElementById('qr-title').innerHTML = data.title;
    document.getElementById('qr-subtitle').innerHTML = data.subtitle;
    const addition = document.getElementById('qr-addition');
    if (!!data.addition) {
        addition.innerHTML = data.addition;
        addition.style.display = "block";
    } else {
        addition.style.display = "none";
    }
}

const generatePDF = async (pdfButton, publicMessage, privateMessage, data) => {
    const response = await fetch(`/pdfs/template.${window.currentLanguage.shortcode}.pdf`);
    const template = await response.arrayBuffer();

    const pdf = await PDFDocument.load(template);

    const publicDataURL = await generateDataURL(publicMessage, { width: 220, color: { dark: "#413f8d" } });
    const publicPng = await pdf.embedPng(publicDataURL);
    const publicPage = pdf.getPage(0);
    publicPage.drawImage(publicPng, {
        x: publicPage.getWidth() / 2 - publicPng.width / 2,
        y: publicPage.getHeight() / 2 - 50,
        width: publicPng.width,
        height: publicPng.height,
    });

    const privateDataURL = await generateDataURL(privateMessage, { width: 150, color: { dark: "#f34e70" } });
    const privatePng = await pdf.embedPng(privateDataURL);
    const privatePage = pdf.getPage(1);
    privatePage.drawImage(privatePng, {
        x: privatePage.getWidth() / 2 - privatePng.width / 2,
        y: privatePage.getHeight() / 2 + 220,
        width: privatePng.width,
        height: privatePng.height,
    });

    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    pdfButton.setAttribute("href", window.URL.createObjectURL(blob));

    enableButton(pdfButton);
}

const generateKeys = async (qrButton) => {
    if (qrButton.classList.contains("disabled")) return;

    const pdfButton = document.getElementById('download-pdf-btn');

    disableButton(qrButton);
    disableButton(pdfButton);

    const formData = new FormData(document.getElementById('qr-form'));
    const data = {
        title: formData.get("title"),
        subtitle: formData.get("subtitle"),
        addition: formData.get("addition"),
        category: formData.get("category")
    }

    if(!data.title || !data.subtitle) {
        if(!data.title) {
            document.getElementById("title").classList.add("invalid");
        }
        if(!data.subtitle) {
            document.getElementById("subtitle").classList.add("invalid");
        }
        enableButton(qrButton);
        return;
    }

    const { privateMessage, publicMessage } = await generateProtoBufs(data.title, data.subtitle, data.addition, data.category, `${PUBLIC_KEY}`);

    showFormData(data);

    const publicImg = await generateDataURL(`${BASE_URL}#${publicMessage}`, { width: 161, color: { dark: "#413f8d" } });
    const privateImg = await generateDataURL(`${UPLOAD_URL}#${privateMessage}`, { width: 161, color: { dark: "#f34e70" } });

    document.querySelector("#public-qr-card .qr-code").innerHTML = `<img src=${publicImg} alt"">`;
    document.querySelector("#private-qr-card .qr-code").innerHTML = `<img src=${privateImg} alt"">`;

    enableButton(qrButton);

    document.getElementById('qrgenerator').style.display = "none";
    document.getElementById('qrcodes').style.display = "block";

    generatePDF(pdfButton, publicMessage, privateMessage, data);
}

const backToGenerator = () => {
    document.getElementById('qrgenerator').style.display = "block";
    document.getElementById('qrcodes').style.display = "none";
}

export const initializeQrGenerator = () => {
    const qrButton = document.getElementById('generate-qr-btn');
    qrButton.onclick = () => { generateKeys(qrButton) };

    const pdfButton = document.getElementById('download-pdf-btn');
    disableButton(pdfButton);

    const backElements = document.querySelectorAll("#back-to-generator img, #back-to-generator div");
    for (let i = 0; i < backElements.length; i++) {
        backElements[i].onclick = backToGenerator;
    }
}