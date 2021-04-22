import {
    sodium,
    waitReady,
} from '@c4dt/libcrowdnotifier';

const messages = require("@c4dt/libcrowdnotifier/dist/v3/messages");
const primitives = require("@c4dt/libcrowdnotifier/dist/v3/crowd_notifier_primitives");


const generateProtoBufs = async (
    name,
    location,
    room,
    venueType,
    public_key,
    validFrom,
    validTo
) => {
    await waitReady();

    const healthAuthorityPublicKey = sodium.from_hex(`${public_key}`);
    const notificationKey = sodium.crypto_secretbox_keygen();

    if (venueType == 0) {
        venueType = undefined;
    }
    if (!room) {
        room = undefined;
    }

    const notifyMeLocationData = messages.NotifyMeLocationData.create({
        version: 1,
        type: venueType,
        room: room,
    });

    const countryData = messages.NotifyMeLocationData.encode(notifyMeLocationData).finish();
    const qrCodes = primitives.setupLocation(3, healthAuthorityPublicKey, name, location, validFrom, validTo, countryData);

    const locationProtobufs = {
        qrCodePayload: messages.QRCodePayload.decode(sodium.from_base64(qrCodes.qrCodePayload)),
        qrCodeTrace: messages.QRCodeTrace.decode(sodium.from_base64(qrCodes.qrCodeTrace)),
    };

    console.log(locationProtobufs);

    return {
        qrTrace: qrCodes.qrCodeTrace,
        qrEntry: qrCodes.qrCodePayload,
    };
};

export default generateProtoBufs;
