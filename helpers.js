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
