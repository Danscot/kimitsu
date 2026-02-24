import axios from 'axios';

export async function tiktok(parser, client) {
  const remoteJid = parser.remoteJid;
  const messageBody = parser.normalizedContent || '';

  try {
    const url = getArg(messageBody);

    if (!url || !url.includes('tiktok.com')) {
      await client.sendMessage(remoteJid, {
        text: '❌ Veuillez fournir une URL TikTok valide.'
      });
      return;
    }

    console.log(`🎯 Traitement de l'URL TikTok : ${url}`);

    await client.sendMessage(remoteJid, {
      text: '> _*Téléchargement de la vidéo TikTok en cours...*_',
      quoted: parser.messageContent,
    });

    // Appel à l'API
    const apiUrl = `https://api.danscot.dev/api/tiktok/download?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    console.log(data);

    if (data.status !== 'ok' || !Array.isArray(data.results) || data.results.length === 0) {
      throw new Error('❌ Aucune vidéo téléchargeable trouvée.');
    }

    // Choisir la meilleure vidéo : HD > MP4 > Avec filigrane
    const videoResult =
      data.results.find(r => r.type === 'mp4') ||
      data.results.find(r => r.type === 'hd') ||
      data.results.find(r => r.type === 'watermark');

    if (!videoResult) {
      throw new Error('❌ Aucune vidéo disponible à télécharger.');
    }

    console.log(`🎯 Envoi de la vidéo : ${videoResult.label}`);

    // Envoyer la vidéo via WhatsApp
    await client.sendMessage(remoteJid, {
      video: { url: videoResult.url },
      mimetype: 'video/mp4',
      caption: `> 🎵 Vidéo TikTok : ${videoResult.label}\n> Power by Danscot`,
      quoted: parser.messageContent,
    });

    console.log('✅ Vidéo TikTok envoyée.');

  } catch (err) {
    console.error('❌ Erreur dans la commande TikTok :', err);
    await client.sendMessage(remoteJid, {
      text: `❌ Échec du téléchargement de la vidéo TikTok : ${err.message}`
    });
  }
}

// Extraire l'URL TikTok du message de l'utilisateur
function getArg(body) {
  const parts = body.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ') : null;
}

export default tiktok;
