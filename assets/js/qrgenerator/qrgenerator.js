import strftime from "strftime";
import generateProtoBufs from "./generateProtoBufs";
import { generateSvg } from "./generateQrCode";
import { disableButton, enableButton } from "../utils/utils";
import generatePDF from "./generatePdf";
import {
    rangePicker,
    flatpickrOptions,
    localizedFlatpickr,
} from "../utils/rangePicker";

const showFormData = (data) => {
    document.getElementById(
        "qr-category"
    ).src = `images/illus_category_${data.category}.svg`;
    document.getElementById("qr-title").innerHTML = data.title;
    let subtitle = data.subtitle;
    if (!!data.addition) subtitle += `, ${data.addition}`;
    document.getElementById("qr-subtitle").innerHTML = subtitle;
    // document.getElementById("info-text").innerHTML = strftime(
    //     window.currentLanguage.codeValidityMessage,
    //     data.validFrom
    // ).replace(/\*\*(.+)\*\*/, "<b>$1</b>");
};

const localizedUrl = (url) => {
    const chunks = url.split("?");
    var currentLanguage = window.currentLanguage.shortcode;

    // de is default, do net set
    if (currentLanguage == 'de') {
        currentLanguage = ''; 
    }

    if(chunks.length > 1) {
        return `${chunks[0]}${chunks[0].endsWith("/") ? "" : "/"}${currentLanguage}?${chunks[1]}`;
    } else {
        return `${url}${url.endsWith("/") ? "" : "/"}${currentLanguage}`;
    }
}

const generateKeys = async (qrButton) => {
    if (qrButton.classList.contains("disabled")) return;

    const pdfButton = document.getElementById("download-pdf-btn");

    disableButton(qrButton);
    disableButton(pdfButton);

    const formData = new FormData(document.getElementById("qr-form"));
    const data = {
        title: formData.get("title"),
        subtitle: formData.get("subtitle"),
        addition: formData.get("addition"),
        category: parseInt(formData.get("category")),
        // validDate: formData.get("validDate"),
        validFrom: formData.get("validFrom"),
        validTo: formData.get("validTo"),
    };

    if (
        !data.title ||
        !data.subtitle ||
        //!data.validDate
        !data.validFrom ||
        !data.validTo ||
        document
            .querySelector("#validFrom + input")
            .classList.contains("invalid") ||
        document.querySelector("#validTo + input").classList.contains("invalid")
    ) {
        if (!data.title) {
            document.getElementById("title").classList.add("invalid");
        }
        if (!data.subtitle) {
            document.getElementById("subtitle").classList.add("invalid");
        }
        if (!data.validFrom) {
            document
                .querySelector("#validFrom + input")
                .classList.add("invalid");
        }
        if (!data.validTo) {
            document.querySelector("#validTo + input").classList.add("invalid");
        }
        enableButton(qrButton);
        return;
    }

    data.validFrom = new Date(data.validFrom);
    data.validTo = new Date(data.validTo);
    data.validTo.setDate(data.validTo.getDate() + 1); // until end of day

    const { qrTrace, qrEntry } = await generateProtoBufs(
        data.title,
        data.subtitle,
        data.addition,
        data.category,
        `${PUBLIC_KEY}`,
        data.validFrom,
        data.validTo
    );

    showFormData(data);

    const publicImgValue = `${BASE_URL}#${qrEntry}`;
    const publicImg = await generateSvg(publicImgValue, {
        width: 161,
        color: { dark: "#000000" },
    });
    console.log("Public: " + publicImgValue);

    const privateImgValue = `${localizedUrl(UPLOAD_URL)}#${qrTrace}`;
    const privateImg = await generateSvg(privateImgValue, {
        width: 161,
        color: { dark: "#C43F5B" },
    });
    console.log("Private: " + privateImgValue);

    document.querySelector("#public-qr-card .qr-code").innerHTML = publicImg;
    document.querySelector("#private-qr-card .qr-code").innerHTML = privateImg;

    enableButton(qrButton);

    document.getElementById("qrgenerator").style.display = "none";
    document.getElementById("qrcodes").style.display = "block";
    document.getElementById("language-selection").style.display = "none";

    const pdfBytes = await generatePDF(qrEntry, qrTrace, data);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    pdfButton.setAttribute("href", window.URL.createObjectURL(blob));

    enableButton(pdfButton);
};

const backToGenerator = () => {
    document.getElementById("qrgenerator").style.display = "block";
    document.getElementById("qrcodes").style.display = "none";
    document.getElementById("language-selection").style.display = "block";
};

export const initializeQrGenerator = () => {
    const qrButton = document.getElementById("generate-qr-btn");
    qrButton.onclick = () => {
        generateKeys(qrButton);
    };

    const pdfButton = document.getElementById("download-pdf-btn");
    disableButton(pdfButton);

    const backElements = document.querySelectorAll(
        "#back-to-generator img, #back-to-generator div"
    );
    for (let i = 0; i < backElements.length; i++) {
        backElements[i].onclick = backToGenerator;
    }

    const validFromInput = document.getElementById("validFrom");
    const validToInput = document.getElementById("validTo");

    // const validDateInput = document.getElementById("validDate");
    const options = Object.assign({}, flatpickrOptions, {
        enableTime: false,
        prohibitPast: true,
        altFormat: window.currentLanguage.datepickerFormat,
        onChange: (date, str, picker) =>
            picker.element.parentNode.children[1].classList.remove("invalid"),
    });

    //rangePicker(validFromInput, validToInput, options);

    localizedFlatpickr(validFromInput, options);
    localizedFlatpickr(validToInput, options);
};
