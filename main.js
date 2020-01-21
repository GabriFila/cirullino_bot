require('colors');

// telegraf dependacies
const session = require('telegraf/session');
const Stage = require('telegraf/stage');

// command handlers
const startHanlder = require('./userMsgs.js/commands/start');
const helpHandler = require('./userMsgs.js/commands/help');
const aboutHandler = require('./userMsgs.js/commands/about');
const playHandler = require('./userMsgs.js/commands/play');
const enterHandler = require('./userMsgs.js/commands/enter');
const refuseHandler = require('./userMsgs.js/refuse');
const privacyHandler = require('./userMsgs.js/commands/privacy');

// user msg handlers
const cardHandler = require('./userMsgs.js/card');

// scenes

const countOpponents = require('./scenes/countOpponents');
const checkOpponents = require('./scenes/checkOpponent');
const callOpponents = require('./scenes/callOpponents');

const activateGroup = require('./scenes/activateGroup');

const buildGame = require('./scenes/buildGame');
const startGame = require('./scenes/startGame');

const showCatches = require('./scenes/showCatches');
const checkCatch = require('./scenes/checkCatch');
const shareMove = require('./scenes/shareMove');

const endGame = require('./scenes/endGame');

const { cardRegEx } = require('./helpers/utils.json');
// get bot
const bot = require('./bot');

// Create scene manager
const stage = new Stage();

// add bot scenes
stage.register(countOpponents);
stage.register(checkOpponents);
stage.register(callOpponents);
stage.register(activateGroup);
stage.register(buildGame);
stage.register(startGame);
stage.register(endGame);
stage.register(showCatches);
stage.register(checkCatch);
stage.register(shareMove);

bot.use(session());
bot.use(stage.middleware());

// TODO implement possibility to refuse
bot.command('refuse', refuseHandler);

bot.start(startHanlder);

bot.command('help', helpHandler);

bot.command('about', aboutHandler);

bot.command(['newgame', 'sfida'], playHandler);

bot.command(['enter', 'entra'], enterHandler);

bot.command('privacy', privacyHandler);

bot.hears(new RegExp(cardRegEx), cardHandler);

// suit emojis
// ♥️
// ♦
// ♣
// ♠

// TODO implement possibility to exit game
module.exports.stage = stage;

process.on('uncaughtException', err => {
  // eslint-disable-next-line no-console
  console.info(`Caught exception:  ${err}`.red);
});
