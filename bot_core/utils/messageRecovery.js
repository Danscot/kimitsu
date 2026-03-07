import { loadMessages } from './messageStore.js'
import configManager from './manageConfigs.js'
import { downloadContentFromMessage } from 'baileys'

export async function handleDeletedMessage(parsedMessage, client, lid) {

    if (!parsedMessage.isDeleted || !parsedMessage.deletedMessageId) return

    if (!lid) return

    if (parsedMessage.isFromMe) return

    const botNumber = client.user?.id?.split(':')[0] || ''

    const userConfig = configManager?.config?.users?.[botNumber] || {}

    const antidel = userConfig.antidel || "off"

    if (antidel === "off") return

    const targetJid =

        antidel === "me"

            ? botNumber + "@s.whatsapp.net"

            : parsedMessage.remoteJid

    const messages = loadMessages(lid)

    const deletedEntry = messages[parsedMessage.deletedMessageId]

    if (!deletedEntry) return

    const [messageType, content, participant, messageObj] = deletedEntry

    const mentionJid = parsedMessage.participant

    const username = mentionJid.split('@')[0]

    const warningText = `⚠️ Ce message a été supprimé par @${username}`

    try {
        // 🔹 AUTOCOLLANT (sans légende)
        if (messageType === 'stickerMessage') {
            const data = messageObj?.stickerMessage
            if (!data?.mediaKey) return

            const stream = await downloadContentFromMessage(data, 'sticker')
            const chunks = []
            for await (const chunk of stream) chunks.push(chunk)
            const buffer = Buffer.concat(chunks)

            const warningMsg = await client.sendMessage(
                targetJid,
                { text: warningText, mentions: [mentionJid] }
            )

            await client.sendMessage(
                targetJid,
                { sticker: buffer },
                { quoted: warningMsg }
            )

            return
        }

        // 🔹 IMAGE (supporte la légende)
        if (messageType === 'imageMessage') {
            const data = messageObj?.imageMessage
            if (!data?.mediaKey) return

            const stream = await downloadContentFromMessage(data, 'image')
            const chunks = []
            for await (const chunk of stream) chunks.push(chunk)

            await client.sendMessage(
                targetJid,
                {
                    image: Buffer.concat(chunks),
                    caption: `${warningText}\n\n${data.caption || ''}`,
                    mentions: [mentionJid]
                }
            )

            return
        }

        // 🔹 VIDÉO (supporte la légende)
        if (messageType === 'videoMessage') {
            const data = messageObj?.videoMessage
            if (!data?.mediaKey) return

            const stream = await downloadContentFromMessage(data, 'video')
            const chunks = []
            for await (const chunk of stream) chunks.push(chunk)

            await client.sendMessage(
                targetJid,
                {
                    video: Buffer.concat(chunks),
                    caption: `${warningText}\n\n${data.caption || ''}`,
                    mentions: [mentionJid]
                }
            )

            return
        }

        // 🔹 DOCUMENT (supporte la légende comme texte de nom de fichier)
        if (messageType === 'documentMessage') {
            const data = messageObj?.documentMessage
            if (!data?.mediaKey) return

            const stream = await downloadContentFromMessage(data, 'document')
            const chunks = []
            for await (const chunk of stream) chunks.push(chunk)

            await client.sendMessage(
                targetJid,
                {
                    document: Buffer.concat(chunks),
                    fileName: data.fileName || 'fichier',
                    mimetype: data.mimetype,
                    caption: warningText,
                    mentions: [mentionJid]
                }
            )

            return
        }

        // 🔹 AUDIO (sans légende)
        if (messageType === 'audioMessage') {
            const data = messageObj?.audioMessage
            if (!data?.mediaKey) return

            const stream = await downloadContentFromMessage(data, 'audio')
            const chunks = []
            for await (const chunk of stream) chunks.push(chunk)
            const buffer = Buffer.concat(chunks)

            const warningMsg = await client.sendMessage(
                targetJid,
                { text: warningText, mentions: [mentionJid] }
            )

            await client.sendMessage(
                targetJid,
                {
                    audio: buffer,
                    mimetype: data.mimetype || 'audio/ogg',
                    ptt: data.ptt || false
                },
                { quoted: warningMsg }
            )

            return
        }

        // 🔹 MESSAGE TEXTE
        if (messageType === 'conversation' || messageObj?.conversation) {
            await client.sendMessage(
                targetJid,
                {
                    text: `${warningText}\n\n${content || messageObj?.conversation || ''}`,
                    mentions: [mentionJid]
                }
            )

            return
        }

    } catch (err) {
        console.error("Échec de la transmission du message supprimé :", err)
    }
}
