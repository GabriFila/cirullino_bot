const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
};

module.exports.getRandomInt = getRandomInt;

const composeGroupName = usernames => {
  let groupName = "";
  usernames.forEach(user => (groupName += `&${user}`));
  return groupName.substr(1);
};

module.exports.composeGroupName = composeGroupName;

module.exports.cardsToString = cards => cards.toString().replace(/,/gi, "   ");

const cardToValue = card => {
  // TODO implement object key-value logic instead of switch
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

module.exports.cardToValue = cardToValue;

const areThereAces = board => {
  let exit = false;
  board.forEach(card => {
    if (card.charAt(0) == "A") {
      console.log("found ace in board");
      exit = true;
    }
  });
  return exit;
};

module.exports.areThereAces = areThereAces;

const getBoard = deck => {
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
module.exports.getBoard = getBoard;

const possibleCombs = array => {
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
module.exports.possibleCombs = possibleCombs;

const circularNext = (index, array) => {
  index++;
  return index == array.length ? 0 : index;
};
module.exports.circularNext = circularNext;

const elaborateMove = (usedCard, board, strongDeck, weakDeck, cardsRemoved) => {
  //check if card is ace
  const usedCardValue = cardToValue(usedCard);

  //check if scopa with ace
  if (usedCardValue == 1 && !areThereAces(board)) {
    strongDeck.push(usedCard);
    board.forEach(card => weakDeck.push(card));
    cardsRemoved.push([...board]);
    board.splice(0, board.length);
    return "scopa";
  }
  // TODO make functions for same scopa
  //check if scopa with total of board equal to used card
  const boardTotal = board.map(card => cardToValue(card)).reduce((acc, val) => acc + val, 0);

  if (boardTotal == usedCardValue || boardTotal + usedCardValue == 15) {
    strongDeck.push(usedCard);
    board.forEach(card => weakDeck.push(card));
    cardsRemoved.push([...board]);
    board.splice(0, board.length);
    return "scopa";
  }

  //check if 'presa da 15'

  // all possible combinations of board
  let allCombinations = possibleCombs([usedCard, ...board]);
  // take all the combinations that include the usedCard and of those the ones which sum up to 15
  let combs15 = allCombinations
    .filter(comb => comb.includes(usedCard))
    .filter(elm => elm.reduce((acc, val) => (acc += cardToValue(val)), 0) == 15);

  if (combs15.length > 0) {
    //there is a 15 combination
    //pick the first combination
    // TODO let user choose his own move
    firstComb15 = combs15[0];

    //put good combination of card to weak deck
    console.log(weakDeck);
    firstComb15.forEach(card => weakDeck.push(card));
    console.log(weakDeck);

    //remove used card from good combination
    firstComb15.splice(firstComb15.indexOf(usedCard), 1);

    cardsRemoved.push([...firstComb15]);

    //remove good combination from board
    firstComb15.forEach(card => board.splice(board.indexOf(card), 1));
    return "presa con 15";
  } else {
    // take all the combinations that include the usedCard and of those the ones which sum up to 15
    allCombinations = possibleCombs([...board]);
    const combsUsedCard = allCombinations.filter(elm => elm.reduce((acc, val) => (acc += cardToValue(val)), 0) == usedCardValue);

    if (combsUsedCard.length > 0) {
      // console.log("combinations: ", combinations);
      firstComb = combsUsedCard[0];
      firstComb.forEach(card => weakDeck.push(card));
      weakDeck.push(usedCard);

      cardsRemoved.push([...firstComb]);

      firstComb.forEach(card => board.splice(board.indexOf(card), 1));

      return "presa normale";
    } else {
      board.push(usedCard);
      return "calata";
    }
  }
};

module.exports.elaborateMove = elaborateMove;
