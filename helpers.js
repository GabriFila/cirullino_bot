module.exports.getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
};

module.exports.composeGroupName = usernames => {
  let groupName = "";
  usernames.forEach(user => (groupName += `&${user}`));
  return groupName.substr(1);
};

module.exports.cardsToString = cards => cards.toString().replace(/,/gi, "   ");

module.exports.cardToValue = card => {
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

module.exports.areThereAces = board => {
  let exit = false;
  board.forEach(card => {
    if (card.charAt(0) == "A") exit = true;
  });
  return exit;
};

module.exports.getBoard = deck => {
  const board = deck.splice(0, 4);
  board
    .filter(card => cardToValue(card) == 1)
    .forEach((ace, i) => {
      if (i > 0) {
        //move ace from board to deck
        deck.push(board.splice(board.indexOf(ace), 1));
        let newCard = deck.splice(0, 1);
        while (cardToValu(newCard) == 1) {
          deck.push(newCard);
          newCard = deck.splice(0, 1);
        }
        board.push(newCard);
      } else {
        console.log("Too many aces in deck");
      }
    });
};

// to call isSuccessfulMove([], boardAndCard, 15);
module.exports.isSuccessfulMove = (read, totalCards, targetSum, sets) => {
  if (read.length == 4 || (read.length <= 4 && totalCards.length == 0)) {
    if (read.length > 0) {
      let total = read.reduce(function(a, b) {
        return a + b;
      }, 0);
      // TODO implement possibility of multiple fifteen
      if (sums.indexOf(total) == -1 && total == targetSum) {
        sums.push(total);
        sets.push(read.slice().sort());
        return;
      }
    }
  } else {
    isSuccessfulMove(read.concat(totalCards[0]), totalCards.slice(1), targetSum);
    isSuccessfulMove(read, totalCards.slice(1), targetSum);
  }
};
