/* eslint-disable comma-dangle */
const admin = require('firebase-admin');
require('./config');

admin.initializeApp({
  credential: admin.credential.cert({
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL
  }),
  databaseURL: 'https://cirullino-a81df.firebaseio.com'
});

module.exports = admin;
module.exports.db = admin.firestore();
