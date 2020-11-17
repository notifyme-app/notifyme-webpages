import protobuf from 'protobufjs'
import _sodium from 'libsodium-wrappers-sumo'
import qrMessage from './protobuf/qrMessage'
import seedMessage from './protobuf/seedMessage'

const rootQr = protobuf.Root.fromJSON(qrMessage);
const QRCodeContent = rootQr.lookupType("qrpackage.QRCodeContent");
const QRCodeWrapper = rootQr.lookupType("qrpackage.QRCodeWrapper");

const rootSeed = protobuf.Root.fromJSON(seedMessage);
const SeedMessage = rootSeed.lookupType("seedpackage.SeedMessage");

const generateProtoBufs = async (name, location, room, venueType, public_key) => {
    await _sodium.ready;
    const sodium = _sodium;

    const authorityPublicKey = sodium.from_hex(`${public_key}`);

    const salt = sodium.randombytes_buf(32);
    const notificationKey = sodium.crypto_secretbox_keygen();

    let seedMessage = SeedMessage.create({
        salt: salt,
        notificationKey: notificationKey,
        name: name,
        location: location,
        room: room
    });
    const seed = SeedMessage.encode(seedMessage).finish();

    const { publicKey, privateKey } = sodium.crypto_sign_seed_keypair(sodium.crypto_hash_sha256(seed));

    let qrCodeContent = QRCodeContent.create({
        version: 1,
        publicKey: publicKey,
        name: name,
        location: location,
        room: room,
        venueType: venueType,
        notificationKey: notificationKey,
    });

    const qrCodeContentProtoBufBytes = QRCodeContent.encode(qrCodeContent).finish();
    const qrCodeContentSignature = sodium.crypto_sign_detached(qrCodeContentProtoBufBytes, privateKey);

    let qrCodeWrapper = QRCodeWrapper.create({
        version: 1,
        content: qrCodeContent,
        signature: qrCodeContentSignature
    });

    const ctx = sodium.crypto_box_seal(seed, authorityPublicKey);
    const qrCodeWrapperProtoBufBytes = QRCodeWrapper.encode(qrCodeWrapper).finish();

    return {
        privateMessage: sodium.to_base64(ctx),
        publicMessage: sodium.to_base64(qrCodeWrapperProtoBufBytes)
    };
}

export default generateProtoBufs;