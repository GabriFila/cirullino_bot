// http://www.regoledelgioco.com/giochi-di-carte/cirulla/

const Extra = require('telegraf/extra');

const markdown = Extra.markdown();

module.exports = ctx => {
  ctx.reply(
    `Per sapere come si gioca vai a questo [link](http://www.regoledelgioco.com/giochi-di-carte/cirulla/)`,
    { ...markdown, ...Extra.webPreview(false) }
  );
};
