import bot from './utils/connector.js';

import handleIncomingMessage from './events/messageHandler.js';

import pm2 from 'pm2';

const number = process.env.NUMBER;

const rawDuration = parseInt(process.env.SESSION_DURATION_SEC || "60");

const PM2_PROCESS_NAME = process.env.PM2_PROCESS_NAME;

if (!number) {

  console.error("Error: NUMBER environment variable is required.");

  process.exit(1);
}

if (!PM2_PROCESS_NAME) {

  console.error("Error: PM2_PROCESS_NAME environment variable is required.");

  process.exit(1);
}
let SESSION_DURATION_SEC;

if (rawDuration > 1000000000) {

  const now = Math.floor(Date.now() / 1000);

  SESSION_DURATION_SEC = Math.max(0, rawDuration - now);

  console.log(`Expiry timestamp detected: ${rawDuration}`);

  console.log(`Time remaining: ${SESSION_DURATION_SEC} seconds`);
} else {

  SESSION_DURATION_SEC = Math.min(rawDuration, 2592000);
}

console.log(`Starting bot for ${number} (Duration: ${SESSION_DURATION_SEC} seconds)`);



async function stopBot() {
  try {
    console.log(`Stopping bot for ${number}...`);

    await bot.removeSession(number);

    console.log(`Bot stopped successfully for ${number}.`);

    pm2.connect(err => {
      if (err) {
        console.error("PM2 connection error:", err);
        process.exit(1);
      }

      pm2.delete(PM2_PROCESS_NAME, (err) => {
        if (err) {
          console.error("Failed to delete PM2 process:", err);
        } else {
          console.log(`PM2 process ${PM2_PROCESS_NAME} deleted.`);
        }

        pm2.disconnect();
        process.exit(0);
      });
    });

  } catch (err) {
    console.error(`Error stopping bot for ${number}:`, err);
    process.exit(1);
  }
}

// Handle unexpected errors
function handleUnexpectedError(err) {
  console.error(`Unexpected error in bot session for ${number}:`, err);
  stopBot();
}

process.on('uncaughtException', handleUnexpectedError);
process.on('unhandledRejection', handleUnexpectedError);

// Schedule expiry
function scheduleExpiry(durationSec) {

  const MAX_SAFE_TIMEOUT = 2147483647; // ~24.8 days
  const chunkDuration = Math.min(durationSec * 1000, MAX_SAFE_TIMEOUT);

  if (durationSec <= 0) {
    console.log(`Session already expired for ${number}.`);
    stopBot();
    return;
  }

  console.log(`Scheduling bot expiry in ${Math.round(chunkDuration / 1000)} seconds...`);

  setTimeout(() => {

    const remainingSec = durationSec - Math.floor(chunkDuration / 1000);

    if (remainingSec > 0) {
      console.log(`Rescheduling remaining ${remainingSec} seconds...`);
      scheduleExpiry(remainingSec);
    } else {
      console.log(`Bot session expired for ${number} at ${new Date().toLocaleString()}`);
      stopBot();
    }

  }, chunkDuration);
}

// Launch bot
async function launchBot() {
  try {

    console.log(`Launching bot for ${number}...`);

    await bot.startSession(number, handleIncomingMessage);

    console.log(`Bot session started for ${number}.`);

    scheduleExpiry(SESSION_DURATION_SEC);

  } catch (err) {
    console.error(`Error launching bot for ${number}:`, err);
    process.exit(1);
  }
}

launchBot();