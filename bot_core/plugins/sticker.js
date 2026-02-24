import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import webp from 'node-webpmux';
import { downloadContentFromMessage } from 'baileys';
import { Buffer } from 'buffer';

const MAX_SIZE = 1024 * 1024;
const MAX_DURATION = 7;

export async function sticker(parsed, client) {
    const username = parsed.pushName;

    if (!parsed.isQuoted) {
        return client.sendMessage(parsed.remoteJid, {
            text: '⚠️ Citez une image ou une courte vidéo.'
        });
    }

    const quoted = parsed.quotedMessage;

    try {
        // =============================
        // AUTOCOLLANT D'IMAGE
        // =============================
        if (quoted.imageMessage) {
            const stream = await downloadContentFromMessage(
                quoted.imageMessage,
                'image'
            );

            let buffer = Buffer.from([]);
            for await (const chunk of stream)
                buffer = Buffer.concat([buffer, chunk]);

            const webpBuffer = await sharp(buffer)
                .resize(512, 512, {
                    fit: 'cover' // recadrage intelligent, sans padding
                })
                .webp({ quality: 80 })
                .toBuffer();

            const finalSticker = await injectExif(webpBuffer, false, username);
            await client.sendMessage(parsed.remoteJid, {
                sticker: finalSticker
            });
            return;
        }

        // =============================
        // AUTOCOLLANT VIDÉO
        // =============================
        if (quoted.videoMessage) {
            const stream = await downloadContentFromMessage(
                quoted.videoMessage,
                'video'
            );

            const inputPath = './temp_input.mp4';
            const outputPath = './temp_output.webp';

            let buffer = Buffer.from([]);
            for await (const chunk of stream)
                buffer = Buffer.concat([buffer, chunk]);

            fs.writeFileSync(inputPath, buffer);

            let quality = 60;

            async function convert(q) {
                return new Promise((resolve, reject) => {
                    ffmpeg(inputPath)
                        .outputOptions([
                            '-t 7', // 🔥 ROGNE AUTOMATIQUEMENT À 7 SECONDES
                            '-vcodec libwebp',
                            '-vf scale=512:512:force_original_aspect_ratio=increase,crop=512:512,fps=12',
                            '-loop 0',
                            '-an',
                            '-vsync 0',
                            '-preset picture',
                            '-lossless 0',
                            '-compression_level 6',
                            `-q:v ${q}`
                        ])
                        .toFormat('webp')
                        .save(outputPath)
                        .on('end', resolve)
                        .on('error', reject);
                });
            }

            await convert(quality);

            let stats = fs.statSync(outputPath);
            while (stats.size > MAX_SIZE && quality > 20) {
                quality -= 10;
                await convert(quality);
                stats = fs.statSync(outputPath);
            }

            const webpBuffer = fs.readFileSync(outputPath);
            const finalSticker = await injectExif(webpBuffer, true, username);
            await client.sendMessage(parsed.remoteJid, {
                sticker: finalSticker
            });

            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            return;
        }

        return client.sendMessage(parsed.remoteJid, {
            text: '❌ Type de média non supporté.'
        });

    } catch (err) {
        console.error("Erreur d'autocollant :", err);
        return client.sendMessage(parsed.remoteJid, {
            text: '❌ Échec de la création de l\'autocollant.'
        });
    }
}

// =======================================
// INJECTION EXIF (Nom du pack + Auteur)
// =======================================
async function injectExif(webpBuffer, animated, username) {
    const img = new webp.Image();
    await img.load(webpBuffer);

    const metadata = {
        "sticker-pack-id": "cipher.monks.bot",
        "sticker-pack-name": animated
            ? username
            : username,
        "sticker-pack-publisher": username,
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

export default sticker;
