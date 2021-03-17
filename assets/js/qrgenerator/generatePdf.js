import { generateDataURL } from "./generateQrCode";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import strftime from "strftime";

const generatePDF = async (publicMessage, privateMessage, data) => {
    let pdf;
    const pdfPromise = fetch(
        `/pdfs/template.${window.currentLanguage.shortcode}.pdf`
    )
        .then((response) => {
            return response.arrayBuffer();
        })
        .then((buffer) => {
            return PDFDocument.load(buffer);
        })
        .then((pdfDoc) => {
            pdf = pdfDoc;
            pdf.registerFontkit(fontkit);
        });

    const asyncInterLight = fetch(`/fonts/Inter-Light.otf`)
        .then((response) => {
            return response.arrayBuffer();
        })
        .then(async (buffer) => {
            await pdfPromise;
            return pdf.embedFont(buffer);
        });
    const asyncInterBold = fetch(`/fonts/Inter-Bold.otf`)
        .then((response) => {
            return response.arrayBuffer();
        })
        .then(async (buffer) => {
            await pdfPromise;
            return pdf.embedFont(buffer);
        });
    const asyncInterRegular = fetch(`/fonts/Inter-Regular.otf`)
        .then((response) => {
            return response.arrayBuffer();
        })
        .then(async (buffer) => {
            await pdfPromise;
            return pdf.embedFont(buffer);
        });
    const asyncPublicPng = generateDataURL(`${BASE_URL}#${publicMessage}`, {
        width: 192,
        color: { dark: "#000000" },
    }).then(async (url) => {
        await pdfPromise;
        return pdf.embedPng(url);
    });
    const asyncPrivatePng = generateDataURL(`${UPLOAD_URL}#${privateMessage}`, {
        width: 158,
        color: { dark: "#c43f5B" },
    }).then(async (url) => {
        await pdfPromise;
        return pdf.embedPng(url);
    });
    const asyncCategoryIcon = fetch(
        `/images/illus_category_${data.category}.png`
    )
        .then((response) => {
            return response.arrayBuffer();
        })
        .then(async (buffer) => {
            await pdfPromise;
            return pdf.embedPng(buffer);
        });

    await pdfPromise;

    const publicPage = pdf.getPage(0);
    const privatePage = pdf.getPage(1);

    const publicPng = await asyncPublicPng;
    publicPage.drawImage(publicPng, {
        x: publicPage.getWidth() / 2 - publicPng.width / 2,
        y: 379,
        width: publicPng.width,
        height: publicPng.height,
    });

    const privatePng = await asyncPrivatePng;
    privatePage.drawImage(privatePng, {
        x: privatePage.getWidth() / 2 - privatePng.width / 2,
        y: 627,
        width: privatePng.width,
        height: privatePng.height,
    });

    const interLight = await asyncInterLight;
    const interBold = await asyncInterBold;
    const interRegular = await asyncInterRegular;

    let subtitle = data.subtitle;
    if (!!data.addition) subtitle += `, ${data.addition}`;

    const categoryIcon = await asyncCategoryIcon;
    const publicIconDim = 36;
    publicPage.drawImage(categoryIcon, {
        x: publicPage.getWidth() / 2 - publicIconDim / 2,
        y: 313,
        width: publicIconDim,
        height: publicIconDim,
    });

    const privateIconDim = 29;
    privatePage.drawImage(categoryIcon, {
        x: privatePage.getWidth() / 2 - privateIconDim / 2,
        y: 585,
        width: privateIconDim,
        height: privateIconDim,
    });

    const publicTitleSize = 24.3;
    const publicSubtitleSize = 13.9;
    const publicTitleWidth = interBold.widthOfTextAtSize(
        data.title,
        publicTitleSize
    );
    const publicSubtitleWidth = interLight.widthOfTextAtSize(
        subtitle,
        publicSubtitleSize
    );

    publicPage.drawText(data.title, {
        x: publicPage.getWidth() / 2 - publicTitleWidth / 2,
        y: 279,
        size: publicTitleSize,
        font: interBold,
        color: rgb(0, 0, 0),
    });
    publicPage.drawText(subtitle, {
        x: publicPage.getWidth() / 2 - publicSubtitleWidth / 2,
        y: 255.9,
        size: publicSubtitleSize,
        font: interLight,
        color: rgb(0, 0, 0),
    });

    const privateTitleSize = 19.5;
    const privateSubtitleSize = 11.1;
    const privateTitleWidth = interBold.widthOfTextAtSize(
        data.title,
        privateTitleSize
    );
    const privateSubtitleWidth = interLight.widthOfTextAtSize(
        subtitle,
        privateSubtitleSize
    );

    privatePage.drawText(data.title, {
        x: privatePage.getWidth() / 2 - privateTitleWidth / 2,
        y: 558,
        size: privateTitleSize,
        font: interBold,
        color: rgb(0, 0, 0),
    });
    privatePage.drawText(subtitle, {
        x: privatePage.getWidth() / 2 - privateSubtitleWidth / 2,
        y: 539,
        size: privateSubtitleSize,
        font: interLight,
        color: rgb(0, 0, 0),
    });

    const date = strftime(window.currentLanguage.pdfCreatedOnFormat);
    const dateSize = 12;
    const dateWidth = interRegular.widthOfTextAtSize(date, dateSize);
    privatePage.drawText(date, {
        x: privatePage.getWidth() / 2 - dateWidth / 2,
        y: 290,
        size: dateSize,
        font: interRegular,
        color: rgb(0, 0, 0),
    });

    /*const validMessage = strftime(
        window.currentLanguage.pdfCodeValidDateFormat,
        data.validFrom
    ).trim();
    const validDateSize = 13.9;
    const validDateWidth = interBold.widthOfTextAtSize(
        validMessage,
        validDateSize
    );
    publicPage.drawText(validMessage, {
        x: publicPage.getWidth() / 2 - validDateWidth / 2,
        y: 173,
        size: validDateSize,
        font: interBold,
        color: rgb(0, 0, 0),
    });*/

    return pdf.save();
};

export default generatePDF;
