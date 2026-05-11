import axios from "axios";
import stylizedChar from "../utils/fancy.js";
import configmanager from "../utils/configmanager.js";


function cleanGeminiResponse(text) {
    let cleaned = text
        .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/~~(.+?)~~/g, '$1')
        .replace(/^#+\s+/gm, '')
        .replace(/^\s*[-•*]\s+/gm, '• ')
        .replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
}

function refinePrompt(userPrompt, quotedContext = null) {
    let refined = `Tu es un assistant utile, concis et factuel. Réponds directement sans formatage markdown excessif. Évite les ** ** et __ __ inutiles.

${quotedContext ? `CONTEXTE (réponse à un message précédent):\n${quotedContext}\n---\n` : ''}QUESTION:\n${userPrompt}`;

    return refined;
}


async function gemini(client, message) {

    const token = 'yoshi2411107?GST Yoshi !444';
    const number = client?.user?.id.split(':')[0];
    const prefix = configmanager.config.users[number].prefix;

    const remoteJid = message?.key?.remoteJid;

    //custom reply
    const reply = async (text) => {
        await client.sendMessage(remoteJid, { text: text }, { quoted: message });
    };
    //react
    await client.sendMessage(remoteJid, { react: { text: "🧠", key: message.key } });

    const messageBody = message.message?.extendedTextMessage?.text || message.message?.conversation || '';
    const args = messageBody.slice(prefix.length + 2).trim(); // +1 pour l'espace après le préfixe

    let quotedText = null
    const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (quotedMessage) {
                quotedText = quotedMessage.conversation
                    || quotedMessage.extendedTextMessage?.text
                    || quotedMessage.imageMessage?.caption
                    || "[Message quoted - contenu non disponible]";
            }

    if (!args || args.length <= 0) {
        await reply('please enter a valid query.');
        console.log('no query while entering command.');
        return;
    }

    try {
        const reqAi = refinePrompt(args, quotedText)
        const apiUrl = `https://ghost-yoshi-proxy-gemini-1gyr.vercel.app/ask?prompt=${encodeURIComponent(reqAi)}&token=${token}`;
        const response = await axios.get(apiUrl);
        const { answer: IAResponse } = response.data; // réponse depuis FastAPI

        if (!IAResponse) {
            await reply("💔 Server didn't reply anything, please retry later");
            console.log("error while using ai command: server didn't reply");
        } else {
            const cleanedResponse = cleanGeminiResponse(IAResponse)
            const botResponse = `💬 ${cleanedResponse}`;
            await reply(botResponse);
            console.log("Data sent successfully: ", botResponse);
        }

    } catch (e) {
        console.log('error while using ai command: ', e);
        await reply('Error while using AI command.');
    }
}

export default gemini;
