//telegram dependacies
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { Extra, Markup } = Telegraf;
//help dependacies
const fetch = require("node-fetch");
const { cardsToString, getRandomInt, areThereAces, cardToValue, composeGroupName } = require("./helpers");

//firebase dependacies
const admin = require("firebase-admin");

//configuration
require("dotenv").config();

const URL = process.env.URL; // get the Heroku config var URL
const BOT_TOKEN = process.env.BOT_TOKEN; // get Heroku config var BOT_TOKEN
const PORT = process.env.PORT || 2000; //to start telegram webhook

bot = new Telegraf(BOT_TOKEN);

sendToUser = (chatId, text, buttons, columns) => {
  return bot.telegram.sendMessage(
    chatId,
    text,
    buttons
      ? Markup.keyboard(buttons, { columns: columns ? columns : buttons.length })
          .oneTime()
          .resize()
          .extra()
      : {}
  );
};

if (process.env.NODE_ENV == "dev") {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`)
    .then(() => {
      console.info("webhook deleted for dev purpose");
      bot.startPolling();
    })
    .catch(err => console.error(err));
} else {
  bot.telegram.setWebhook(`${URL}bot${BOT_TOKEN}`);
  bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);
}

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL
  }),
  databaseURL: "https://cirullino-a81df.firebaseio.com"
});

const db = admin.firestore();

// Create scene manager
const stage = new Stage();

// Bot scenes creation
const getOpponent = new Scene("know-opponent");
const checkOpponent = new Scene("check-opponent");
const callOpponent = new Scene("call-opponent");
const askMove = new Scene("ask-move");
const makeMove = new Scene("make-move");
const invalidMove = new Scene("invalid-move");
const moveAnalyser = new Scene("move-analyser");
const scopa = new Scene("scopa");
const take = new Scene("take");
const drop = new Scene("drop");
const shareMove = new Scene("share-move");

// ANCHOR bot scenes

getOpponent.enter(ctx => {
  console.info("getting-opponent");
  ctx.reply("Chi vuoi sfidare?");
  ctx.scene.enter("check-opponent");
});

checkOpponent.on("text", ctx => {
  console.info("checking-opponent");

  const opponentRef = db.collection("users").doc(`${ctx.message.text.toLowerCase()}`);
  opponentRef
    .get()
    .then(opponentDoc => {
      if (opponentDoc.exists) {
        db.collection("users")
          .doc(`${ctx.message.from.username.toLowerCase()}`)
          .get()
          .then(startPlayerDoc => {
            //prepare players obj sorted by player username
            let startPlayer = { ...startPlayerDoc.data(), username: ctx.message.from.username.toLowerCase() };
            ctx.session.players = [{ ...opponentDoc.data(), username: opponentRef.id }, startPlayer].sort(
              (a, b) => a.username > b.username
            );
            ctx.scene.enter("call-opponent");
          });
      } else {
        ctx.reply(`@${ctx.message.text} non si è connesso a cirullino, introltragli questo link`, Extra.webPreview(false));
        ctx.reply(` http://t.me/cirullino_bot `, Extra.webPreview(false));
        ctx.scene.leave();
      }
    })
    .catch(err => console.error(err));
});

callOpponent.enter(ctx => {
  console.info("calling-opponent");
  const { players } = ctx.session;

  // TODO check if opponent wants to play
  ctx.reply(`Sto contattando il tuo avversario`);

  ctx.session.opponents = players.filter(player => player.username != ctx.message.from.username.toLowerCase());

  // TODO add possibility to have multiple opponens -> multiple promises
  bot.telegram
    .sendMessage(ctx.session.opponents[0].chatId, `Sei stato invitato a giocare, se vuoi entare rispondimi /enter`)
    .then(() => {
      //hasAccepted contains the accepted status of each user in the hypotethical game
      //of course the start must be set to true
      //order of hasAccepted is based on
      const hasAccepted = players.map(player => false);
      hasAccepted[players.findIndex(player => player.username == ctx.message.from.username.toLowerCase())] = true;
      db.collection("pendingGames").add({
        usernames: players.map(player => player.username),
        chatIds: players.map(player => player.chatId),
        hasAccepted,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      // ctx.scene.enter("create-group");
      //create a pending game with state pending and players
      ctx.scene.leave();
    })
    .catch(err => {
      console.error(err);
      ctx.reply(`C'è stato un problema, contatta lo sviluppatore`);
    });
});

bot.command("enter", ctx => {
  console.info("/enter");
  //check if there is a pending game with the username
  //if there is , it changes the corresponding state of the player and then if all the players are true the game starts
  const senderUsername = ctx.message.from.username.toLowerCase();

  const pendingGameRef = db.collection("pendingGames").where("usernames", "array-contains", `${senderUsername}`);
  pendingGameRef.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(pendingGameDbRef) {
      let updatedPlayers = pendingGameDbRef.data();
      updatedPlayers.hasAccepted[pendingGameDbRef.data().usernames.indexOf(senderUsername)] = true;
      if (updatedPlayers.hasAccepted.every(elm => elm == true)) pendingGameDbRef.ref.delete();

      console.info("creating-group");
      const { usernames } = updatedPlayers;
      const newGroupDbRef = db.collection("groups").doc(composeGroupName(usernames));

      newGroupDbRef.set({});

      db.collection("decks")
        .doc("40cards")
        .get()
        .then(deckDbRef => {
          const shuffledDeck = deckDbRef.data().deck.sort(() => Math.random() - 0.5);
          const newGame = {
            deck: shuffledDeck,
            hands: {
              0: shuffledDeck.splice(0, 3),
              1: shuffledDeck.splice(0, 3)
            },
            board: shuffledDeck.splice(0, 4),
            points: 0,
            moves: [],
            userStrongDeck: {
              0: [],
              1: []
            },
            userWeakDeck: {
              0: [],
              1: []
            },
            activeUser: getRandomInt(0, 2),
            chatIds: updatedPlayers.chatIds
          };
          newGroupDbRef
            .collection("groupGames")
            .add({ ...newGame, createdAt: admin.firestore.FieldValue.serverTimestamp() })
            .then(gameDbRef => {
              console.info("game-created");
              //start game by making listener on updates on game object and pushing them to all connected users
              gameDbRef.onSnapshot(doc => {
                console.info("make-move");
                const messages = [];
                const game = doc.data();
                game.chatIds.forEach((chatId, i) => {
                  messages.push(
                    `In tavola:   ${cardsToString(game.board)}\nHai:\n  ${game.userStrongDeck[i].length} scope\n  ${
                      game.userWeakDeck[i].length
                    } carte nel tuo mazzetto`
                  );
                  sendToUser(game.chatIds[i], messages[i]);
                });
                // TODO add logic for multiple promises
                const { activeUser } = game;
                sendToUser(game.chatIds[activeUser], "Tocca a te", game.hands[activeUser]);
              });
            });
        })
        .catch(err => {
          console.error(err);
        });
    });
  });
});

bot.command("refuse", () => {
  // TODO implement possibility to refuse entering the game
});

bot.on("text", ctx => {
  // FIXME solve regex matching
  //check if there is an active game

  //check if move is valid
  //update game state

  const { text } = ctx.message;

  if (/[A0123456789JQK][♥️♦♣♠]/.test(text)) console.log("correct");
});

bot.hears(/[A0123456789JQK][♥️♦♣♠]/, ctx => {
  console.log("here");
  //when bot receives a card it checks if the user has an active game, if so it checks if it is the active user, then processes the move e updates the other players
  console.log(ctx.message.text);
});

askMove.enter(ctx => {
  console.info("ask-move");
  const { players, game } = ctx.session;
  sendToUser(players[game.activeUser].chatId, `${players[game.activeUser].first_name} tocca a te! Gioca!`, game.hands[game.activeUser]);
  // FIXME promise logic
  ctx.scene.enter("make-move");
});

makeMove.on(/[A0123456789JQK♥️♦♣♠]+/, ctx => {
  const { game } = ctx.session;
  const { activeUser } = game;
  if (!game.hands[activeUser].includes(ctx.message.text)) ctx.scene.enter("invalid-move");

  game.hand[activeUser].pop(ctx.message.text);
  game.moves.push({ user: activeUser, cardPlayed: ctx.message.text });

  ctx.scene.enter("move-analyser");
});

invalidMove.enter(ctx => {
  ctx.reply("Non puoi giocare questa carta perchè non è nella tua mano");
  ctx.scene.enter("make-move");
});

moveAnalyser.enter(ctx => {
  console.info("move-analyser");
  const { game } = ctx.session;
  const usedCard = cardToValue(game.moves[0].cardPlayed);
  if (usedCard == 1 && !areThereAces(game.board)) ctx.scene.enter("scopa");
  const boardTotal = game.board.map(card => cardToValue(card)).reduce((acc, val) => acc + val, 0);
  if (boardTotal == usedCard || boardTotal == 15) ctx.scene.enter("scopa");
  // TODO find all possible labels
});

scopa.enter(ctx => {
  console.info("scopa");
  const { game } = ctx.session;

  game.moves[0].type = "scopa";
  game.moves[0].tookCards = game.board;
  game.board = [];
  game.userStrongDeck[activeUser]++;

  ctx.reply("SCOPAAAAAAAAAA");
  ctx.scene.enter("share-move");
});

//add bot scenes
stage.register(getOpponent);
stage.register(checkOpponent);
stage.register(callOpponent);
stage.register(askMove);
stage.register(makeMove);
stage.register(moveAnalyser);
stage.register(invalidMove);
stage.register(scopa);
stage.register(take);
stage.register(drop);
stage.register(shareMove);

bot.use(session());
bot.use(stage.middleware());

// ANCHOR bot commands
bot.start(ctx => {
  console.info("/start");
  if ("username" in ctx.message.from) {
    ctx.reply(`Sei pronto a giocare un cirullino con i tuoi amici? 🃏`);
    const newUserRef = db.collection("users").doc(`${ctx.message.from.username.toLowerCase()}`);

    newUserRef
      .get()
      .then(doc => {
        if (!doc.exists) {
          newUserRef.set({
            chatId: ctx.message.chat.id,
            first_name: ctx.message.chat.first_name,
            wins: 0,
            losses: 0
          });
        } else {
          newUserRef.set(
            {
              chatId: ctx.message.chat.id,
              first_name: ctx.message.chat.first_name
            },
            { merge: true }
          );
        }
        ctx.reply("Dimmi come vuoi procedere!");
      })
      .catch(err => console.error(err));
  } else
    ctx.reply(
      "Grazie per voler giocare! Manca ancora una cosa però, devi impostare il tuo username su telegram, altrimenti gli altri non potranno giocare con te!\nQuando hai fatto, rimandami il comando /start e potrai giocare"
    );
});

bot.command("newgame", ctx => {
  console.info("/newgame");
  ctx.scene.enter("know-opponent");
});

bot.command("help", ctx => {
  console.info("/help");
  ctx.reply(`Se hai delle necessità su questo bot scrvi una mail a gabriele.filaferro@gmail.com`);
});

//test purpose commands
bot.hears("test", ctx => {
  ctx.reply(ctx.message.chat.id);
});
// bot.on("text", ctx => {
//   console.log(ctx.message);
//   ctx.reply(ctx.message.text);
// });

//suit emojis
//♥️
//♦
//♣
//♠

// ANCHOR hint
//to have separate buttons in keyboard for cards in hand
//[["one"], ["two", "three"]]
// const saluter = new Scene("saluter");
// saluter.hears(/ciccia/gi, ctx => ctx.reply("Bella"));

// saluter.enter(ctx => console.log(ctx.session.data));
// greeter.enter(ctx => ctx.reply("Entrato"));
// greeter.hears(/spegniti/gi, leave());

// greeter.leave(ctx => ctx.reply("Bye"));

//to get updates
// let initState = true;
// db.collection("users")
//   .doc("319948189")
//   .onSnapshot(doc => {
//     if (!initState) console.log(doc.data());
//     initState = false;
//   });

// db.collection("users")
//   .doc("319948189")
//   .set({ chatId: 3 }, { merge: true });

//to leave a scene
//stage.command("cancel", leave());
