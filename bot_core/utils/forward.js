import { downloadContentFromMessage } from 'baileys';
import { Buffer } from 'buffer';

export default async function forward(jid, quotedMessage, client, options = {}) {

    if (!jid || !quotedMessage) return;

    const { mentions = false } = options;

    let contextInfo = {};

    try {

        // If mentions are requested, fetch group participants
        if (mentions) {
            const groupMetadata = await client.groupMetadata(jid);
            const participants = groupMetadata.participants.map(u => u.id);
            contextInfo = { mentionedJid: participants };
        }

        // TEXT
        if (quotedMessage.conversation || quotedMessage.extendedTextMessage) {
            const text = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || '';
            await client.sendMessage(jid, {
                text,
                contextInfo
            });
        }

        // IMAGE
        else if (quotedMessage.imageMessage) {
            const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await client.sendMessage(jid, {
                image: buffer,
                caption: quotedMessage.imageMessage.caption || '',
                contextInfo
            });
        }

        // VIDEO
        else if (quotedMessage.videoMessage) {
            const stream = await downloadContentFromMessage(quotedMessage.videoMessage, 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await client.sendMessage(jid, {
                video: buffer,
                caption: quotedMessage.videoMessage.caption || '',
                contextInfo
            });
        }

        // AUDIO
        else if (quotedMessage.audioMessage) {
            const stream = await downloadContentFromMessage(quotedMessage.audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await client.sendMessage(jid, {
                audio: buffer,
                mimetype: quotedMessage.audioMessage.mimetype,
                ptt: quotedMessage.audioMessage.ptt || false,
                contextInfo
            });
        }

        // DOCUMENT
        else if (quotedMessage.documentMessage) {
            const stream = await downloadContentFromMessage(quotedMessage.documentMessage, 'document');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            await client.sendMessage(jid, {
                document: buffer,
                mimetype: quotedMessage.documentMessage.mimetype,
                fileName: quotedMessage.documentMessage.fileName || 'file',
                contextInfo
            });
        }

        else {
            await client.sendMessage(jid, { text: '_❌ Unsupported message type._' });
        }

    } catch (err) {
        console.error('❌ Forward error:', err);
        await client.sendMessage(jid, { text: '_❌ Something went wrong while forwarding the message._' });
    }
}