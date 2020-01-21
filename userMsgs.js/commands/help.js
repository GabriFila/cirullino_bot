const { helpMessage } = require('../../helpers/utils.json');

module.exports = ctx => {
  console.log('/help');
  ctx.reply(helpMessage);
};
