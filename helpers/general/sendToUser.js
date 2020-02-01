const bot = require('../../bot');
const dispButtons = require('./dispButtons');

module.exports = (chatId, text, buttons, columns) =>
  bot.telegram.sendMessage(chatId, text, dispButtons(buttons, columns));
