import "materialize-css/js/cash.js";
import "materialize-css/js/global.js";
import "materialize-css/js/anime.min.js";
import "materialize-css/js/forms.js";
import "materialize-css/js/buttons.js";
import "materialize-css/js/waves.js";
import "materialize-css/js/dropdown.js";
import "materialize-css/js/select.js";
import "materialize-css/js/toasts.js";
import { disableButton, enableButton, ready } from "./utils/utils";
import { rangePicker } from "./utils/rangePicker";
import {
    genPreTrace, mcl,
    PreTrace, TraceProof, PreTraceWithProof,
    QRCodeTrace, sodium,
    waitReady,
} from '@c4dt/libcrowdnotifier';

const messages = require("@c4dt/libcrowdnotifier/dist/v3/messages");
const primitives = require("@c4dt/libcrowdnotifier/dist/v3/crowd_notifier_primitives");

const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60;

window.Buffer = require('buffer/').Buffer;

ready(() => console.log(`Commit: ${GIT_INFO}`));

const preTraceFunV2 = (qrTrace, counts) => {
    const masterTraceRecordProto = qrTrace.masterTraceRecord;
    const masterPublicKey = new mcl.G2();
    masterPublicKey.deserialize(masterTraceRecordProto.masterPublicKey);
    const masterSecretKeyLocation = new mcl.Fr();
    masterSecretKeyLocation
        .deserialize(masterTraceRecordProto.masterSecretKeyLocation);

    const masterTraceRecord = {
        mpk: masterPublicKey,
        mskl: masterSecretKeyLocation,
        info: masterTraceRecordProto.info,
        nonce1: masterTraceRecordProto.nonce1,
        nonce2: masterTraceRecordProto.nonce2,
        ctxtha: masterTraceRecordProto.cipherTextHealthAuthority,
    };
    const count = parseInt(counts);
    const [preTrace, traceProof] = genPreTrace(masterTraceRecord, count);
    const preTraceProto = PreTrace.create({
        identity: preTrace.id,
        cipherTextHealthAuthority: preTrace.ctxtha,
        partialSecretKeyForIdentityOfLocation: preTrace.pskidl.serialize(),
        notificationKey: qrTrace.notificationKey
    });
    const traceProofProto = TraceProof.create({
        masterPublicKey: traceProof.mpk.serialize(),
        nonce1: traceProof.nonce1,
        nonce2: traceProof.nonce2,
    });
    const preTraceWithProof = PreTraceWithProof.create({
        preTrace: preTraceProto,
        proof: traceProofProto,
        info: masterTraceRecordProto.info,
    });
    return sodium.to_base64(PreTraceWithProof.encode(preTraceWithProof).finish());
}

const getAffectedHours = (from, to) => {
    const startHour = Math.floor(from / ONE_HOUR_IN_MILLISECONDS);
    const endHour = Math.floor(to / ONE_HOUR_IN_MILLISECONDS);
    const result = [];
    for (var i = startHour; i <= endHour; i++) {
        result.push(i);
    }
    return result;
}

const uploadV2 = async (payload, data) => {
    const affectedHours = getAffectedHours(data.from, data.to);
    const qrTrace = QRCodeTrace.decode(sodium.from_base64(payload));
    const preTraces = [];
    affectedHours.forEach(function (hour) {
        preTraces.push(preTraceFunV2(qrTrace, hour));
    });

    const postFormData = new FormData();
    postFormData.append("preTraces", preTraces);
    postFormData.append("affectedHours", affectedHours);
    postFormData.append("startTime", data.from);
    postFormData.append("endTime", data.to);
    postFormData.append("message", data.note);
    postFormData.append("criticality", data.criticality);

    const response = await fetch(`${POST_URL}` + '/v1/debug/traceKey', {
        method: "POST",
        body: postFormData,
    });
    return response;
}

const uploadV3 = async (payload, data) => {
    const qrCodeTrace = messages.QRCodeTrace.decode(sodium.from_base64(payload));
    const preTraces = primitives.genPreTrace(
        qrCodeTrace,
        Math.round(data.from / 1000),
        Math.round(data.to / 1000),
    );

    const postFormData = new FormData();
    postFormData.append("preTraces", preTraces);
    postFormData.append("message", data.note);
    postFormData.append("criticality", data.criticality);

    const response = await fetch(`${POST_URL}` + '/v3/debug/traceKey', {
        method: "POST",
        body: postFormData,
    });
    return response;
}

const uploadData = async (button) => {
    if (button.classList.contains("disabled")) return;

    await waitReady();

    disableButton(button);

    const formData = new FormData(document.getElementById("upload-form"));
    const data = {
        from: formData.get("from"),
        to: formData.get("to"),
        note: formData.get("note"),
        criticality: formData.get("criticality")
    };

    if (!formData.get("from") || !formData.get("to")) {
        if (!formData.get("from")) {
            document.querySelector("#from + input").classList.add("invalid");
        }
        if (!formData.get("to")) {
            document.querySelector("#to + input").classList.add("invalid");
        }
        enableButton(button);
        return;
    }

    data.from = Date.parse(data.from.trim().replace(" ", "T"));
    data.to = Date.parse(data.to.trim().replace(" ", "T"));

    const url = new URL(window.location.href);
    const version = url.searchParams.get("v");
    const payload = window.location.hash.slice(1);
    if (!payload) {
        M.toast({
            html: window.currentLanguage.uploadMissingPayloadMessage,
            classes: "red lighten-2",
        });
        enableButton(button);
        return;
    }

    var response;
    if (version === "2") {
        console.log("Upload v2");
        response = await uploadV2(payload, data);
    } else if (version === "3") {
        console.log("Upload v3");
        response = await uploadV3(payload, data);
    }

    console.log(response);

    if (response.ok) {
        M.toast({
            html: window.currentLanguage.uploadSuccessMessage,
            classes: "green lighten-2",
        });
        disableButton(button, false);
    } else {
        M.toast({
            html: window.currentLanguage.uploadErrorMessage,
            classes: "red lighten-2",
        });
        enableButton(button);
    }
};

ready(() => {
    const elems = document.querySelectorAll("select.material-select");
    M.FormSelect.init(elems);

    const uploadButton = document.getElementById("upload-btn");
    uploadButton.onclick = () => {
        uploadData(uploadButton);
    };

    const fromInput = document.getElementById("from");
    const toInput = document.getElementById("to");

    rangePicker(fromInput, toInput, {
        prohibitFuture: true,
        maxRangeInHr: 24,
    });
});
