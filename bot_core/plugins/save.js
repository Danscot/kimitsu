
import forward from '../utils/forward.js'


export async function save(parser, client, args, message) {

    const number = client.user?.id?.split(':')[0] || '';


    const targetJid = `${number}@s.whatsapp.net`;

    await forward(targetJid, parser.quotedMessage, client)
}

export default save;
