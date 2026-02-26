
import bot from '../utils/connector.js'

import handleIncomingMessage from './messageHandler.js';

import 'dotenv/config'

async function pairing() {

	const number = "237691770822"

	if(!number)  return console.log("number was not specify")

	await bot.startSession(number, handleIncomingMessage);

}

export default pairing;




// const number = "237691770822"