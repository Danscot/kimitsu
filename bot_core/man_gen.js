import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export async function manual(parsedMessage, client) {
    const remoteJid = parsedMessage.remoteJid;

    // Création du PDF
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        font: 'Courier' // Monospace
    });

	const tmpDir = path.join('./tmp');

	// Create tmp folder if it doesn't exist
	if (!fs.existsSync(tmpDir)) {
	    fs.mkdirSync(tmpDir);
	}

const filePath = path.join(tmpDir, `Kimitsu_Manual_${Date.now()}.pdf`);

    doc.pipe(fs.createWriteStream(filePath));

    // Titre
    doc
      .fontSize(20)
      .text('Kimitsu Bot - Manuel Utilisateur', { align: 'center' })
      .moveDown(1);

    // Contenu principal
    const content = `


1. INTRODUCTION
Kimitsu est un Mini bot WhatsApp.
Il vous permet de gérer les médias, les groupes et d'utiliser diverses commandes.
Suivez ce guide pour apprendre à connecter votre compte et utiliser les fonctionnalités.

2. CRÉATION DE COMPTE
- Allez sur : https://bot.danscot.dev
- Créez un compte utilisateur.
- Suivez le tutoriel pour connecter votre numéro au bot.
- Une fois connecté, votre numéro aura le bot activé automatiquement.

3. COMMANDES PRINCIPALES

[MÉDIAS]
- /vv : Contourner les “vues uniques”.
- /save : Sauvegarder directement les médias dans vos messages privés même les vues uniques.
- /sticker : Créer des stickers.

[TAGS]
- /tag : Mentionner tous les utilisateurs sur un message spécifique.
- /tagall : Tag tous les utilisateurs.
- /tagadmin : Tag uniquement les administrateurs.

[DOWNLOADER]
- /play : Télécharger de l’audio depuis YouTube.
- /tiktok : Télécharger des vidéos TikTok.

[CONFIGURATION]
- /setprefix : Modifier le préfixe des commandes.
- /antidel : Activer ou désactiver la récupération des messages supprimés.
- /settag : Définir le message automatique.
- /public : Activer/désactiver le mode public.
- /respons on: Activer la réponse automatique définie par /settag.
- /respons off : Désactiver la réponse automatique.

[STATUT]
- /status : Voir l’état du bot et le temps de fonctionnement.

4. CONSEILS D’UTILISATION
- Donnez les droits administrateur au bot uniquement si nécessaire.
- Utilisez les commandes de manière responsable.
- Pour tout problème, contactez l’administrateur : +237 670 701 984 (@danscot)

Merci d’utiliser Kimitsu Bot !
`;

    doc.fontSize(12).text(content, { lineGap: 2 });

    doc.end();

    // Envoi du PDF après création
    doc.on('finish', async () => {
        await client.sendMessage(remoteJid, {
            document: fs.createReadStream(filePath),
            fileName: 'Kimitsu_Manual.pdf',
            mimetype: 'application/pdf',
        }, { quoted: parsedMessage });

        // Optionnel : supprime le PDF après envoi
        fs.unlink(filePath, () => {});
    });
}

export default manual;