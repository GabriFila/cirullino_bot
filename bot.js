/* eslint-disable no-console */
const Telegraf = require('telegraf');
const fetch = require('node-fetch');

const { BOT_TOKEN, ENV, PORT, URL } = require('./config');

const bot = new Telegraf(BOT_TOKEN);
console.log(PORT);
if (ENV === 'dev') {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`)
    .then(() => {
      console.info('webhook deleted for dev purpose');
      bot.startPolling();
    })
    .catch(err => console.error(err.message.red));
} else if (ENV === 'prod') {
  console.log('in production');
  bot.telegram.setWebhook(`${URL}bot${BOT_TOKEN}`);
  bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);
}

module.exports = bot;
