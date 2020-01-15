//telegraf dependacies
const session = require("telegraf/session");
const Stage = require("telegraf/stage");

//command handlers
const startHanlder = require("./userMsgs.js/commands/start");
const helpHandler = require("./userMsgs.js/commands/help");
const playHandler = require("./userMsgs.js/commands/play");
const enterHandler = require("./userMsgs.js/commands/enter");
const refuseHandler = require("./userMsgs.js/refuse");

//user msg handlers
const cardHandler = require("./userMsgs.js/card");

//scenes
const askOpponent = require("./scenes/askOpponent");
const checkOpponent = require("./scenes/checkOpponent");
const callOpponent = require("./scenes/callOpponent");

// get bot
bot = require("./bot");

// Create scene manager
const stage = new Stage();

bot.command("enter", enterHandler);

// TODO implement possibility to refuse
bot.command("refuse", refuseHandler);

bot.hears(/[A0123456789JQK][♥️♦♣♠]/, cardHandler);

//add bot scenes
stage.register(askOpponent);
stage.register(checkOpponent);
stage.register(callOpponent);

bot.use(session());
bot.use(stage.middleware());

bot.start(startHanlder);

bot.command("help", helpHandler);

bot.command(["newgame", "sfida"], playHandler);

//suit emojis
//♥️
//♦
//♣
//♠
