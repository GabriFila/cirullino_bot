const chatIds = [319948189, 1002253962];
//const chatIds = [0, 0];
const bot = require("./bot");

const sendToUser = (chatId, text, buttons, columns) =>
  bot.telegram.sendMessage(
    chatId,
    text,
    buttons
      ? Markup.keyboard(buttons, { columns: columns ? columns : buttons.length })
          .oneTime()
          .resize()
          .extra()
      : // TODO implement logic in order to not send buttons
        {} //  Markup.removeKeyboard().extra()
  );

// chatIds.forEach((chatId, i) => {
//   console.log("start", i);
//   bot.telegram.sendMessage(chatId, "prova").then(_ => console.log("Sent", i));
//   console.log("end", i);
// });

// Promise.all(chatIds.map((chatId, i) => bot.telegram.sendMessage(chatId, "prova").then(_ => console.log("Sent", i))))
//   .then(msg => console.log(msg))
//   .catch(err => console.log("prom error", err));

console.log("before");
let message = `In tavola:   \n`;
Promise.all(
  chatIds.map((chatId, i) => {
    userMsg = `Hai:\n carte nel tuo mazzetto`;
    console.log("sent", i);
    return sendToUser(chatId, message + userMsg);

    //clear messagefor next iteration
  })
).then(_ => console.log("sent board status, sending turn"));
console.log("after");
