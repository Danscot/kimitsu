import axios from 'axios';

const API_KEY = "AIzaSyDV11sdmCCdyyToNU-XRFMbKgAA4IEDOS0"; // Clé YouTube Data API
const FASTAPI_URL = "https://api.danscot.dev/api"; // Ton API FastAPI

export async function play(parser, client) {
    const remoteJid = parser.remoteJid;
    const messageBody = parser.normalizedContent || '';

    try {
        // 1. Récupérer le titre de la vidéo
        const title = getArg(messageBody);
        if (!title) {
            await client.sendMessage(remoteJid, { text: '❌ Veuillez fournir un titre de vidéo.' });
            return;
        }

        console.log(`🎯 Recherche YouTube (API) : ${title}`);

        // 2. Envoyer un message de recherche en cours
        await client.sendMessage(remoteJid, {
            text: `> _*Recherche et traitement : ${title}*_`,
            quoted: parser.messageContent,
        });

        // 3. Rechercher la vidéo sur YouTube
        const searchUrl = `https://www.googleapis.com/youtube/v3/search`;
        const { data: searchData } = await axios.get(searchUrl, {
            params: {
                part: "snippet",
                q: title,
                type: "video",
                maxResults: 1,
                key: API_KEY,
            },
        });

        if (!searchData.items || searchData.items.length === 0) {
            throw new Error("Aucune vidéo trouvée.");
        }

        const video = searchData.items[0];
        const videoId = video.id.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const videoTitle = video.snippet.title;
        const thumbnail = video.snippet.thumbnails.high.url;

        console.log(`🎯 Vidéo trouvée : ${videoTitle} (${videoUrl})`);

        // 4. Afficher les infos de la vidéo AVANT le téléchargement
        await client.sendMessage(remoteJid, {
            image: { url: thumbnail },
            caption: `
> 🎵 *Titre : ${videoTitle}*
> 🔗 *Lien : ${videoUrl}*
> 📥 *Téléchargement en cours...*

> *Power by Danscot*
            `.trim(),
            quoted: parser.messageContent,
        });

        // 5. Appeler l'API FastAPI pour télécharger l'audio
        const apiUrl = `${FASTAPI_URL}/youtube/downl/?url=${encodeURIComponent(videoUrl)}&fmt="mp3"`;
        const { data } = await axios.get(apiUrl);

        if (data.status !== 'ok' || !data.results?.download_url) {
            
            throw new Error('❌ Échec de la récupération de l\'audio depuis l\'API.');
        }

        const downloadUrl = data.results.download_url;

        // 6. Envoyer l'audio
        await client.sendMessage(remoteJid, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${videoTitle}.mp3`,
            ptt: false,
            quoted: parser.messageContent,
        });

        console.log(`✅ Audio envoyé : ${videoTitle}.mp3`);

    } catch (err) {
        console.error('❌ Erreur dans la commande play :', err);
        await client.sendMessage(remoteJid, {
            text: `❌ Échec de la lecture : ${err.message}`,
            quoted: parser.messageContent,
        });
    }
}

// Extraire le titre de la vidéo depuis le message de l'utilisateur
function getArg(body) {
    const parts = body.trim().split(/\s+/);
    return parts.length > 1 ? parts.slice(1).join(' ') : null;
}

export default play;
