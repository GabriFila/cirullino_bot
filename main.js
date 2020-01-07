//telegram dependacies
const Telegraf = require("telegraf");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const { Markup } = Telegraf;
const fetch = require("node-fetch");
const admin = require("firebase-admin");

require("dotenv").config();

const URL = process.env.URL; // get the Heroku config var URL
const BOT_TOKEN = process.env.BOT_TOKEN; // get Heroku config var BOT_TOKEN
const PORT = process.env.PORT || 2000;

const bot = new Telegraf(BOT_TOKEN);

if (process.env.NODE_ENV == "dev") {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`).then(() => {
    console.log("webhook deleted");
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

db.collection("users")
  .doc("GabriFila")
  .get()
  .then(doc => console.log(doc.data()));

db.collection("users")
  .doc("vediamo")
  .set({ hello: "word" });

//create bot

bot.start(ctx => {
  const newUserRef = db.collection("users").doc(`${ctx.message.chat.username}`);

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

const getOpponent = new WizardScene(
  "get-opponent",
  ctx => {
    ctx.reply("Chi vuoi sfidare?");
    return ctx.wizard.next();
  },
  ctx => {
    //check if user exists
    const targetUsername = ctx.message.text;

    const opponentRef = db.collection("users").doc(`${targetUsername}`);
    ctx.reply(`Controllo che l'utente abbia attivato il gioco...`);
    opponentRef
      .get()
      .then(doc => {
        if (doc.exists) {
          const targetUser = doc.data();
          bot.telegram
            .sendMessage(targetUser.chatId, `${targetUser.first_name} sei stato invitato a giocare`)
            .then(() => {
              //success in sending message
              let player1, player2;
              if (ctx.message.from.username < targetUsername) {
                player1 = ctx.message.from.username;
                player2 = targetUsername;
              } else {
                player1 = targetUsername;
                player2 = ctx.message.from.username;
              }
              const newGroup = db.collection("groups").doc(`${player1}&${player2}`);

              newGroup.set({
                components: {
                  0: player1,
                  1: player2
                }
              });
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
                    activeUser: player2
                  };
                  groupGames.add(newGame).then(() => {
                    ctx.session.newGame = newGame;
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
          ctx.reply(`Perfetto! Ora puoi giocare con ${targetUser.first_name}`);
        } else {
          ctx.reply(`${ctx.message.text}non si è connesso a cirullino, introltragli questo link`);
          ctx.reply(` http://t.me/cirullino_bot `);
          return;
        }
      })
      .catch(err => console.error(err));
    return ctx.wizard.next();
  }
);

const makeMove = new WizardScene(
  "make-move",
  ctx => {
    console.log(ctx.session.data);
    ctx.reply(
      `Fai la tua mossa`,
      Markup.keyboard(ctx.session.newGame.hands[0], { columns: 3 })
        .oneTime()
        .resize()
        .extra()
    );
    return ctx.wizard.next();
  },
  ctx => {
    console.log(ctx.message.text);

    return ctx.wizard.next();
  }
);

const stage = new Stage([getOpponent, makeMove]);

bot.use(session());
bot.use(stage.middleware());

bot.command("newgame", ctx => {
  //enter a scene
  ctx.scene.enter("get-opponent");
});
bot.hears("test", ctx => {
  ctx.reply("funziono");
  //ctx.scene.enter("make-move");
});
bot.on("text", ctx => {
  console.log("veod");
  ctx.reply(ctx.message.text);
  ctx.reply(process.env.FIREBASE_CLIENT_EMAIL);
});

// keyboad setup
// bot.command("", ctx => {
//   ctx.reply(
//     `Ready to save: .
//   What category should it be?`,
//     Markup.keyboard(["Articles & News", "Releases", "Libs & Demos", "Silly stuff"], { columns: 3 })
//       .oneTime()
//       .resize()
//       .extra()
//   );
// });

//suit emojis
//♥️
//♦
//♣
//♠
// ["Articles & News", "Releases", "Libs & Demos", "Silly stuff"]

//to have separate buttons in keyboard for cards in hand
//[["one"], ["two", "three"]]
