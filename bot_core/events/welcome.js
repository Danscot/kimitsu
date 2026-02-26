export default async function botWelcome(client) {

  const number = client.user?.id?.split(':')[0] + '@s.whatsapp.net' || '';

  // Compose the welcome message
  const welcomeText = `
╭━━━━━━━━━━━━━━━✦
┃  𝙱𝙾𝚃 𝚂𝚃𝙰𝚃𝚄𝚂
╰━━━━━━━━━━━━━━━✦
━━━━━━━━━━━━━━━✦
❍ Statut : 𝚅𝚘𝚝𝚛𝚎 𝙱𝚘𝚝 𝙺𝚒𝚖𝚒𝚝𝚜𝚞 𝚎𝚜𝚝 𝚊𝚌𝚝𝚒𝚏
❍ Créateur : @𝙳𝚊𝚗𝚜𝚌𝚘𝚝
❍ Plugins : 20
━━━━━━━━━━━━━━━✦

Pour voir toutes les commandes, tapez /menu
  	
`;

  await client.sendMessage(number, { text: welcomeText });

}