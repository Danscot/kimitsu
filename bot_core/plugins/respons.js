
import configManager from '../utils/manageConfigs.js';

export  default async function respons(parsedMessage, client, args) {

    const remoteJid = parsedMessage.remoteJid;

    const botNumber = client.user?.id?.split(':')[0] || '';

    const userConfig = configManager?.config?.users?.[botNumber] || {};

    const state =  args.join('') || '';

    if (!["on", "off"].includes(state)) {

        return await client.sendMessage(remoteJid, { text: "⚠️ Usage: /respons on | off" });
    }

    userConfig.autoResponse = userConfig.autoResponse || {};

    userConfig.autoResponse.enabled = state === "on";

    configManager.config.users[botNumber] = userConfig;

    configManager.save();

    await client.sendMessage(remoteJid, { text: `✅ Auto-réponse ${state === "on" ? "activée" : "désactivée"} !` });
}