import configManager from '../utils/manageConfigs.js'

export async function info(parsedMessage, client) {

    const remoteJid = parsedMessage.remoteJid

    const today = new Date()
    const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    const currentDay = daysOfWeek[today.getDay()]
    const currentDate = today.getDate()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()

    const botNumber = client.user?.id?.split(':')[0] || ''
    const userConfig = configManager?.config?.users?.[botNumber] || {}

    const prefix = userConfig.prefix || "/"
    const arrow = userConfig.menuArrow || "➤"

    const username = parsedMessage.pushName || "Unknown"

    const menuText = `
╭━━━━━━━━━━━━━━━✦
┃  𝙆𝙞𝙢𝙞𝙩𝙨𝙪 𝙈𝙚𝙣𝙪
╰━━━━━━━━━━━━━━━✦

━━━━━━━━━━━━━━✦
❍ ᴘʀᴇꜰɪx : ${prefix}
❍ ʜᴇʟʟᴏ : ${username}
❍ ᴅᴀᴛᴇ : ${currentDate}/${currentMonth}/${currentYear}
━━━━━━━━━━━━━━✦

╭━❍  ꜱʏꜱ
${arrow} ${prefix}menu
${arrow} ${prefix}help
${arrow} ${prefix}status
╰━━━━━━━━━━━━━━━╯

╭━❍  ᴄᴏɴꜰɪɢ
${arrow} ${prefix}public
${arrow} ${prefix}settag
${arrow} ${prefix}respons
${arrow} ${prefix}antidel
${arrow} ${prefix}setprefix
╰━━━━━━━━━━━━━━━╯

╭━❍  ᴍᴇᴅɪᴀ
${arrow} ${prefix}vv
${arrow} ${prefix}save
${arrow} ${prefix}sticker
${arrow} ${prefix}gcstatus
╰━━━━━━━━━━━━━━━╯

╭━❍  ᴅᴏᴡɴʟᴏᴀᴅᴇʀ
${arrow} ${prefix}play
${arrow} ${prefix}tiktok
╰━━━━━━━━━━━━━━━╯

╭━❍  ᴜᴛɪʟꜱ
${arrow} ${prefix}sudo
${arrow} ${prefix}delsudo
${arrow} ${prefix}getsudo
╰━━━━━━━━━━━━━━━╯

╭━❍  ᴛᴀɢꜱ
${arrow} ${prefix}tag
${arrow} ${prefix}tagall
${arrow} ${prefix}tagadmin
╰━━━━━━━━━━━━━━━╯


Powered By Danscot
`

    // Send image + menu
    t = await client.sendMessage(remoteJid, {
        image: { url: "data/media/menu.jpg" },
        caption: menuText,
        quoted: parsedMessage
    })

    // Send audio
    await client.sendMessage(remoteJid, {
        audio: { url: "data/media/menu.mp3" },
        mimetype: 'audio/mp4',
        ptt: false,
        quoted: t
    })
}

export default info;