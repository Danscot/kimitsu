import configHelper from '../utils/manageConfigs.js';

/**
 * Modifier la liste des sudo (ajouter/supprimer) pour un numéro spécifique
 */
export async function modifySudoList(parsed, client, action) {

    try {

        const remoteJid = parsed.remoteJid;
        if (!remoteJid) throw new Error("JID distant invalide.");

        const userNumber = client.user?.id?.split(':')[0] || '';

        // S'assurer que la config existe pour ce numéro
        if (!configHelper.config.users[userNumber]) {
            configHelper.config.users[userNumber] = { prefix: "/", antidel: false, respons: false, public: false, sudo: [] };
        }

        const list = configHelper.config.users[userNumber].sudo || [];

        // Déterminer le participant : soit depuis un message cité, soit depuis les arguments
        let participant;

        if (parsed.isQuoted && parsed.quotedParticipant) {
            participant = parsed.quotedParticipant.split("@")[0];
        } else {
            const args = typeof parsed.normalizedContent === 'string'
                ? parsed.normalizedContent.trim().split(/\s+/).slice(1)
                : [];
            if (!args[0]) throw new Error("Aucun participant spécifié.");
            const match = args[0].match(/\d+/);
            if (!match) throw new Error("Format de participant invalide.");
            participant = match[0];
        }

        // Exécuter l'action
        if (action === "add") {
            if (!list.includes(participant)) {
                list.push(participant);
                await client.sendMessage(remoteJid, { text: `✅ _${participant} est maintenant un utilisateur sudo_` });
            } else {
                await client.sendMessage(remoteJid, { text: `⚠️ _${participant} est déjà un utilisateur sudo_` });
            }
        } else if (action === "remove") {
            const index = list.indexOf(participant);
            if (index !== -1) {
                list.splice(index, 1);
                await client.sendMessage(remoteJid, { text: `🚫 _${participant} n'est plus un utilisateur sudo_` });
            } else {
                await client.sendMessage(remoteJid, { text: `⚠️ _${participant} n'était pas un utilisateur sudo_` });
            }
        }

        // Sauvegarder la liste mise à jour dans la config de l'utilisateur
        configHelper.config.users[userNumber].sudo = list;
        configHelper.save();

    } catch (error) {
        console.error("❌ Erreur dans modifySudoList :", error);
        await client.sendMessage(parsed.remoteJid, { text: `❌ Erreur : Impossible de modifier les sudo. ${error.message}` });
    }
}

/** Ajouter un utilisateur sudo */
export async function sudo(parsed, client) {
    await modifySudoList(parsed, client, "add");
}

/** Supprimer un utilisateur sudo */
export async function delsudo(parsed, client) {
    await modifySudoList(parsed, client, "remove");
}

/** Lister tous les sudo pour ce numéro */
export async function getsudo(parsed, client) {

    const remoteJid = parsed.remoteJid;
    const userNumber = remoteJid.split('@')[0];
    const list = configHelper.config.users[userNumber]?.sudo || [];

    if (!list.length) {
        await client.sendMessage(remoteJid, { text: "⚠️ La liste des sudo est actuellement vide." });
        return;
    }

    let msg = `📜 *Liste des utilisateurs sudo* :\n\n`;
    list.forEach((u, i) => {
        msg += `${i + 1}. ${u}\n`;
    });

    await client.sendMessage(remoteJid, { text: msg });
}

export default { sudo, delsudo, getsudo };