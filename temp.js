const boardAndCard = [9, 4, 5, 6];
const sums = [];
const sets = [];
const isSuccessfulMove = (read, totalCards, targetSum, sets) => {
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

isSuccessfulMove([], boardAndCard, 15);

console.log(sums);
//log sums without sort to have them line up to sets or modify previous structure
console.log(sets);
