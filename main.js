//telegram dependacies
const Telegraf = require("telegraf");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const { Markup } = Telegraf;
const fetch = require("node-fetch");
const admin = require("firebase-admin");
const Scene = require("telegraf/scenes/base");
const { leave } = Stage;

require("dotenv").config();

//helper function
const cardToNumber = card => {
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

const cardify = cards => cards.toString().replace(/,/gi, "   ");

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
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
    console.info("webhook deleted");
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

// Scene registration

const getOpponent = new Scene("know-opponent");
const checkOpponent = new Scene("check-opponent");
const callOpponent = new Scene("call-opponent");
const createGroup = new Scene("create-group");
const prepGame = new Scene("prep-game");
const showGameState = new Scene("show-game-state");
const makeMove = new Scene("make-move");
const isScopa = new Scene("is-scopa");
const changeGameState = new Scene("change-game-state");

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

  // TODO check if opponent wants to play
  // ctx.reply(`Controllo che l'utente abbia attivato il gioco...`);

  // bot.telegram
  //success in sending message

  //   .sendMessage(opponent.chatId, `${opponent.first_name} sei stato invitato a giocare`)
  //   .then(() => {
  //     ctx.scene.enter("prep-game");
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     ctx.reply(`C'è stato un problema, contatta lo sviluppatore`);
  //   });

  ctx.scene.enter("create-group");
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
        movesRecord: [],
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
      groupGames.add(newGame).then(() => {
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
      `In tavola:   ${cardify(game.board)}\n${game.userStrongDeck[i].length} scope\n${game.userWeakDeck[i].length} carte nel mazzo`
    );

    sendToUser(players[i].chatId, messages[i]).then(() => ctx.scene.enter("make-move"));
  });
});

makeMove.enter(ctx => {
  const { players, game } = ctx.session;
  sendToUser(players[game.activeUser].chatId, `${players[game.activeUser].first_name} tocca a te! Gioca!`, game.hands[game.activeUser]);
});

makeMove.on("text", ctx => {
  console.info("make-move");
  const { game } = ctx.session;
  let isScopa = false;
  const usedCard = cardToNumber(ctx.message.text);
  if (usedCard == 1 && !areThereAces(game.board)) ctx.scene.enter("is-scopa");
  const boardTotal = game.board.map(card => cardToNumber(card)).reduce((acc, val) => acc + val, 0);
  if (boardTotal == usedCard || boardTotal == 15) ctx.session.enter("is-scopa");
  ctx.scene.leave();
});

isScopa.enter(() => {
  console.info("is-scopa");
  ctx.reply("SCOPAAAAAAAAAA");
  ctx.scene.leave();
});
//add bot scenes
stage.register(getOpponent);
stage.register(checkOpponent);
stage.register(callOpponent);
stage.register(createGroup);
stage.register(prepGame);
stage.register(showGameState);
stage.register(makeMove);
stage.register(isScopa);
stage.register(changeGameState);

bot.use(session());
bot.use(stage.middleware());

// ANCHOR bot commands
bot.start(ctx => {
  console.info("/start");
  ctx.reply("Arrivo! Aspetta ancora un attimo");
  const newUserRef = db.collection("users").doc(`${ctx.message.chat.username.toLowerCase()}`);

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
        ctx.reply("Benvenuto! 🎉 \nSei pronto a giocare un cirullino con i tuoi amici? 🃏 \nDimmi come vuoi procedere!");
      } else ctx.reply(`Bentornato ${ctx.message.chat.first_name}🎉 \nDimmi come vuoi procedere!`);
    })
    .catch(err => console.error(err));
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
bot.hears("test", ctx => {});
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
