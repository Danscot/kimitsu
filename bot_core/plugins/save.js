
import forward from '../utils/forward.js'


export async function save(parser, client, args, message) {

    await forward(parser.participant, parser.quotedMessage, client)
}

export default save;
