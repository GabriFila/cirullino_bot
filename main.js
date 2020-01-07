//telegram dependacies
const Telegraf = require("telegraf");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = Telegraf;
const fetch = require("node-fetch");
const admin = require("firebase-admin");
const Scene = require("telegraf/scenes/base");
const { leave } = Stage;

//helper function
const sendToUser = (chatId, text, buttons, columns) => {
  bot.telegram.sendMessage(
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

const composeGroupName = users => {
  let groupName = "";
  users.sort().forEach(user => (groupName += `&${user}`));
  return groupName.substr(1);
};

require("dotenv").config();

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

// const saluter = new Scene("saluter");
// saluter.hears(/ciccia/gi, ctx => ctx.reply("Bella"));

// saluter.enter(ctx => console.log(ctx.session.data));
// greeter.enter(ctx => ctx.reply("Entrato"));
// greeter.hears(/spegniti/gi, leave());

// greeter.on("message", ctx => {
//   ctx.session.data = ctx.message.text;
//   ctx.scene.enter("saluter");
// });
// greeter.leave(ctx => ctx.reply("Bye"));

// Create scene manager
const stage = new Stage();
stage.command("cancel", leave());

// Scene registration

const getOpponent = new Scene("get-opponent");
const checkOpponent = new Scene("check-opponent");
const prepGame = new Scene("prep-game");
const makeMove = new Scene("make-move");

// ANCHOR bot scenes

getOpponent.enter(ctx => {
  console.info("get-opponent");
  console.log(ctx.message.text);
  ctx.reply("Chi vuoi sfidare?");
  ctx.scene.enter("check-opponent");
});

checkOpponent.on("text", ctx => {
  console.info("check-opponent");
  console.log(ctx.message.text);

  const targetUsername = ctx.message.text.toLowerCase();

  const opponentRef = db.collection("users").doc(`${targetUsername}`);
  opponentRef
    .get()
    .then(doc => {
      if (doc.exists) {
        ctx.scene.playersInfo = [
          { ...doc.data(), username: opponentRef.id },
          db.collection("users").doc`${ctx.message.from.username.toLowerCase()}`
        ];
        console.log(doc.data());
        ctx.scene.enter("prep-game");
      } else {
        ctx.reply(`@${ctx.message.text} non si è connesso a cirullino, introltragli questo link`);
        ctx.reply(` http://t.me/cirullino_bot `);
        return;
      }
    })
    .catch(err => console.error(err));
});

prepGame.enter(ctx => {
  ctx.reply(`Controllo che l'utente abbia attivato il gioco...`);

  const opponent = ctx.scene.opponent;
  bot.telegram
    .sendMessage(opponent.chatId, `${opponent.first_name} sei stato invitato a giocare`)
    .then(() => {
      //success in sending message
      let player0, player1;
      // if (ctx.message.from.username < targetUsername) {
      //   player0 = ctx.message.from.username;
      //   chatId1 = ctx.message.chat.id;
      //   player1 = targetUsername;
      //   chatId2 = opponent.chatId;
      // } else {
      //   player0 = targetUsername;
      //   player1 = ctx.message.from.username;
      // }
      const newGroup = db.collection("groups").doc(composeGroupName(opponent.username));

      newGroup.set({
        players: {
          0: player0,
          1: player1
        }
      });
      const groupGames = newGroup.collection("groupGames");

      db.collection("decks")
        .doc("40cards")
        .get()
        .then(doc => {
          const shuffledDeck = doc.data().deck.sort(() => Math.random() - 0.5);
          const newGame = {
            chatIds: [chatId1, chatId1],
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
            ctx.scene.enter("make-move");
          });
        })
        .catch(err => {
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err);
      ctx.reply(`C'è stato un problema, contatta lo sviluppatore`);
    });
  ctx.reply(`Perfetto! Ora puoi giocare con ${opponent.first_name}`);
});

makeMove.enter(ctx => {
  game = ctx.session.game;
  console.log(ctx.session.game);
  const messages = [];

  game.chatIds.forEach((id, i) => {
    messages.push(
      `In tavola:   ${cardify(game.board)}\nHai ${game.userStrongDeck[i].length} scope e ${game.userWeakDeck[i].length} carte nel mazzo`
    );

    sendToUser(game.chatIds[i], messages[i]);
  });

  sendToUser(game.chatIds[game.activeUser], "Tocca a te! Gioca!", game.hands[game.activeUser]);
});

stage.register(getOpponent);
stage.register(checkOpponent);
stage.register(makeMove);
stage.register(prepGame);

bot.use(session());
bot.use(stage.middleware());

// ANCHOR bot commands
bot.start(ctx => {
  console.log("/start");
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
  ctx.scene.enter("get-opponent");
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
