import configManager from '../utils/manageConfigs.js';

function formatUptime(ms) {

    let seconds = Math.floor(ms / 1000);

    const days = Math.floor(seconds / 86400);

    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);

    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);

    seconds %= 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export async function status(parsedMessage, client, args, message) {

    const remoteJid = parsedMessage.remoteJid;

    const botNumber = client.user?.id?.split(':')[0] || '';

    const botConfig = configManager?.config?.users?.[botNumber] || {};

    // Calculate uptime
    const startTime = botConfig.start || Date.now();

    const uptimeMs = Date.now() - startTime;

    const uptime = formatUptime(uptimeMs);

    // Calculate simple speed test (latency)
    const start = Date.now();

    await client.sendPresenceUpdate('composing', remoteJid).catch(() => {});

    const latency = Date.now() - start;

    // Build message in your fancy box style
    const arrow = botConfig.menuArrow || "➤";

    const t = `
╭━━━━━━━━━━━━━━━✦
┃  𝙱𝙾𝚃 𝚂𝚃𝙰𝚃𝚄𝚂
╰━━━━━━━━━━━━━━━✦
━━━━━━━━━━━━━━━✦
❍ Uptime : ${uptime}
❍ Latency : ${latency}ms
❍ Prefix  : ${botConfig.prefix}
❍ Plugins : 22
━━━━━━━━━━━━━━━✦
`;

    await client.sendMessage(remoteJid, {

        text: t,

        quoted: message

    });

}

export default status;