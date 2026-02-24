import configManager from '../utils/manageConfigs.js';

export async function antidel(parsedMessage, client, args) {

    try {

        const remoteJid = parsedMessage.remoteJid;

        const userNumber =  client.user?.id?.split(':')[0] || '';

        // Ensure user config exists
        if (!configManager.config.users[userNumber]) {

            configManager.config.users[userNumber] = {

                prefix: "/",
                antidel: "off",   // par défaut désactivé
                respons: false,
                public: false,
                sudo: []
            };
        }

        const userConfig = configManager.config.users[userNumber];

        // Determine new mode
        const mode = args[0]?.toLowerCase() || ""; // on | me | off

        if (!["on", "me", "off"].includes(mode)) {

            await client.sendMessage(remoteJid, {

                text: `❌ Mode invalide. Utilisez : on | me | off`
            });

            return;
        }

        userConfig.antidel = mode;

        configManager.save();

        await client.sendMessage(remoteJid, {

            text: `✅ Mode anti-suppression mis à jour sur *${mode}*`
        });

    } catch (err) {

        console.error("Erreur lors de l'exécution de la commande antidel:", err);

        await client.sendMessage(parsedMessage.remoteJid, {

            text: `❌ Échec de la mise à jour de l'anti-suppression : ${err.message}`

        });
    }
}

export default antidel;