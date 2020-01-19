const cardToInt = require('./helpers/game/cardToInt');

const card = ['A♥️', '3♦', 'J♣', 'K♠'];

console.log(card.map(card => (cardToInt(card) % 10) + 1));

// ♥️
// ♦
// ♣
// ♠

// deck is array from 0 to 39
