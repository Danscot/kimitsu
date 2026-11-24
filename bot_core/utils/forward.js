import { downloadContentFromMessage } from 'baileys';
import { Buffer } from 'buffer';

async function downloadMedia(msg, type) {

    const stream = await downloadContentFromMessage(msg, type);

    let buffer = Buffer.from([]);

    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    if (buffer.length === 0) throw new Error('empty buffer');

    return buffer;

}

export default async function forward(jid, quotedMessage, client, options = {}) {

    if (!jid || !quotedMessage) return;

    const { mentions = false, originalMessage = null } = options;

    let contextInfo = {};

    try {

        if (mentions) {

            const groupMetadata = await client.groupMetadata(jid);

            const participants = groupMetadata.participants.map(u => u.id);

            contextInfo = { mentionedJid: participants };

        }

        if (quotedMessage.conversation || quotedMessage.extendedTextMessage) {

            const text = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || '';

            await client.sendMessage(jid, { text, contextInfo });

        }

        else if (quotedMessage.imageMessage) {

            const sourceMsg = originalMessage && originalMessage.url ? originalMessage : quotedMessage.imageMessage;

            const buffer = await downloadMedia(sourceMsg, 'image');

            await client.sendMessage(jid, {

                image: buffer,

                caption: quotedMessage.imageMessage.caption || '',

                contextInfo

            });

        }

        else if (quotedMessage.videoMessage) {

            const sourceMsg = originalMessage && originalMessage.url ? originalMessage : quotedMessage.videoMessage;

            const buffer = await downloadMedia(sourceMsg, 'video');

            await client.sendMessage(jid, {

                video: buffer,

                caption: quotedMessage.videoMessage.caption || '',

                contextInfo

            });

        }

        else if (quotedMessage.audioMessage) {

            const sourceMsg = originalMessage && originalMessage.url ? originalMessage : quotedMessage.audioMessage;

            const buffer = await downloadMedia(sourceMsg, 'audio');

            await client.sendMessage(jid, {

                audio: buffer,

                mimetype: quotedMessage.audioMessage.mimetype,

                ptt: quotedMessage.audioMessage.ptt || false,

                contextInfo

            });

        }

        else if (quotedMessage.documentMessage) {

            const sourceMsg = originalMessage && originalMessage.url ? originalMessage : quotedMessage.documentMessage;

            const buffer = await downloadMedia(sourceMsg, 'document');

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

        console.error('❌ Forward error:', err.message);

        await client.sendMessage(jid, { text: '_❌ Something went wrong while forwarding the message._' });

    }
}
