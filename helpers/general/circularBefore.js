module.exports = (index, array) => {
  index -= 1;
  return index === -1 ? array.length - 1 : index;
};
