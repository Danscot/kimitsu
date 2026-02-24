import path from 'path';
import fs from 'fs';

export async function manual(parsedMessage, client) {

    const remoteJid = parsedMessage.remoteJid;

    // Chemin vers votre PDF du manuel
    const pdfPath = path.resolve('./data/manual/man.pdf');

    // Vérifier si le fichier existe
    if (!fs.existsSync(pdfPath)) {

        return await client.sendMessage(remoteJid, {

            text: '❌ Manuel PDF introuvable !'

        });
    }

    await client.sendMessage(remoteJid, {

        document: fs.readFileSync(pdfPath),

        fileName: 'Kimitsu_Bot_Manuel.pdf',

        mimetype: 'application/pdf',

        caption: '📄 Voici le manuel officiel de Kimitsu Bot. Suivez attentivement les instructions !',

    });
}

export default manual;