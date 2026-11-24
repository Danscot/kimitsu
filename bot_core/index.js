
import bot from './utils/connector.js'

import handleIncomingMessage from './events/messageHandler.js'

bot.resumeSessions(handleIncomingMessage);
