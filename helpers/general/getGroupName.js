module.exports = usernames => {
  let groupName = '';
  usernames.forEach(user => {
    groupName += `&${user}`;
  });
  return groupName.substr(1);
};
