// telegraf dependacies
const session = require('telegraf/session');
const Stage = require('telegraf/stage');

// command handlers
const startHanlder = require('./userMsgs.js/commands/start');
const helpHandler = require('./userMsgs.js/commands/help');
const playHandler = require('./userMsgs.js/commands/play');
const enterHandler = require('./userMsgs.js/commands/enter');
const refuseHandler = require('./userMsgs.js/refuse');

// user msg handlers
const cardHandler = require('./userMsgs.js/card');

// scenes
const askOpponent = require('./scenes/askOpponent');
const checkOpponent = require('./scenes/checkOpponent');
const activateGroup = require('./scenes/activateGroup');
const buildGame = require('./scenes/buildGame');
const startGame = require('./scenes/startGame');
const endGame = require('./scenes/endGame');
const callOpponent = require('./scenes/callOpponent');
const showMoves = require('./scenes/showMoves');
const checkCatch = require('./scenes/checkCatch');
const shareMove = require('./scenes/shareMove');

const { cardRegEx } = require('./helpers/utils.json');
// get bot
const bot = require('./bot');

// Create scene manager
const stage = new Stage();

// add bot scenes
stage.register(askOpponent);
stage.register(checkOpponent);
stage.register(callOpponent);
stage.register(activateGroup);
stage.register(buildGame);
stage.register(startGame);
stage.register(endGame);
stage.register(showMoves);
stage.register(checkCatch);
stage.register(shareMove);

bot.use(session());
bot.use(stage.middleware());

// TODO implement possibility to refuse
bot.command('refuse', refuseHandler);

bot.start(startHanlder);

bot.command('help', helpHandler);

bot.command(['newgame', 'sfida'], playHandler);

bot.command(['enter', 'entra'], enterHandler);

bot.hears(new RegExp(cardRegEx), cardHandler);

// suit emojis
// ♥️
// ♦
// ♣
// ♠

module.exports.stage = stage;
