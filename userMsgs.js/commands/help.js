const { helpMessage } = require('../../helpers/utils');

module.exports = ctx => {
  console.log('/help');
  ctx.reply(helpMessage);
};
