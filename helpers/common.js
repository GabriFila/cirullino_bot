/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
const { Markup } = require('telegraf');
const bot = require('../bot');

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // Il max è escluso e il min è incluso
};

module.exports.getRandomInt = getRandomInt;

const possibleCombs = array => {
  const fn = (n, src, got, all) => {
    if (n === 0) {
      if (got.length > 0) {
        all[all.length] = got;
      }
      return;
    }
    for (let j = 0; j < src.length; j++) {
      fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
    }
  };

  const all = [];

  for (let i = 1; i < array.length; i++) {
    fn(i, array, [], all);
  }

  all.push(array);

  return all;
};
module.exports.possibleCombs = possibleCombs;

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
