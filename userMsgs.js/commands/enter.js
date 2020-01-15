const admin = require("../../firebase");
const { db } = require("../../firebase");
//helper
const { composeGroupName, cardsToString, calculatePoints } = require("../../helpers/game");
const { sendToUser } = require("../../helpers/common");

//game helpers
const { buildGame } = require("../../helpers/game");

const enterHandler = ctx => {
  console.info("/enter");
  //check if there is a pending game with the username
  //if there is , it changes the corresponding state of the player and then if all the players are true the game starts
  const senderUsername = ctx.message.from.username.toLowerCase();
  const pendingGameRef = db.collection("pendingGames").where("usernames", "array-contains", `${senderUsername}`);

  pendingGameRef.get().then(querySnapshot => {
    querySnapshot.forEach(pendingGameDbRef => {
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
          const newGame = buildGame(deckDbRef.data().deck, updatedPlayers.chatIds, updatedPlayers.names);
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
                  const results = calculatePoints(game.userStrongDeck, game.userWeakDeck);
                  console.log("strong", game.userStrongDeck);
                  console.log("weak", game.userWeakDeck);
                  console.log(results);
                  // Hai ottenuto in totale x punti
                  // mazzo: denari,settebello,carte,primiera
                  // alta
                  // piccola fino al x

                  game.chatIds.forEach((chatId, i) =>
                    sendToUser(
                      chatId,
                      `Il gioco è terminato!\nHai ottenuto in totale ${results.points[i]} punti\nDi mazzo: ${
                        results.whoHasDiamonds == i ? "denari," : ""
                      } ${results.whoHasCards == i ? "carte," : ""} ${results.whoHasSeven == i ? "sette bello," : ""} ${
                        results.whoHasPrimiera == i ? "primiera" : ""
                      }\n${results.whoHasGrande == i ? "grande" : ""}\n${
                        results.whoHasPiccola == i ? `piccola fino al ${results.piccolaValue}` : ""
                      }`
                    )
                  );
                  //update points in db
                  game.points = results.points;
                  gameDbRef.set({ game }, { merge: true });

                  // calculate points
                  // send points to users
                  console.log("game ended");
                } else {
                  console.info("ask-move");
                  const { activeUser } = game;
                  // TODO change messgge if table is empty
                  let message = `In tavola:   ${cardsToString(game.board)}\n`;

                  game.chatIds.forEach((chatId, i) => {
                    userMsg = `Hai:\n  scope: ${game.userStrongDeck[i].length}\n  mazzetto: ${game.userWeakDeck[i].length}`;
                    sendToUser(chatId, message + userMsg).then(_ => {
                      if (i == activeUser) sendToUser(game.chatIds[activeUser], "Tocca a te", game.hands[activeUser]);
                      else sendToUser(chatId, `Tocca a ${game.names[activeUser]}`);
                    });
                  });
                }
              });
            });
        })
        .catch(err => {
          console.error(err);
        });
    });
  });
};

module.exports = enterHandler;
