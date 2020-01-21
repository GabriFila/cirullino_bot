/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */

const circularNext = (index, array) => {
  index++;
  return index === array.length ? 0 : index;
};
module.exports.circularNext = circularNext;
