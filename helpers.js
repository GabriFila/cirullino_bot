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
    if (card.charAt(0) == "A") {
      console.log("found ace in board");
      exit = true;
    }
  });
  return exit;
};

module.exports.getBoard = deck => {
  // FIXME doesn't work
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

module.exports.possibleCombs = array => {
  let fn = function(n, src, got, all) {
    if (n == 0) {
      if (got.length > 0) {
        all[all.length] = got;
      }
      return;
    }
    for (let j = 0; j < src.length; j++) {
      fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
    }
    return;
  };

  let all = [];

  for (let i = 1; i < array.length; i++) {
    fn(i, array, [], all);
  }

  all.push(array);

  return all;
};
