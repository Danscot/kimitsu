import { getContentType, downloadContentFromMessage, isJidGroup, isJidNewsletter, isJidBroadcast, getDevice, extractMessageContent  } from 'baileys';

import fs from 'fs';

import path from 'path';

function parser(message, userNumber) {

	if (!message || !message.message) return null;

	const key = message.key;

	const remoteJid = key.remoteJid;

	const messageType = getContentType(message.message)

	let isquoted;

	let quotedmess;

	let quotedtype;

	let quotedid;

	let groupmention;

	let quotedparticipant;

	let isDeleted;

	let deletedMessageId;

    let normalizedContent;

	const context = message?.message?.extendedTextMessage?.contextInfo;

	const protocolmessage = message?.message?.protocolMessage;

	if (messageType == "groupStatusMentionMessage") groupmention = true; 

	if (protocolmessage?.type == 0) isDeleted = true; deletedMessageId = protocolmessage?.key?.id;

	if ( context?.quotedMessage ) {  isquoted = true } else isquoted = false

	if (isquoted) quotedmess = extractMessageContent(context?.quotedMessage); quotedtype = getContentType(quotedmess); quotedid = context?.stanzaId; quotedparticipant = context?.participant;

    switch (messageType) {

        case 'conversation':

        case 'extendedTextMessage':

            normalizedContent =  message.message[messageType].text || message.message[messageType] || '';

            break;

        case 'stickerMessage':

        case 'imageMessage':

        case 'videoMessage':

        case 'audioMessage':

        case 'documentMessage':

            normalizedContent = message.message[messageType].url || null; 

            break;

        default:

            normalizedContent = extractMessageContent(message.message);
    }

	return {

		remoteJid,

		isGroup: isJidGroup(remoteJid),

		isChannel: isJidNewsletter(remoteJid),

		isStatus: isJidBroadcast(remoteJid),

		isFromMe: key.fromMe || false,

		isQuoted: isquoted || false,

		isGroupMention: groupmention || false,

		isDeleted: isDeleted || false,

		messageId: key.id,

		deletedMessageId: deletedMessageId || null,

		participant: key.participant || remoteJid,

		pushName: message.pushName || '',

		messageType: messageType,

		device: getDevice(key.id),

		messageContent: extractMessageContent(message.message),

		normalizedContent: normalizedContent || null,

		quotedParticipant: quotedparticipant || null,

		quotedMessageId: quotedid || null,

		quotedType: quotedtype || null,

		quotedMessage: quotedmess || null,

		interactiveMessage: message?.message?.interactiveMessage?.nativeFlowMessage || null
	};
}

export default parser;