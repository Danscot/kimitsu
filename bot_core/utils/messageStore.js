import fs from 'fs';

import path from 'path';

const DATA_DIR = path.join('./data/messages');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getUserStoreFile(userNumber) {

    return path.join(DATA_DIR, `store-${userNumber}.json`);
}

// Load messages for a specific user
export function loadMessages(userNumber) {

    const filePath = getUserStoreFile(userNumber);

    if (!fs.existsSync(filePath)){ 

    	 return {}};

    try {

        const data = fs.readFileSync(filePath, 'utf8');

        return JSON.parse(data);

    } catch (err) {

        console.error(`Failed to load messages for ${userNumber}:`, err);

        return {};
    }
}

// Save messages for a specific user
function saveMessages(userNumber, messages) {

    const filePath = getUserStoreFile(userNumber);

    try {

        fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');

    } catch (err) {

        console.error(`Failed to save messages for ${userNumber}:`, err);
    }
}

// Add a message to the user’s store
export function storeMessage(userNumber, messageId, messageType, content, participant, messageObj) {

    const messages = loadMessages(userNumber);

    messages[messageId] = [messageType, content, participant, messageObj];

    saveMessages(userNumber, messages);
}

