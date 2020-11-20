import generateProtoBufs from './generateProtoBufs'
import { generateDataURL } from './generateQrCode'
import { disableButton, enableButton } from '../utils/utils'
import generatePDF from './generatePdf'


const showFormData = (data) => {
    document.getElementById('qr-category').src = `images/illus_category_${data.category}.svg`;
    document.getElementById('qr-title').innerHTML = data.title;
    let subtitle = data.subtitle;
    if(!!data.addition) subtitle += `, ${data.addition}`;
    document.getElementById('qr-subtitle').innerHTML = subtitle;
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

    const pdfBytes = await generatePDF(publicMessage, privateMessage, data);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    pdfButton.setAttribute("href", window.URL.createObjectURL(blob));

    enableButton(pdfButton);
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