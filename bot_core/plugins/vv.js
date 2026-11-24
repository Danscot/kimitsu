import forward from '../utils/forward.js'

import { loadMessages } from '../utils/messageStore.js'

import fs from 'fs'

function getUserLidVariants(client) {

    const variants = new Set();

    const number = client.user?.id?.split(':')[0] || '';

    variants.add(number);

    if (number) {

        variants.add(`${number}@lid`);

        variants.add(`${number}@s.whatsapp.net`);

    }

    try {

        const credsPath = `sessions/${number}/creds.json`;

        if (fs.existsSync(credsPath)) {

            const data = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

            const meLid = data?.me?.lid;

            if (meLid) {

                variants.add(meLid);

                variants.add(meLid.split(':')[0]);

                variants.add(`${meLid.split(':')[0]}@lid`);

                variants.add(`${meLid.split(':')[0]}@s.whatsapp.net`);

            }

        }

    } catch (e) {

        // fallthrough

    }

    if (client.user?.lid) {

        variants.add(client.user.lid);

        variants.add(client.user.lid.split(':')[0]);

        variants.add(`${client.user.lid.split(':')[0]}@lid`);

    }

    return [...variants];

}

export async function vv(parser, client, args, message) {

    let originalMessage = null;

    const quotedId = parser.quotedMessageId;

    const quotedType = parser.quotedType;

    if (quotedId && quotedType) {

        try {

            const variants = getUserLidVariants(client);

            for (const userLid of variants) {

                if (!userLid) continue;

                const store = loadMessages(userLid);

                const stored = store[quotedId];

                if (stored && Array.isArray(stored) && stored.length >= 4) {

                    const messageObj = stored[3];

                    if (messageObj && messageObj[quotedType]) {

                        originalMessage = messageObj[quotedType];

                        console.log(`🔍 Found stored quoted message ${quotedId} via userLid ${userLid}`);

                        break;

                    }

                }

            }

            if (!originalMessage) {

                console.warn(`⚠️ Stored quoted message ${quotedId} not found in any store variant`);

            }

        } catch (err) {

            console.warn('⚠️ Could not look up stored quoted message:', err.message);

        }

    }

    await forward(parser.remoteJid, parser.quotedMessage, client, { originalMessage });

}

export default vv;
