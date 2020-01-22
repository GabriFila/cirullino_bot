const { Markup } = require('telegraf');
const bot = require('../../bot');

module.exports = (chatId, text, buttons, columns) =>
  bot.telegram.sendMessage(
    chatId,
    text,
    buttons
      ? Markup.keyboard(buttons, {
          columns: columns || buttons.length
        })
          .oneTime()
          .resize()
          .extra()
      : Markup.keyboard([''])
  );
