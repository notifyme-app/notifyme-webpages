import generateProtoBufs from './generateProtoBufs'
import { generateDataURL } from './generateQrCode'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { disableButton, enableButton } from '../utils/utils'
import strftime from 'strftime'


const showFormData = (data) => {
    document.getElementById('qr-category').src = `images/illus_category_${data.category}.svg`;
    document.getElementById('qr-title').innerHTML = data.title;
    let subtitle = data.subtitle;
    if(!!data.addition) subtitle += `, ${data.addition}`;
    document.getElementById('qr-subtitle').innerHTML = subtitle;
}

const generatePDF = async (pdfButton, publicMessage, privateMessage, data) => {
    const response = await fetch(`/pdfs/template.${window.currentLanguage.shortcode}.pdf`);
    const template = await response.arrayBuffer();

    const pdf = await PDFDocument.load(template);
    pdf.registerFontkit(fontkit);

    const publicDataURL = await generateDataURL(`${BASE_URL}#${publicMessage}`, { width: 192, color: { dark: "#413f8d" } });
    const publicPng = await pdf.embedPng(publicDataURL);
    const publicPage = pdf.getPage(0);
    publicPage.drawImage(publicPng, {
        x: publicPage.getWidth() / 2 - publicPng.width / 2,
        y: 379,
        width: publicPng.width,
        height: publicPng.height,
    });

    const privateDataURL = await generateDataURL(`${UPLOAD_URL}#${privateMessage}`, { width: 158, color: { dark: "#f34e70" } });
    const privatePng = await pdf.embedPng(privateDataURL);
    const privatePage = pdf.getPage(1);
    privatePage.drawImage(privatePng, {
        x: privatePage.getWidth() / 2 - privatePng.width / 2,
        y: 627,
        width: privatePng.width,
        height: privatePng.height,
    });

    const fontLightResponse = await fetch(`/fonts/Inter-Light.otf`);
    const fontBoldResponse = await fetch(`/fonts/Inter-Bold.otf`);
    const fontRegularResponse = await fetch(`/fonts/Inter-Regular.otf`);

    const interLightBuffer = await fontLightResponse.arrayBuffer();
    const interBoldBuffer = await fontBoldResponse.arrayBuffer();
    const interRegularBuffer = await fontRegularResponse.arrayBuffer();

    const interLight = await pdf.embedFont(interLightBuffer);
    const interBold = await pdf.embedFont(interBoldBuffer);
    const interRegular = await pdf.embedFont(interRegularBuffer);

    const publicTitleSize = 24.3;
    const publicSubtitleSize = 13.9;
    const publicTitleWidth = interBold.widthOfTextAtSize(data.title, publicTitleSize);
    const publicSubtitleWidth = interLight.widthOfTextAtSize(data.subtitle, publicSubtitleSize);

    publicPage.drawText(data.title, {
        x: publicPage.getWidth() / 2 - publicTitleWidth / 2,
        y: 279,
        size: publicTitleSize,
        font: interBold,
        color: rgb(0, 0, 0)
    });
    publicPage.drawText(data.subtitle, {
        x: publicPage.getWidth() / 2 - publicSubtitleWidth / 2,
        y: 255.9,
        size: publicSubtitleSize,
        font: interLight,
        color: rgb(0, 0, 0)
    });

    const privateTitleSize = 19.5;
    const privateSubtitleSize = 11.1;
    const privateTitleWidth = interBold.widthOfTextAtSize(data.title, privateTitleSize);
    const privateSubtitleWidth = interLight.widthOfTextAtSize(data.subtitle, privateSubtitleSize);

    privatePage.drawText(data.title, {
        x: privatePage.getWidth() / 2 - privateTitleWidth / 2,
        y: 558,
        size: privateTitleSize,
        font: interBold,
        color: rgb(0, 0, 0)
    });
    privatePage.drawText(data.subtitle, {
        x: privatePage.getWidth() / 2 - privateSubtitleWidth / 2,
        y: 539,
        size: privateSubtitleSize,
        font: interLight,
        color: rgb(0, 0, 0)
    });

    const date = strftime(window.currentLanguage.pdfCreatedOnFormat);
    const dateSize = 12
    const dateWidth = interRegular.widthOfTextAtSize(date, dateSize);
    privatePage.drawText(date, {
        x: privatePage.getWidth() / 2 - dateWidth / 2,
        y: 290,
        size: dateSize,
        font: interRegular,
        color: rgb(0, 0, 0)
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