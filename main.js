//telegram dependacies
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
//help dependacies
const { cardsToString, getRandomInt, composeGroupName, circularNext, elaborateMove, calculatePoints, sendToUser } = require("./helpers");

//command handlers
const startHanlder = require("./userMsgs.js/commands/start");
const helpHandler = require("./userMsgs.js/commands/help");
const playHandler = require("./userMsgs.js/commands/play");

const enterHandler = require("./userMsgs.js/enter");
const refuseHandler = require("./userMsgs.js/refuse");

//scenes
const askOpponent = require("./scenes/askOpponent");
const checkOpponent = require("./scenes/checkOpponent");
const callOpponent = require("./scenes/callOpponent");
//firebase dependacies
const admin = require("./firebase");
const db = admin.firestore();

// get bot
bot = require("./bot");

// Create scene manager
const stage = new Stage();

bot.command("enter", enterHandler);

// TODO implement possibility to refuse
bot.command("refuse", refuseHandler);

bot.hears(/[A0123456789JQK][♥️♦♣♠]/, ctx => {
  // TODO check if user is in game
  // TODO check is user can play, is it in turn
  //when bot receives a card it checks if the user has an active game, if so it checks if it is the active user, then processes the move e updates the other players
  console.info("reiceved card");
  //user message is a card
  //check if there is an active game
  const senderUsername = ctx.message.from.username.toLowerCase();
  db.collection("groups")
    .where("usernames", "array-contains", senderUsername)
    // TODO select only active group
    .get()
    .then(groups =>
      groups.forEach(group => {
        group
          .data()
          .activeGame.get()
          .then(doc => {
            //check if move is valid
            const game = doc.data();
            const { activeUser } = game;
            console.info("validating move");

            if (!game.hands[activeUser].includes(ctx.message.text)) ctx.reply(`Hai giocato una carta che non hai in mano`);
            else {
              game.hands[activeUser].splice(game.hands[activeUser].indexOf(ctx.message.text), 1); //remove used card from player hand
              game.moves.unshift({ user: activeUser, cardPlayed: ctx.message.text }); //start creating game move record
              console.info("analysing move");
              const usedCard = ctx.message.text;
              const cardsRemoved = [];
              const gameResult = elaborateMove(
                usedCard,
                game.board,
                game.userStrongDeck[activeUser],
                game.userWeakDeck[activeUser],
                cardsRemoved
              );
              let messagge = "";
              switch (gameResult) {
                case "scopa":
                  messagge += `fatto scopa con ${usedCard}`;
                  break;
                case "presa con 15":
                case "presa normale":
                  messagge += `preso ${cardsRemoved.map(card => `${card} `)} con ${usedCard}`;
                  break;
                case "calata":
                  messagge += `calato ${usedCard}`;
                  break;
              }
              game.chatIds.forEach((chatId, i) => {
                if (i != activeUser) sendToUser(chatId, ctx.message.from.first_name + ` ha ` + messagge);
                else sendToUser(chatId, `Hai ` + messagge);
              });
              game.moves[0].type = gameResult;
              game.activeUser = circularNext(activeUser, game.chatIds);

              //check if hands are empty
              const handsLenghts = [];

              for (let [key, value] of Object.entries(game.hands)) handsLenghts.push(value.length);

              if (handsLenghts.every(length => length == 0)) {
                console.info("empty hands");
                for (let i = 0; i < Object.keys(game.hands).length; i++) game.hands[i] = game.deck.splice(0, 3);
              }
              // TODO if last hand place board in last taken
              //update game state
              doc.ref
                .set(game)
                .then(() => console.info("game updated"))
                .catch(err => console.error(err));
            }
          });
      })
    );
});

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

// ANCHOR hint
//to have separate buttons in keyboard for cards in hand
//[["one"], ["two", "three"]]
