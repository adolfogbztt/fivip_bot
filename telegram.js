const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

// replace the value below with the Telegram token you receive from @BotFather
const token = "5032933269:AAEcx52rw94BvloAp3UDjqg2qEIhBmnrp5U";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches /photo

bot.onText(/\/start/, function onPhotoText(msg) {
  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(msg.chat.id, "Menu");
  bot.sendMessage(msg.chat.id, "/tasa");
});

bot.onText(/\/tasa/, function onPhotoText(msg) {
  const rawdata = fs.readFileSync("cambios.json");

  const cambios = JSON.parse(rawdata);
  const cam = Object.keys(cambios);

  const enviable = cam.filter((v, index) => {
    return cambios[v].telegram;
  });

  const cambio_actual = cambios[enviable];

  // From file path
  const photo = `./images/${cambio_actual.imagen_rename}`;
  bot.sendPhoto(msg.chat.id, photo, {
    caption: "Tasa Actualizada " + new Date().toDateString(),
  });
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId, msg.text);
  // send a message to the chat acknowledging receipt of their message
  // bot.sendMessage(chatId, 'Received your message');
});
