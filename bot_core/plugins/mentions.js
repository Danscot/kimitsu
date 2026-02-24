import forward from '../utils/forward.js';

export async function tag(parser, client) {
    const remoteJid = parser.remoteJid;

    if (!parser.isGroup) {
        await client.sendMessage(remoteJid, { text: '_⚠️ Cette commande ne fonctionne que dans les discussions de groupe._' });
        return;
    }

    if (!parser.isQuoted) {
        await client.sendMessage(remoteJid, { text: '_⚠️ Veuillez citer un message pour mentionner le groupe._' });
        return;
    }

    await forward(remoteJid, parser.quotedMessage, client, { mentions: true });
}

export async function tagall(parser, client) {
    const remoteJid = parser.remoteJid;

    // Uniquement dans les groupes
    if (!parser.isGroup) {
        await client.sendMessage(remoteJid, { text: '_⚠️ Cette commande est uniquement pour les groupes._' });
        return;
    }

    try {
        const groupMetadata = await client.groupMetadata(remoteJid);
        const participants = groupMetadata.participants.map(u => u.id);

        // Texte des mentions
        const mentionsText = participants.map(u => `➤ @${u.split('@')[0]}`).join('\n');

        const tagMessage = `
┏━━━━━━━━━━━━━━━━━━━┓
┃  📢 *Mention de groupe !* 📢  ┃
┗━━━━━━━━━━━━━━━━━━━┛

👥 *Groupe :* ${groupMetadata.subject}

${mentionsText}

💬 *Message de :* @${parser.participant?.split('@')[0] || 'Quelqu\'un'}
        `.trim();

        await client.sendMessage(remoteJid, { text: tagMessage, mentions: participants });

    } catch (error) {
        console.error("❌ _Erreur lors de la mention de tous :_", error);
    }
}

export async function tagadmin(parser, client) {
    const remoteJid = parser.remoteJid;

    // Uniquement dans les groupes
    if (!parser.isGroup) {
        await client.sendMessage(remoteJid, { text: '_⚠️ Cette commande est uniquement pour les groupes._' });
        return;
    }

    try {
        const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
        const { participants } = await client.groupMetadata(remoteJid);

        // Admins sauf le bot
        const admins = participants.filter(p => p.admin && p.id !== botNumber).map(p => p.id);

        if (!admins.length) {
            await client.sendMessage(remoteJid, { text: "Pas d'admins dans ce groupe." });
            return;
        }

        const text = `👮‍♂️ *Admins mentionnés :* \n${admins.map(u => `@${u.split('@')[0]}`).join('\n')}`;

        await client.sendMessage(remoteJid, { text, mentions: admins });

    } catch (error) {
        console.error("❌ Erreur lors de la mention des admins :", error);
        await client.sendMessage(remoteJid, { text: "❌ Erreur lors de la mention des admins !" });
    }
}

export default { tagall, tagadmin, tag };
