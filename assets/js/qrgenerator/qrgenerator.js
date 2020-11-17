import generateProtoBufs from './generateProtoBufs'
import generateQrCode from './generateQrCode'

const showFormData = (data) => {
    document.getElementById('qr-title').innerHTML = data.title;
    document.getElementById('qr-subtitle').innerHTML = data.subtitle;
    const addition = document.getElementById('qr-addition');
    if(!!data.addition) {
        addition.innerHTML = data.addition;
        addition.style.display = "block";
    } else {
        addition.style.display = "none";
    }
}

const generateKeys = async (button) => {
    if(button.classList.contains("disabled")) return;

    button.classList.add("disabled");
    const preloader = button.getElementsByClassName("preloader-wrapper")[0];
    preloader.style.display = "block";

    const formData = new FormData(document.getElementById('qr-form'));
    const data = {
        title: formData.get("title"),
        subtitle: formData.get("subtitle"),
        addition: formData.get("addition"),
        category: formData.get("category")
    }

    const { privateMessage, publicMessage } = await generateProtoBufs(data.title, data.subtitle, data.addition, data.category, `${PUBLIC_KEY}`);

    showFormData(data);

    document.querySelector("#public-qr-card .qr-code").innerHTML = generateQrCode(`${BASE_URL}#${publicMessage}`)
    document.querySelector("#private-qr-card .qr-code").innerHTML = generateQrCode(`${UPLOAD_URL}#${privateMessage}`)

    button.classList.remove("disabled");
    preloader.style.display = "none";

    document.getElementById('qrgenerator').style.display = "none";
    document.getElementById('qrcodes').style.display = "block";
}

const backToGenerator = () => {
    document.getElementById('qrgenerator').style.display = "block";
    document.getElementById('qrcodes').style.display = "none";
}

export const initializeQrGenerator = () => {
    const button = document.getElementById('generate-qr-btn')
    button.onclick = () => { generateKeys(button) };

    const backElements = document.querySelectorAll("#back-to-generator img, #back-to-generator div");
    for(let i=0; i < backElements.length; i++){
        backElements[i].onclick = backToGenerator;
    }
}