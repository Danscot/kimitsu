import configManager from '../utils/manageConfigs.js';
import { downloadContentFromMessage } from 'baileys';
import fs from 'fs';
import path from 'path';

export default async function handleMentions(parsedMessage, client, args, message) {

    const remoteJid = parsedMessage.remoteJid;

    const botNumber = client.user?.id?.split(':')[0] || '';

    const userConfig = configManager?.config?.users?.[botNumber] || {};

    const autoResp = userConfig.autoResponse;

    // Ignore messages from the bot itself
    if (parsedMessage.isFromMe) return;

    // Check auto-response is enabled and a message is set
    if (!autoResp?.enabled || !autoResp?.message) return;

    // Check if bot is mentioned in the message
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    const botJid = botNumber;

    let userLid = '';

    try {

        const data = JSON.parse(fs.readFileSync(`sessions/${number}/creds.json`, 'utf8'));

        userLid = data?.me?.lid || client.user?.lid || '';

    } catch (e) {

        userLid = client.user?.lid || '';
    }

    const lid = userLid ? userLid.split(':')[0] + "@lid" : [];

    if (mentionedJids.includes(lid)) { // bot not mentioned

        const msg = autoResp.message;

        try {
            // === TEXT ===
            if (msg.conversation) {
                await client.sendMessage(remoteJid, { text: msg.conversation }, { quoted: message });
            }

            // === IMAGE ===
            else if (msg.imageMessage) {
                const stream = await downloadContentFromMessage(msg.imageMessage, 'image');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                await client.sendMessage(remoteJid, { image: buffer, caption: msg.imageMessage.caption || '' }, { quoted: message });
            }

            // === VIDEO ===
            else if (msg.videoMessage) {
                const stream = await downloadContentFromMessage(msg.videoMessage, 'video');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                await client.sendMessage(remoteJid, { video: buffer, caption: msg.videoMessage.caption || '' }, { quoted: message });
            }

            // === STICKER ===
            else if (msg.stickerMessage) {
                const stream = await downloadContentFromMessage(msg.stickerMessage, 'sticker');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                await client.sendMessage(remoteJid, { sticker: buffer }, { quoted: message });
            }

            // === AUDIO ===
            else if (msg.audioMessage) {
                const stream = await downloadContentFromMessage(msg.audioMessage, 'audio');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                await client.sendMessage(remoteJid, { audio: buffer, mimetype: 'audio/mp4', ptt: false }, { quoted: message });
            }

            // === DOCUMENT ===
            else if (msg.documentMessage) {
                const stream = await downloadContentFromMessage(msg.documentMessage, 'document');
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                await client.sendMessage(remoteJid, { document: buffer, mimetype: msg.documentMessage.mimetype, fileName: msg.documentMessage.fileName, caption: msg.documentMessage.caption || '' }, { quoted: message });
            }

        } catch (err) {
            console.error("Erreur lors de l'envoi de l'auto-réponse:", err);
        }

    }
}