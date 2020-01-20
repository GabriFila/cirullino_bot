/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
const { Markup } = require('telegraf');
const bot = require('../bot');

const sendToUser = (chatId, text, buttons, columns) =>
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
      : Markup.removeKeyboard().extra()
  );

module.exports.sendToUser = sendToUser;

const circularNext = (index, array) => {
  index++;
  return index === array.length ? 0 : index;
};
module.exports.circularNext = circularNext;

const indexOfMax = arr => {
  if (arr.length === 0) {
    return -1;
  }

  let max = arr[0];
  let maxIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
};

module.exports.indexOfMax = indexOfMax;
