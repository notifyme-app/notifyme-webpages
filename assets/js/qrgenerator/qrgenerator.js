import generateProtoBufs from "./generateProtoBufs";
import { generateDataURL } from "./generateQrCode";
import { disableButton, enableButton } from "../utils/utils";
import generatePDF from "./generatePdf";
require("flatpickr/dist/flatpickr.min.css");
import flatpickr from "flatpickr";

const showFormData = (data) => {
    document.getElementById(
        "qr-category"
    ).src = `images/illus_category_${data.category}.svg`;
    document.getElementById("qr-title").innerHTML = data.title;
    let subtitle = data.subtitle;
    if (!!data.addition) subtitle += `, ${data.addition}`;
    document.getElementById("qr-subtitle").innerHTML = subtitle;
};

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
        category: formData.get("category"),
        validFrom: formData.get("validFrom"),
        validTo: formData.get("validTo"),
    };

    if (
        !data.title ||
        !data.subtitle ||
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

    data.validFrom = Date.parse(data.validFrom.trim().replace(" ", "T"));
    data.validTo = Date.parse(data.validTo.trim().replace(" ", "T"));

    const { privateMessage, publicMessage } = await generateProtoBufs(
        data.title,
        data.subtitle,
        data.addition,
        data.category,
        `${PUBLIC_KEY}`,
        data.validFrom,
        data.validTo
    );

    showFormData(data);

    const publicImg = await generateDataURL(`${BASE_URL}#${publicMessage}`, {
        width: 161,
        color: { dark: "#413f8d" },
    });
    const privateImg = await generateDataURL(
        `${UPLOAD_URL}#${privateMessage}`,
        { width: 161, color: { dark: "#f34e70" } }
    );

    document.querySelector(
        "#public-qr-card .qr-code"
    ).innerHTML = `<img src=${publicImg} alt"">`;
    document.querySelector(
        "#private-qr-card .qr-code"
    ).innerHTML = `<img src=${privateImg} alt"">`;

    enableButton(qrButton);

    document.getElementById("qrgenerator").style.display = "none";
    document.getElementById("qrcodes").style.display = "block";

    const pdfBytes = await generatePDF(publicMessage, privateMessage, data);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    pdfButton.setAttribute("href", window.URL.createObjectURL(blob));

    enableButton(pdfButton);
};

const backToGenerator = () => {
    document.getElementById("qrgenerator").style.display = "block";
    document.getElementById("qrcodes").style.display = "none";
};

const updateErrorMsg = (helperTextId, dataKey) => {
    var helperText = document.getElementById(helperTextId);
    helperText.dataset.error = helperText.dataset[dataKey];
};

const checkValidFrom = (input) => {
    const createBeforeMaxDays = 7;
    var validFrom = Date.parse(input.value.trim().replace(" ", "T"));
    const now = new Date();
    var earliestFrom = new Date(now.getTime());
    var latestFrom = new Date(now.getTime());
    latestFrom.setDate(latestFrom.getDate() + createBeforeMaxDays);
    if (validFrom < earliestFrom) {
        updateErrorMsg("validFromHelperText", "errorInvalid");
        input._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
    } else if (validFrom > latestFrom) {
        updateErrorMsg("validFromHelperText", "errorFromOverflow");
        input._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
    } else {
        updateErrorMsg("validFromHelperText", "errorMissing");
        input._flatpickr.element.parentNode.children[1].classList.remove(
            "invalid"
        );
    }
};

const checkValidTo = (input, validFromInput) => {
    if (input.value !== "") {
        if (validFromInput.value !== "") {
            const maxDurationInH = 24;
            var validTo = Date.parse(input.value.trim().replace(" ", "T"));
            var validFrom = Date.parse(
                validFromInput.value.trim().replace(" ", "T")
            );
            if (validTo < validFrom) {
                updateErrorMsg("validToHelperText", "errorInvalid");
                input._flatpickr.element.parentNode.children[1].classList.add(
                    "invalid"
                );
            } else if (validTo - validFrom > maxDurationInH * 60 * 60 * 1000) {
                updateErrorMsg("validToHelperText", "errorDurationOverflow");
                input._flatpickr.element.parentNode.children[1].classList.add(
                    "invalid"
                );
            } else {
                updateErrorMsg("validToHelperText", "errorMissing");
                input._flatpickr.element.parentNode.children[1].classList.remove(
                    "invalid"
                );
            }
        } else {
            updateErrorMsg("validToHelperText", "errorMissing");
            input._flatpickr.element.parentNode.children[1].classList.remove(
                "invalid"
            );
        }
    }
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

    validFromInput.onchange = () => {
        checkValidFrom(validFromInput);
        checkValidTo(validToInput, validFromInput);
    };
    updateErrorMsg("validFromHelperText", "errorMissing");

    validToInput.onchange = () => checkValidTo(validToInput, validFromInput);
    updateErrorMsg("validToHelperText", "errorMissing");

    const flatpickrOptions = {
        enableTime: true,
        altInput: true,
        altFormat: "d.m.Y H:i",
        time_24hr: true,
        onClose: function (date, str, picker) {
            if (picker.input.value === "") {
                picker.element.parentNode.children[1].classList.add("invalid");
            }
        },
        monthSelectorType: "static",
    };
    flatpickr(validFromInput, flatpickrOptions);
    flatpickr(validToInput, flatpickrOptions);
};
