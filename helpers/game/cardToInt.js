// function to convert a card from string to integer

const cardToInt = card => {
  let value = card.charAt(0);

  if (isNaN(Number(value))) {
    const valueMap = {
      A: 1,
      J: 8,
      Q: 9,
      K: 10
    };
    value = valueMap[value];
  } else value = Number(value);

  const suitMap = {
    '\u2665': -1,
    '\u2666': 9,
    '\u2663': 19,
    '\u2660': 29
  };

  const suit = suitMap[card.charAt(1)];
  return value + suit;
};

module.exports = cardToInt;

// ♥️
// ♦
// ♣
// ♠
