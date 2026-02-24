import fs from 'fs';

import configManager from '../utils/manageConfigs.js';

export default async function setTag(parsedMessage, client) {

    const remoteJid = parsedMessage.remoteJid;

    const botNumber = client.user?.id?.split(':')[0] || '';

    const userConfig = configManager?.config?.users?.[botNumber] || {};

    const quoted = parsedMessage.isQuoted;

    if (!quoted) {

        return await client.sendMessage(remoteJid, { 

            text: "⚠️ Veuillez tag un message pour le définir comme auto-réponse." 

        });

    }

    // Save the quoted message in config
    userConfig.autoResponse = {

        enabled: userConfig.autoResponse?.enabled || false,

        message: parsedMessage.quotedMessage,
    };

    // Update config file
    configManager.config.users[botNumber] = userConfig;

    configManager.save();

    await client.sendMessage(remoteJid, { 

        text: "✅ Message cité enregistré comme auto-réponse !" 

    });

}