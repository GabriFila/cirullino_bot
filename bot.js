const Telegraf = require("telegraf");
const fetch = require("node-fetch");

const { BOT_TOKEN, ENV } = require("./config");

const bot = new Telegraf(BOT_TOKEN);

if (ENV == "dev") {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`)
    .then(() => {
      console.info("webhook deleted for dev purpose");
      bot.startPolling();
    })
    .catch(err => console.error(err));
} else if (ENV == "prod") {
  console.log("in production");
  bot.telegram.setWebhook(`${URL}bot${BOT_TOKEN}`);
  bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);
}

module.exports = bot;
