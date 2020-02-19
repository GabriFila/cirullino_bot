/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const dispButtons = require('../helpers/general/dispButtons');
const { possibleValues } = require('../helpers/utils');

const askMattaValue = new Scene('ask-matta-value');

// take target catch from user and
askMattaValue.enter(ctx =>
  ctx.reply(
    'Che valore vuoi assegnare alla matta?',
    dispButtons(possibleValues, 5)
  )
);

askMattaValue.hears(possibleValues, ctx => {
  ctx.reply(`Il tuo 7\u2665 vale ${ctx.message.text}`);
  ctx.session.game.mattaValue =
    possibleValues.findIndex(value => value === String(ctx.message.text)) + 1;
  ctx.scene.enter('check-bussata');
});

askMattaValue.leave(() => console.log('/exit on askMattaValue'));

module.exports = askMattaValue;
