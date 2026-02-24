import configHelper from '../utils/manageConfigs.js';

export async function publicMode(parsed, client, args) {

    const remoteJid = parsed.remoteJid;
    const number = client.user?.id?.split(':')[0] || '';
    const sudoList = configHelper.config.sudo || [];

    // Seul le bot ou les utilisateurs sudo peuvent changer le mode public
    const sender = parsed.participant?.split('@')[0];
    if (!parsed.isFromMe && !sudoList.includes(sender)) {
        await client.sendMessage(remoteJid, {
            text: '❌ Seuls les utilisateurs sudo ou le bot lui-même peuvent changer le mode public.'
        });
        return;
    }

    if (!args[0]) {
        await client.sendMessage(remoteJid, {
            text: `❌ Veuillez spécifier "on" ou "off". Mode public actuel : ${configHelper.config.users[number]?.public || false}`
        });
        return;
    }

    const value = args[0].toLowerCase() === 'on';

    // S'assurer que la configuration de l'utilisateur existe
    if (!configHelper.config.users[number]) configHelper.config.users[number] = {};

    configHelper.config.users[number].public = value;
    configHelper.save();

    await client.sendMessage(remoteJid, {
        text: `✅ Le mode public est maintenant *${value ? 'ACTIVÉ' : 'DÉSACTIVÉ'}*`
    });
}

export default publicMode;