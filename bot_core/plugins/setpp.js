import { downloadContentFromMessage } from 'baileys';
import sharp from 'sharp';
import { Buffer } from 'buffer';

export async function pp(parsed, client) {
    try {

        const remoteJid = parsed.remoteJid;
        const username = parsed.pushName || "User";

        // =============================
        // GET IMAGE SOURCE
        // =============================

        let imageMessage;

        // If quoted image
        if (parsed.isQuoted && parsed.quotedMessage?.imageMessage) {
            imageMessage = parsed.quotedMessage.imageMessage;
        }

        // If direct image
        else if (parsed.message?.imageMessage) {
            imageMessage = parsed.message.imageMessage;
        }

        if (!imageMessage) {
            return client.sendMessage(remoteJid, {
                text: "⚠️ Répondez à une image ou envoyez une image avec la commande."
            });
        }

        // =============================
        // DOWNLOAD IMAGE
        // =============================

        const stream = await downloadContentFromMessage(
            imageMessage,
            'image'
        );

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // =============================
        // PROCESS IMAGE
        // =============================

        const imageBuffer = await sharp(buffer)
            .resize(640, 640, {
                fit: 'cover' // avoid stretching
            })
            .png({ quality: 100 })
            .toBuffer();

        // =============================
        // UPDATE PROFILE PICTURE
        // =============================

        await client.updateProfilePicture(
            client.user.id,
            imageBuffer
        );

        await client.sendMessage(remoteJid, {
            text: "✅ Photo de profil mise à jour avec succès."
        });

    } catch (err) {
        console.error("Erreur PP:", err);

        await client.sendMessage(parsed.remoteJid, {
            text: "❌ Impossible de modifier la photo de profil."
        });
    }
}

export default pp;