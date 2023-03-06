require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TG_KEY, {polling: true});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет, Друг!');
});

console.log("env", process.env);