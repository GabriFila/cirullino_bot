module.exports = (target, all) => {
  let answer = false;

  all.forEach(poss => {
    if (poss.filter(card => target.includes(card)).length === target.length)
      answer = true;
  });

  return answer;
};
