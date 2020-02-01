const { Markup } = require('telegraf');

module.exports = (buttons, columns) => {
  return buttons
    ? Markup.keyboard(buttons, {
        columns: columns || buttons.length
      })
        .oneTime()
        .resize()
        .extra()
    : Markup.keyboard(['']);
};
