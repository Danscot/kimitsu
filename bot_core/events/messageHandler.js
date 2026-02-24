import { commands } from '../plugins/index.js';

import parser from '../utils/messageParser.js';

import { storeMessage } from '../utils/messageStore.js';

import { handleDeletedMessage } from '../utils/messageRecovery.js';

import configHelper from '../utils/manageConfigs.js';

import fs from 'fs';

import handleMentions from '../utils/autoRespond.js'

import react from '../utils/messageReact.js'

async function handleIncomingMessage(event, client) {

    const number = client.user?.id?.split(':')[0] || '';

    let userLid = '';

    try {

        const data = JSON.parse(fs.readFileSync(`sessions/${number}/creds.json`, 'utf8'));

        userLid = data?.me?.lid || client.user?.lid || '';

    } catch (e) {

        userLid = client.user?.lid || '';
    }

    const lid = userLid ? [userLid.split(':')[0] + "@lid"] : [];

    const messages = event.messages;

    // Use prefix from config, default to "/"
    const prefix = configHelper.config.users[number]?.prefix;

    const isPublic = configHelper.config.users[number]?.public || false;

    const sudoList = configHelper.config.users[number]?.sudo || [];

    for (const message of messages) {

        const parsedMessage = parser(message);

        if (!parsedMessage) continue;

        //console.log(parsedMessage)

        console.log(message.message)

        // Handle deleted messages
        if (parsedMessage.isDeleted) {

            await handleDeletedMessage(parsedMessage, client, userLid);
        }

        // Store message
        storeMessage(userLid, parsedMessage.messageId, parsedMessage.messageType, parsedMessage.normalizedContent, parsedMessage.participant, message.message);

        const rawContent = parsedMessage.normalizedContent;

        // Only try commands if content is a string
        const text = typeof rawContent === 'string' ? rawContent.trim() : null;

        // Skip non-text messages
        if (!text || (parsedMessage.device && !text.startsWith(prefix))) continue;

        // Remove prefix and parse command
        const args = text.slice(prefix.length).trim().split(/\s+/);

        // Handle mentions

        handleMentions(parsedMessage, client, args, message )

        const commandName = args.shift().toLowerCase();

        const commandHandler = commands[commandName];

        if (!commandHandler) continue;

        // Check if command can be executed
        const sender = parsedMessage.participant?.split('@')[0];

        const canExecute =

            parsedMessage.isFromMe || // bot itself

            sudoList.includes(sender) || // sudo user

            isPublic; // bot in public mode

        if (!canExecute) continue;

        try {

            await react(parsedMessage, client, args, message)

            await commandHandler(parsedMessage, client, args, message);

        } catch (err) {

            console.error(`❌ Error executing command ${commandName}:`, err);
        }
    }
}

export default handleIncomingMessage;