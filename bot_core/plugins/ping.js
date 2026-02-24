
export async function pingCommand(parser, client) {

    const remoteJid = parser.remoteJid;

    // Record the start time
    const startTime = Date.now();

    // Send a ping message
    const sentMessage = await client.sendMessage(remoteJid, { text: '_Pong!_' });

    // Calculate the latency
    const endTime = Date.now();
    
    const latency = endTime - startTime;

    // Send the latency result back to the user
    await client.sendMessage(remoteJid, {

        text: `_speed: ${latency} ms_\n`,

    });
}

export default pingCommand;
