/* eslint-disable no-console */
const Scene = require('telegraf/scenes/base');
const dispButtons = require('../helpers/general/dispButtons');
const parseUsername = require('../helpers/general/parseUsername');

const countOpponents = new Scene('count-opponents');
// take target catch from user and
countOpponents.hears(/^[1-3]$/, ctx => {
  console.log('told number of opponents');
  ctx.session.stillToAsk = ctx.message.text;
  ctx.session.oppUsernames = [];
  ctx.reply(`Dimmi lo username del giocatore 1`);
});

countOpponents.on('text', ctx => {
  console.log('told opponent');

  if (ctx.session.oppUsernames) {
    if (
      parseUsername(ctx.message.text) !==
      parseUsername(ctx.message.from.username)
    ) {
      ctx.session.stillToAsk -= 1;
      const { stillToAsk } = ctx.session;
      ctx.session.oppUsernames.push(parseUsername(ctx.message.text));

      if (stillToAsk === 0) ctx.scene.enter('check-opponents');
      else {
        ctx.reply(
          `Dimmi lo username del giocatore ${ctx.session.oppUsernames.length +
            1}`
        );
        ctx.scene.enter('count-opponents');
      }
    } else
      ctx.reply('Il tuo username è già compreso, dimmi gli altri giocatori');
  } else
    ctx.reply('Devi dirmi un numero tra 1 e 3', dispButtons(['1', '2', '3']));
});

countOpponents.enter(ctx => {
  console.log('in count Opponent');
  console.log(ctx);

  ctx.reply('Con quante persone vuoi giocare? ', dispButtons(['1', '2', '3']));
});

module.exports = countOpponents;
