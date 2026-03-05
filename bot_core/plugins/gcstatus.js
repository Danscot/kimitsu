import { prepareWAMessageMedia, downloadContentFromMessage } from "baileys";
import fs from "fs";

export async function gcstatus(parsed, client, text = null) {
    const from = parsed.remoteJid;
    if (!from || !parsed.isGroup) return false;

    const quoted = parsed.quotedMessage;
    let statusPayload = null;

    // ---------- TEXTE ----------
    let msgText = null;

    if (text && typeof text === "string") {
        msgText = text.trim();
    } else if (quoted?.conversation || quoted?.extendedTextMessage?.text) {
        msgText = quoted.conversation || quoted.extendedTextMessage.text;
    } else if (parsed.normalizedContent) {
        const raw = parsed.normalizedContent.toString();
        msgText = raw.replace(/^\/gcstatus\s*/i, ''); // supprime la commande
    }


    // ---------- IMAGE ----------
    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(
            quoted.imageMessage,
            "image"
        );
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const media = await prepareWAMessageMedia(
            { image: buffer },
            { upload: client.waUploadToServer }
        );

        statusPayload = {
            groupStatusMessageV2: {
                message: {
                    imageMessage: {
                        ...media.imageMessage,
                        caption: quoted.imageMessage.caption || ""
                    }
                }
            }
        };
    }

    // ---------- VIDÉO ----------
    else if (quoted?.videoMessage) {
        const stream = await downloadContentFromMessage(
            quoted.videoMessage,
            "video"
        );
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const media = await prepareWAMessageMedia(
            { video: buffer },
            { upload: client.waUploadToServer }
        );

        statusPayload = {
            groupStatusMessageV2: {
                message: {
                    videoMessage: {
                        ...media.videoMessage,
                        caption: quoted.videoMessage.caption || ""
                    }
                }
            }
        };
    }

    // ---------- AUDIO ----------
    else if (quoted?.audioMessage) {
        const stream = await downloadContentFromMessage(
            quoted.audioMessage,
            "audio"
        );
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const media = await prepareWAMessageMedia(
            { audio: buffer },
            { upload: client.waUploadToServer }
        );

        statusPayload = {
            groupStatusMessageV2: {
                message: {
                    audioMessage: {
                        ...media.audioMessage,
                        ptt: quoted.audioMessage.ptt || false
                    }
                }
            }
        };
    }

    else if (msgText) {
        statusPayload = {
            groupStatusMessageV2: {
                message: {
                    extendedTextMessage: { text: msgText }
                }
            }
        };
    }

    if (!statusPayload) return false;

    await client.relayMessage(from, statusPayload, {});
    return true;
}

export default gcstatus;
