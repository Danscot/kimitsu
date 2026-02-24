import configHelper from '../utils/manageConfigs.js';

export async function prefix(parsed, client, args) {
    const remoteJid = parsed.remoteJid;
    const number = client.user?.id?.split(':')[0] || '';
    const sudoList = configHelper.config.sudo || [];

    // Seuls le bot ou les utilisateurs sudo peuvent modifier le préfixe
    const sender = parsed.participant?.split('@')[0];

    if (!parsed.isFromMe && !sudoList.includes(sender)) {
        await client.sendMessage(remoteJid, {
            text: '❌ Seuls les utilisateurs sudo ou le bot lui-même peuvent modifier le préfixe.'
        });
        return;
    }

    // Récupérer le nouveau préfixe depuis les arguments ; vide si aucun fourni
    const newPrefix = args.join('') || '';

    // S'assurer que la configuration utilisateur existe
    if (!configHelper.config.users[number]) {
        configHelper.config.users[number] = {};
    }

    configHelper.config.users[number].prefix = newPrefix;
    configHelper.save();

    await client.sendMessage(remoteJid, {
        text: `✅ Préfixe mis à jour. Préfixe actuel : *${newPrefix || '(vide, tapez les commandes directement)'}*`
    });
}

export default prefix;
