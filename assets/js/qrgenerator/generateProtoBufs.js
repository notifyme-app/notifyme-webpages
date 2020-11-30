import protobuf from "protobufjs";
import _sodium from "libsodium-wrappers-sumo";
import qrMessage from "./protobuf/qrMessage";

const rootQr = protobuf.Root.fromJSON(qrMessage);
const QRCodeContent = rootQr.lookupType("qrpackage.QRCodeContent");
const QRCodeWrapper = rootQr.lookupType("qrpackage.QRCodeWrapper");
const QRCodeTrace = rootQr.lookupType("qrpackage.QRCodeTrace");

const generateProtoBufs = async (
    name,
    location,
    room,
    venueType,
    public_key,
    validFrom,
    validTo
) => {
    await _sodium.ready;
    const sodium = _sodium;

    const authorityPublicKey = sodium.from_hex(`${public_key}`);

    const r1 = sodium.randombytes_buf(32);
    const r2 = sodium.randombytes_buf(32);

    const notificationKey = sodium.crypto_secretbox_keygen();

    let qrCodeContent = QRCodeContent.create({
        version: 1,
        name: name,
        location: location,
        room: room,
        venueType: venueType,
        notificationKey: notificationKey,
        validFrom: validFrom,
        validTo: validTo,
    });

    const content = QRCodeContent.encode(qrCodeContent).finish();
    const hash = sodium.crypto_hash_sha256(Uint8Array.from([...sodium.crypto_hash_sha256(Uint8Array.from([...content, ...r1])), r2]));

    const { publicKey, privateKey } = sodium.crypto_sign_seed_keypair(hash);


    let qrTrace = QRCodeTrace.create({
        version: 1,
        r1: r1,
        r2: r2,
        content: qrCodeContent,
    });

    let qrCodeWrapper = QRCodeWrapper.create({
        version: 1,
        publicKey: publicKey,
        r2: r2,
        content: qrCodeContent,
    });

    const qrCodeTraceProtoBufBytes = QRCodeTrace.encode(qrTrace).finish();

    const ctx = sodium.crypto_box_seal(qrCodeTraceProtoBufBytes, authorityPublicKey);
    const qrCodeWrapperProtoBufBytes = QRCodeWrapper.encode(
        qrCodeWrapper
    ).finish();

    return {
        privateMessage: sodium.to_base64(ctx),
        publicMessage: sodium.to_base64(qrCodeWrapperProtoBufBytes),
    };
};

export default generateProtoBufs;
