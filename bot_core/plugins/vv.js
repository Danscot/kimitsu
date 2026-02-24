
import forward from '../utils/forward.js'


export async function vv(parser, client, args, message) {

    await forward(parser.remoteJid, parser.quotedMessage, client)
}

export default vv;
