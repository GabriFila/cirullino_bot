require("dotenv").config();

module.exports = { URL: process.env.URL, BOT_TOKEN: process.env.BOT_TOKEN, PORT: process.env.PORT || 2000, ENV: process.env.NODE_ENV };
