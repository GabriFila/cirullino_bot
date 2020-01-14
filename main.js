//telegram dependacies
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { Extra, Markup } = Telegraf;
//help dependacies
const fetch = require("node-fetch");
const { cardsToString, getRandomInt, composeGroupName, circularNext, elaborateMove } = require("./helpers");

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
      : {} //  Markup.removeKeyboard().extra()
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

getOpponent.enter(ctx => {
  console.info("getting-opponent");
  ctx.reply("Chi vuoi sfidare?");
  ctx.scene.enter("check-opponent");
});

checkOpponent.on("text", ctx => {
  console.info("checking-opponent");
  ctx.reply("Ricevuto! Controllo...");
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
  ctx.reply(`Contatto il tuo avversario`);

  ctx.session.opponents = players.filter(player => player.username != ctx.message.from.username.toLowerCase());

  // TODO add possibility to have multiple opponens -> multiple promises
  bot.telegram
    .sendMessage(ctx.session.opponents[0].chatId, `Sei stato invitato a giocare, se vuoi entare rispondimi /enter`)
    .then(() => {
      //hasAccepted contains the accepted status of each user in the pending game
      //order of hasAccepted is alphabetical on usernames
      const hasAccepted = players.map(_ => false);
      //of course starter player must be set to true
      hasAccepted[players.findIndex(player => player.username == ctx.message.from.username.toLowerCase())] = true;
      //create a pending game with state pending and players
      db.collection("pendingGames").add({
        usernames: players.map(player => player.username),
        chatIds: players.map(player => player.chatId),
        names: players.map(player => player.first_name),
        hasAccepted,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
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

      newGroupDbRef.set({ usernames });

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
            // TODO implement possibility of 'a monte' with 2 aces and sum of cards in board
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
            chatIds: updatedPlayers.chatIds,
            names: updatedPlayers.names
          };
          newGroupDbRef
            .collection("groupGames")
            .add({ ...newGame, createdAt: admin.firestore.FieldValue.serverTimestamp() })
            .then(gameDbRef => {
              newGroupDbRef.set({ activeGame: gameDbRef }, { merge: true });
              console.info("game-created");
              //start game by making listener on updates on game object and pushing them to all connected users
              const unsubscribe = gameDbRef.onSnapshot(doc => {
                const game = doc.data();
                const handsLenghts = [];

                for (let [key, value] of Object.entries(game.hands)) handsLenghts.push(value.length);

                if (handsLenghts.every(length => length == 0) && game.deck.length == 0) {
                  unsubscribe();

                  // calculate points
                  // send points to users
                  console.log("game ended");
                } else {
                  console.info("ask-move");
                  const { activeUser } = game;
                  let message = `In tavola:   ${cardsToString(game.board)}\n`;

                  game.chatIds.forEach((chatId, i) => {
                    message += `Hai:\n  ${game.userStrongDeck[i].length} scope\n  ${game.userWeakDeck[i].length} carte nel tuo mazzetto`;
                    sendToUser(game.chatIds[i], message);
                    // say to others whose turn it is
                    if (i == activeUser) sendToUser(game.chatIds[activeUser], "Tocca a te", game.hands[activeUser]);
                    else sendToUser(game.chatIds[i], `Tocca a ${game.names[activeUser]}`);
                    //clear messagefor next iteration

                    // FIXME promise logic to order sending message
                    message = `In tavola:   ${cardsToString(game.board)}\n`;
                  });
                }
                // TODO add logic for multiple promises
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

bot.hears(/[A0123456789JQK][♥️♦♣♠]/, ctx => {
  // TODO check if user is in game
  //when bot receives a card it checks if the user has an active game, if so it checks if it is the active user, then processes the move e updates the other players
  const { text } = ctx.message;
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
stage.register(getOpponent);
stage.register(checkOpponent);
stage.register(callOpponent);

bot.use(session());
bot.use(stage.middleware());

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

//suit emojis
//♥️
//♦
//♣
//♠

// ANCHOR hint
//to have separate buttons in keyboard for cards in hand
//[["one"], ["two", "three"]]
