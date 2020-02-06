"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const node_fetch_1 = require("node-fetch");
exports.keepHerokuAlive = functions
    .region('europe-west2')
    .pubsub.schedule('every 25 minutes')
    .onRun(() => {
    return node_fetch_1.default('https://cirullino-bot.herokuapp.com/')
        .then(res => res.json())
        .then(body => console.log(body))
        .catch(err => console.log('err'));
});
//# sourceMappingURL=index.js.map