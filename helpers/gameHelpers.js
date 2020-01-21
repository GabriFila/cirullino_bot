/* eslint-disable no-return-assign */

// FIXME fix groupnames sorting
const composeGroupName = usernames => {
  let groupName = '';
  usernames.forEach(user => (groupName += `&${user}`));
  return groupName.substr(1);
};
module.exports.composeGroupName = composeGroupName;
