// function to convert a card from string to integer

module.exports = card => {
  let value = card.charAt(0);

  if (Number.isNaN(Number(value))) {
    const valueMap = {
      A: 1,
      J: 8,
      Q: 9,
      K: 10
    };
    value = valueMap[value];
  } else value = Number(value);

  const suitMap = {
    '\u2665': 0,
    '\u2666': 10,
    '\u2663': 20,
    '\u2660': 30
  };

  const suit = suitMap[card.charAt(1)];

  return value + suit;
};

// ♥️
// ♦
// ♣
// ♠
