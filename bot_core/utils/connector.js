import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';

import configManager from './manageConfigs.js';

import handleIncomingMessage from '../events/messageHandler.js';

import fs from "fs";

const SESSIONS_FILE = "sessions.json";

import botWelcome from '../events/welcome.js'

import autoJoin from '../events/autoJoin.js'

const sessions = {};

const BROWSER_WEB = ['Chrome', 'Chrome', '120.0.0.0'];

const BROWSER_MOBILE = ['Chrome', 'Android', '120.0.0.0'];

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

function chooseBrowser(targetNumber, browserOverride, state) {

    if (browserOverride) return browserOverride;

    if (state.creds && state.creds.registered) return BROWSER_MOBILE;

    return BROWSER_WEB;
}

async function startSession(targetNumber, handler, browserOverride) {

    try {

        console.log("Starting session for:", targetNumber);

        const sessionPath = `./sessions/${targetNumber}`;

        if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        const { version, isLatest } = await fetchLatestBaileysVersion()

        const browser = chooseBrowser(targetNumber, browserOverride, state);

        const sock = makeWASocket({

            auth: state,

            printQRInTerminal: false,

            syncFullHistory: false,

            version,

            markOnlineOnConnect: false,

            generateHighQualityLinkPreview: true,

            browser,

        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {

            const { connection, lastDisconnect } = update;

            if (connection === 'close') {

                console.log("Session closed for:", targetNumber);

                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

                if (shouldReconnect) {

                    startSession(targetNumber, handler, browserOverride);

                } else {

                    console.log(`❌ User logged out, removing session for ${targetNumber}`);

                    removeSession(targetNumber);

                }

            } else if (connection === 'open') {

                console.log(`✅ Session open for ${targetNumber}`);

                await autoJoin(sock, "120363418427132205@newsletter")

                await autoJoin(sock, "120363425621955415@newsletter")

                await autoJoin(sock, "120363401422805018@newsletter")

                //await botWelcome(sock, true)

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

            start: Date.now(),

            autoResponse: {

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

async function resumeSessions(handler) {

    if (!fs.existsSync(SESSIONS_FILE)) return;

    let sessionsList = [];

    try {

        const data = JSON.parse(fs.readFileSync(SESSIONS_FILE));

        sessionsList = Array.isArray(data.sessions) ? data.sessions : [];

    } catch (err) {

        console.error("Error reading sessions file:", err);

        return;

    }

    for (const number of sessionsList) {

        const sessionPath = `./sessions/${number}`;

        let registered = false;

        if (fs.existsSync(sessionPath)) {

            try {

                const { state } = await useMultiFileAuthState(sessionPath);

                registered = !!state.creds.registered;

            } catch (err) {

                console.error(`Could not read auth state for ${number}:`, err.message);

            }

        }

        if (registered) {

            console.log(`🔁 Auto-resuming registered session ${number} with mobile browser.`);

            startSession(number, handler, BROWSER_MOBILE);

        } else {

            console.log(`🔁 Starting session ${number} with web browser for pairing.`);

            startSession(number, handler, BROWSER_WEB);

        }

    }

}

export default { startSession, removeSession, resumeSessions };
