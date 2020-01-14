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
    firstComb15.forEach(card => weakDeck.push(card));

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

const calculatePoints = (strongDecks, weakDecks) => {
  const points = [];
  const diamonds = [];
  const cards = [];
  let whoHasDiamonds = -1;
  let whoHasCards = -1;
  let whoHasPiccola = -1; // if someone hasthen it is the player index
  let whoHasPrimiera = -1; // if someone hasthen it is the player index
  let piccolaValue = 0;
  let whoHasGrande = -1; // if someone hasthen it is the player index
  let whoHasSeven = -1; // if someone hasthen it is the player index

  // add 'scope' to points
  for (let [key, value] of Object.entries(strongDecks)) {
    points.push(value.length);
    //then pass strong cards into weak
    weakDecks[key].push(...strongDecks[key]);
    //count denari
    diamonds.push(weakDecks[key].filter(card => card.charAt(1) == "\u2666").length);
    //count cards
    cards.push(weakDecks[key].length);
    // TODO keep going on primiera
    if (weakDecks[key].filter(card => card.charAt(0) == 7).length == 3) whoHasPrimiera = Number(key);
    //calc piccola
    if (weakDecks[key].includes("A♦️") && weakDecks[key].includes("2♦️") && weakDecks[key].includes("3♦️")) {
      whoHasPiccola = Number(key);
      for (let i = 0; i < 3; i++) {
        if (weakDecks[key].includes(`${i + 4}♦️`)) piccolaValue = i + 1;
        else break;
      }
      piccolaValue += 3;
      points[key] += piccolaValue;
    }
    //calc grande
    if (weakDecks[key].includes("K♦️") && weakDecks[key].includes("Q♦️") && weakDecks[key].includes("J♦️")) {
      whoHasGrande = Number(key);
      points[key] += 5;
    }

    //calc settebello
    if (weakDecks[key].includes("7\u2666")) {
      whoHasSeven = Number(key);
      points[key]++;
    }
  }

  // TODO check equality case in denari and carte
  whoHasDiamonds = indexOfMax(diamonds);
  points[whoHasDiamonds]++;
  whoHasCards = indexOfMax(cards);
  points[whoHasCards]++;

  // console.log("diamonds", diamonds);
  // console.log("cards", cards);
  // console.log("piccola", whoHasPiccola);
  // console.log("piccola value", piccolaValue);
  // console.log("grande", whoHasGrande);
  // console.log("sette bello", whoHasSeven);
  // console.log("primiera", whoHasPrimiera);
  return { points, whoHasCards, whoHasDiamonds, whoHasPiccola, piccolaValue, whoHasGrande, whoHasSeven, whoHasPrimiera };
};

module.exports.calculatePoints = calculatePoints;

function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}
