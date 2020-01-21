// FIXME fix groupnames sorting
const getGroupName = usernames => {
  let groupName = '';
  usernames.forEach(user => {
    groupName += `&${user}`;
  });
  return groupName.substr(1);
};
module.exports = getGroupName;
