const extra = require('telegraf/extra');

const markdown = extra.markdown();

module.exports = ctx => {
  ctx.reply(
    `Info privacy per @cirullinoBot
  Questo bot *salva* solamente:
   - il tuo username
   - il tuo nome
  Questo bot *non salva*:
  - il tuo numero di telefono
  - il tuo cognome
  - la tua mail
  `,
    markdown
  );
};
