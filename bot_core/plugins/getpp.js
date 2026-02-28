export async function getpp(parsed, client, args, message) {

    const remoteJid = parsed.remoteJid;
    let targetJid;

    try {

        // 1️⃣ Mention
        const mentioned = message?.message?.extendedTextMessage?.contextInfo?.mentionedJid;

        if (mentioned && mentioned.length > 0) {
            targetJid = mentioned[0];
        }

        // 2️⃣ Quoted
        else if (parsed.isQuoted && parsed.quotedParticipant) {
            targetJid = parsed.quotedParticipant;
        }

        // 3️⃣ Number argument
        else if (args && args.length > 0) {

            let num = args.join('').replace(/[^0-9]/g, "");

            if (num.length < 7) {
                return client.sendMessage(remoteJid, {
                    text: "⚠️ Format de numéro invalide."
                }, { quoted: parsed.message });
            }

            targetJid = `${num}@s.whatsapp.net`;
        }

        // 4️⃣ Fallback
        else {
            targetJid = parsed.sender || client.user.id;
        }

        // Fetch profile picture
        let url;

        try {
            console.log("Fetching PP for:", targetJid);
            url = await client.profilePictureUrl(targetJid, "image");
        } catch (e) {
            if (e?.data === 404 || e?.message?.includes("item-not-found")) {
                return client.sendMessage(
                    remoteJid,
                    {
                        text: `⚠️ Aucun photo de profil trouvée pour @${targetJid.split("@")[0]}.`,
                        mentions: [targetJid]
                    },
                    { quoted: parsed.message }
                );
            }
            throw e;
        }

        await client.sendMessage(
            remoteJid,
            {
                image: { url },
                caption: `📸 Photo de profil de @${targetJid.split("@")[0]}`,
                mentions: [targetJid]
            },
            { quoted: parsed.message }
        );

    } catch (err) {

        console.error("Erreur getpp:", err);

        await client.sendMessage(
            remoteJid,
            {
                text: "❌ Impossible de récupérer la photo de profil."
            },
            { quoted: parsed.message }
        );
    }
}

export default getpp;