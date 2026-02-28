import webp from 'node-webpmux';

import { downloadContentFromMessage } from 'baileys';

import { Buffer } from 'buffer';

export async function take(parsed, client, args) {

    const username = parsed.pushName || "Unknown";
    const argsText = args.join(' ');

    // Must quote something
    if (!parsed.isQuoted) {
        return client.sendMessage(parsed.remoteJid, {
            text: '⚠️ Citez un autocollant.'
        });
    }

    const quoted = parsed.quotedMessage;

    // Must be a sticker
    if (!quoted?.stickerMessage) {
        return client.sendMessage(parsed.remoteJid, {
            text: '❌ Ce message n’est pas un autocollant.'
        });
    }

    try {

        // =============================
        // DOWNLOAD STICKER
        // =============================
        const stream = await downloadContentFromMessage(
            quoted.stickerMessage,
            'sticker'
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const isAnimated = quoted.stickerMessage.isAnimated;

        // =============================
        // REWRITE EXIF
        // =============================
        const finalSticker = await rewriteExif(
            buffer,
            isAnimated,
            argsText,
            username
        );

        // =============================
        // SEND BACK
        // =============================
        await client.sendMessage(parsed.remoteJid, {
            sticker: finalSticker
        });

    } catch (err) {
        console.error('Erreur take:', err);
        return client.sendMessage(parsed.remoteJid, {
            text: '❌ Impossible de modifier l’autocollant.'
        });
    }
}


// =======================================
// EXIF REWRITE
// =======================================
async function rewriteExif(webpBuffer, animated, argsText, username) {

    const img = new webp.Image();
    await img.load(webpBuffer);

    // If args exist → pack name = args / publisher = empty
    // If no args → both = username
    const packName = argsText && argsText !== ""
        ? argsText
        : username;

    const publisher = argsText && argsText !== ""
        ? ""
        : username;

    const metadata = {
        "sticker-pack-id": "cipher.monks.bot.take",
        "sticker-pack-name": packName,
        "sticker-pack-publisher": publisher,
        "emojis": ["🔥"]
    };

    const json = Buffer.from(JSON.stringify(metadata), 'utf8');

    const exifAttr = Buffer.concat([
        Buffer.from([
            0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,
            0x01,0x00,0x41,0x57,0x07,0x00
        ]),
        Buffer.from([
            json.length,0x00,0x00,0x00,
            0x16,0x00,0x00,0x00
        ])
    ]);

    img.exif = Buffer.concat([exifAttr, json]);

    return await img.save(null);
}

export default take;