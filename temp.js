strong = { 0: ["3♦️", "2♦️", "A♦️"], 1: ["J♦️", "4♦️"] };
weak = { 0: ["5♦️", "4♦️", "7♦️"], 1: ["Q♦️", "K♦️"] };

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
    if (weakDecks[key].filter(card => card.charAt(0) == 7).length == 3) whoHasPrimiera = key;
    //calc piccola
    if (weakDecks[key].includes("A♦️") && weakDecks[key].includes("2♦️") && weakDecks[key].includes("3♦️")) {
      //   whoHasPiccola = key;
      for (let i = 0; i < 3; i++) {
        if (weakDecks[key].includes(`${i + 4}♦️`)) piccolaValue = i + 1;
        else break;
      }
      piccolaValue += 3;
      points[key] += piccolaValue;
    }
    //calc grande
    if (weakDecks[key].includes("K♦️") && weakDecks[key].includes("Q♦️") && weakDecks[key].includes("J♦️")) {
      whoHasGrande = key;
      points[key] += 5;
    }

    //calc settebello
    if (weakDecks[key].includes("7♦️")) {
      whoHasSeven = key;
      points[key]++;
    }
  }
  whoHasDiamonds = indexOfMax(diamonds);
  points[whoHasDiamonds]++;
  whoHasCards = indexOfMax(cards);
  points[whoHasCards]++;

  console.log("diamonds", diamonds);
  console.log("cards", cards);
  console.log("piccola", whoHasPiccola);
  console.log("piccola value", piccolaValue);
  console.log("grande", whoHasGrande);
  console.log("sette bello", whoHasSeven);
  console.log("primiera", whoHasPrimiera);
  return { points };
};

console.log(calculatePoints(strong, weak));

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
