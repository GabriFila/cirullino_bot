import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

export const keepHerokuAlive = functions
  .region('europe-west2')
  .pubsub.schedule('every 25 minutes')
  .onRun(() => {
    return fetch('https://cirullino-bot.herokuapp.com/')
      .then(res => res.json())
      .then(body => console.log(body))
      .catch(err => console.log('err'));
  });
