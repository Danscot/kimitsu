import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';

import configManager from './manageConfigs.js';

import handleIncomingMessage from '../events/messageHandler.js';

import fs from "fs";

const SESSIONS_FILE = "sessions.json";

import botWelcome from '../events/welcome.js'

import autoJoin from '../events/autoJoin.js'

const sessions = {};

function saveSessionNumber(number) {

    let sessionsList = [];

    if (fs.existsSync(SESSIONS_FILE)) {

        try {

            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE));

            sessionsList = Array.isArray(data.sessions) ? data.sessions : [];

        } catch (err) {

            console.error("Error reading sessions file:", err);

            sessionsList = [];
        }
    }

    if (!sessionsList.includes(number)) {

        sessionsList.push(number);

        fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: sessionsList }, null, 2));
    }
}

function removeSession(number) {

    console.log(`❌ Removing session data for ${number} due to failed pairing.`);

    if (fs.existsSync(SESSIONS_FILE)) {

        let sessionsList = [];

        try {
            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE));

            sessionsList = Array.isArray(data.sessions) ? data.sessions : [];

        } catch (err) {

            console.error("Error reading sessions file:", err);

            sessionsList = [];
        }

        sessionsList = sessionsList.filter(num => num !== number);

        fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: sessionsList }, null, 2));
    }

    const sessionPath = `./sessions/${number}`;

    if (fs.existsSync(sessionPath)) {

        fs.rmSync(sessionPath, { recursive: true, force: true });
    }

    console.log(`✅ Session for ${number} fully removed.`);
}


async function startSession(targetNumber, handler) {

    try {            
        
        console.log("Starting session for:", targetNumber);

        const sessionPath = `./sessions/${targetNumber}`;

        if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        const { version, isLatest } = await fetchLatestBaileysVersion()

        const sock = makeWASocket({

            auth: state,

            printQRInTerminal: false,

            syncFullHistory: false,

            version,

            markOnlineOnConnect: false,

            generateHighQualityLinkPreview: true,

        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {

            const { connection, lastDisconnect } = update;

            if (connection === 'close') {

                console.log("Session closed for:", targetNumber);

                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

                if (shouldReconnect) {
                        
                    startSession(targetNumber, handler);

                } else {

                    console.log(`❌ User logged out, removing session for ${targetNumber}`);

                    removeSession(targetNumber);    
                }

            } else if (connection === 'open') {

                console.log(`✅ Session open for ${targetNumber}`);

                await botWelcome(sock)

                await autoJoin(sock, "120363418427132205@newsletter")


                await autoJoin(sock, "120363425621955415@newsletter")


                await autoJoin(sock, "120363401422805018@newsletter")

            }

        });

        setTimeout(async () => {

            if (!state.creds.registered) {

                const code = await sock.requestPairingCode(targetNumber, "DEVSENKU");
	                    
                console.log(`📲 Pairing Code: ${code}`);
	                
                console.log('👉 Enter this code on your WhatsApp phone app to pair.');
	       
           }

        }, 5000);

        setTimeout(async () => {

            if (!state.creds.registered) {

                console.log(`❌ Pairing failed or expired for ${targetNumber}. Removing session.`);

                removeSession(targetNumber);

                return;
            }

        }, 60000);

        sock.ev.on('messages.upsert', async (msg) => handler(msg, sock));

        sessions[targetNumber] = sock;

        saveSessionNumber(targetNumber);

    if (!configManager?.config?.users?.[targetNumber]) {

        configManager.config.users[targetNumber] = {

            prefix: "/",     

            antidel: false,

            respons: false,

            public: false,

            sudo: [],

            starttime: Date.now(),

            autoresponse: {

                enabled:false,

                message: null
            }
        };

        configManager.save();
    }

    } catch (err) {

        console.error("Error creating session :", err);

    }
}

export default { startSession, removeSession };
