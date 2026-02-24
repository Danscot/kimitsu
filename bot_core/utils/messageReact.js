
export async function react(parser, client, args, message) {

    const remoteJid = parser.remoteJid;

   await client.sendMessage(remoteJid, 

        {
            react: {
                text: '🦋',

                key: message.key
            }
        }

    )

}


export default react;