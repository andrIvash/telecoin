import * as dotenv from 'dotenv';
import * as TelegramBot from 'node-telegram-bot-api';
// const TelegramBot = require('node-telegram-bot-api');
dotenv.config();
const bot = new TelegramBot(process.env.TG_KEY, { polling: true });

const keyboard = [
    [
        {
            text: 'BTC',
            callback_data: 'btc'
        }
    ],
    [
        {
            text: 'ETH',
            callback_data: 'eth'
        }
    ]
];

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello, my friend!', {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    let currency = '';

    if (query.data === 'btc') {
        currency = 'BTC';
    }

    if (query.data === 'eth') {
        currency = 'ETH';
    }

    if (currency) {
        bot.sendMessage(chatId, currency, {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } else {
        bot.sendMessage(chatId, `Hm... let's try again?`, {
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
});
