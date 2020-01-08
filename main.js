//telegram dependacies
const Telegraf = require("telegraf");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const { Markup } = Telegraf;
const fetch = require("node-fetch");
const admin = require("firebase-admin");
const Scene = require("telegraf/scenes/base");

require("dotenv").config();

//helper function
const cardToValue = card => {
  let value;
  card = card.charAt(0);
  switch (card) {
    case "A":
      value = 1;
      break;
    case "J":
      value = 8;
      break;
    case "Q":
      value = 9;
      break;
    case "K":
      value = 10;
      break;
    default:
      value = Number(card);
  }
  return value;
};

const areThereAces = board => {
  let exit = false;
  board.forEach(card => {
    if (card.charAt(0) == "A") exit = true;
  });
  return exit;
};

const sendToUser = (chatId, text, buttons, columns) => {
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

const cardsToString = cards => cards.toString().replace(/,/gi, "   ");

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const composeGroupName = usernames => {
  let groupName = "";
  usernames.forEach(user => (groupName += `&${user}`));
  return groupName.substr(1);
};

const URL = process.env.URL; // get the Heroku config var URL
const BOT_TOKEN = process.env.BOT_TOKEN; // get Heroku config var BOT_TOKEN
const PORT = process.env.PORT || 2000;

const bot = new Telegraf(BOT_TOKEN);

if (process.env.NODE_ENV == "dev") {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`).then(() => {
    console.info("webhook deleted for dev purpose");
    bot.startPolling();
  });
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

//create bot

// Create scene manager
const stage = new Stage();
//stage.command("cancel", leave());

// Bot scenes creation
const getOpponent = new Scene("know-opponent");
const checkOpponent = new Scene("check-opponent");
const callOpponent = new Scene("call-opponent");
const createGroup = new Scene("create-group");
const prepGame = new Scene("prep-game");
const showGameState = new Scene("show-game-state");
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
  console.info("know-opponent");
  ctx.reply("Chi vuoi sfidare?");
  ctx.scene.enter("check-opponent");
});

checkOpponent.on("text", ctx => {
  console.info("check-opponent");

  const targetUsername = ctx.message.text.toLowerCase();

  const opponentRef = db.collection("users").doc(`${targetUsername}`);
  opponentRef
    .get()
    .then(opponentDoc => {
      if (opponentDoc.exists) {
        let startPlayer = { username: ctx.message.from.username.toLowerCase() };
        db.collection("users")
          .doc(`${ctx.message.from.username.toLowerCase()}`)
          .get()
          .then(startPlayerDoc => {
            startPlayer = { ...startPlayer, ...startPlayerDoc.data() };
            ctx.session.players = [startPlayer, { ...opponentDoc.data(), username: opponentRef.id }];
            ctx.scene.enter("call-opponent");
          });
      } else {
        ctx.reply(`@${ctx.message.text} non si è connesso a cirullino, introltragli questo link`);
        ctx.reply(` http://t.me/cirullino_bot `);
        ctx.scene.leave();
      }
    })
    .catch(err => console.error(err));
});

callOpponent.enter(ctx => {
  console.info("call-opponent");
  const { players } = ctx.session;

  // TODO check if opponent wants to play
  ctx.reply(`Controllo che l'utente abbia attivato il gioco...`);

  //success in sending message
  ctx.session.opponents = players.filter(player => player.username != ctx.message.from.username.toLowerCase());
  bot.telegram
    .sendMessage(ctx.session.opponents[0].chatId, `Sei stato invitato a giocare, se vuoi entare rispondimi /enter`)
    .then(() => {
      const hasAccepted = players.map(player => false);
      hasAccepted[players.findIndex(player => player.username == ctx.message.from.username.toLowerCase())] = true;
      db.collection("pendingGames").add({
        players: players.map(elm => elm.username),
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

callOpponent.leave(() => console.log("left call-opponent"));

bot.command("enter", ctx => {
  console.log("/enter");
  //check if there is a pending game with the username
  //if there is , it changes the corresponding state of the player and then if all the players are true the game starts

  const pendingGameRef = db.collection("pendingGames").where("players", "array-contains", `${ctx.message.from.username.toLowerCase()}`);
  pendingGameRef.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
      let updatedPlayers = doc.data();
      updatedPlayers.hasAccepted[doc.data().players.indexOf(ctx.message.from.username.toLowerCase())] = true;
      if (updatedPlayers.hasAccepted.every(elm => elm == true)) doc.ref.delete();

      console.info("create-group");
      const { players } = updatedPlayers;
      //sort players array based on username
      const newGroup = db.collection("groups").doc(composeGroupName(players.sort()));
      // TODO add chatIds
      newGroup.set({});
    });
  });
});

bot.command("refuse", () => {
  console.log("entered");
  // TODO implement refusing possibility
});

bot.hears(/^[A0123456789JQK♥️♦♣♠]{2}$/, ctx => {
  //when bot receives a card it checks if the user has an active game, if so it checks if it is the active user, then processes the move e updates the other players
});

createGroup.enter(ctx => {
  console.info("create-group");
  const { players } = ctx.session;
  //sort players array based on username
  players.sort((a, b) => a.username > b.username);
  const newGroup = db.collection("groups").doc(composeGroupName(players.map(player => player.username)));

  newGroup.set({ players });
  ctx.session.newGroup = newGroup;
  ctx.scene.enter("prep-game");
});

prepGame.enter(async ctx => {
  console.info("prep-game");

  const { newGroup } = ctx.session;
  const groupGames = newGroup.collection("groupGames");

  db.collection("decks")
    .doc("40cards")
    .get()
    .then(doc => {
      const shuffledDeck = doc.data().deck.sort(() => Math.random() - 0.5);
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
        activeUser: getRandomInt(0, 2)
      };
      groupGames.add({ ...newGame, createdAt: admin.firestore.FieldValue.serverTimestamp() }).then(() => {
        ctx.session.game = newGame;
        ctx.scene.enter("show-game-state");
      });
    })
    .catch(err => {
      console.error(err);
    });

  ctx.reply(`Perfetto! Tutto è pronto per giocare`);
});

showGameState.enter(ctx => {
  console.info("make-move");
  const { game, players } = ctx.session;
  const messages = [];

  players.forEach((player, i) => {
    messages.push(
      `In tavola:   ${cardsToString(game.board)}\n${game.userStrongDeck[i].length} scope\n${game.userWeakDeck[i].length} carte nel mazzo`
    );
    sendToUser(players[i].chatId, messages[i]);
  });
  ctx.scene.enter("ask-move");
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

shareMove.enter(ctx => {});
//add bot scenes
stage.register(getOpponent);
stage.register(checkOpponent);
stage.register(callOpponent);
stage.register(createGroup);
stage.register(prepGame);
stage.register(showGameState);
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
