require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const service = require("./services/index");

const bot = new TelegramBot(process.env.TG_KEY, {polling: true});
let timeOutFunctionId;
const initialKeyboard = [
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
    ],
    [
        {
          text: 'ADA',
          callback_data: 'ada'
        }
    ],
    [
        {
          text: 'DOGE',
          callback_data: 'doge'
        }
    ],
    [
        {
          text: 'SHIB',
          callback_data: 'shib'
        }
    ],
    [
        {
          text: 'BUSD',
          callback_data: 'busd'
        }
    ]
];
const activeKeyboard = [
    [
      {
        text: 'Stop',
        callback_data: 'stop'
      }
    ]
];

const formatResult = (data) => {
    if (data.hasOwnProperty('close')) {
        return `*${data.currency}:*\nlast close: ${data.close}`
    } else if (data.hasOwnProperty('shouldSell')) {
        return `
            *${data.currency}:*
            price: ${data.current}
            \u{2B07}shouldSell: *${data.shouldSell}*
            \u{25FC}stopLossLevel: ${data.stopLossLevel}
            \u{25FC}takeProfitLevel: ${data.takeProfitLevel}
            \u{25FC}reverse: *${data.reverse}*\n
        `;
    } else if (data.hasOwnProperty('shouldBuy')) {
        return `
            *${data.currency}:*
            price: ${data.current}
            \u{2B06}shouldBuy: *${data.shouldBuy}*
            \u{25FC}stopLossLevel: ${data.stopLossLevel}
            \u{25FC}takeProfitLevel: ${data.takeProfitLevel}
            \u{25FC}reverse: *${data.reverse}*
        `;
    } else {
        return `*${data.currency}:*\n\u{2757}\u{2757} no data`;
    }
};


bot.on('message', (msg, ) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello, my friend!', {
        reply_markup: {
            inline_keyboard: initialKeyboard
        }
    });
});

bot.on('callback_query', (query) => {
    clearTimeout(timeOutFunctionId);

    const chatId = query.message.chat.id;
    let currency = '';

    if (query.data === 'stop') {
        currency = '';
    }
  
    if (query.data === 'btc') {
        currency = 'BTCUSDT';
    }
  
    if (query.data === 'eth') {
        currency = 'ETHUSDT';
    }

    if (query.data === 'ada') {
        currency = 'ADAUSDT';
    }

    if (query.data === 'doge') {
        currency = 'DOGEUSDT';
    }
    
    if (query.data === 'shib') {
        currency = 'SHIBUSDT';
    }

    if (query.data === 'busd') {
        currency = 'BUSDUSDT';
    }

    if (currency) {
        service.calculateSignals(currency, null, (result) => {
            bot.sendMessage(chatId, formatResult(result), {
                reply_markup: {
                    inline_keyboard: activeKeyboard
                },
                parse_mode: 'Markdown'
            });
        })
        timeOutFunctionId = setInterval(() => {
            service.calculateSignals(currency, null, (result) => {
                bot.sendMessage(chatId, formatResult(result), {
                    reply_markup: {
                        inline_keyboard: activeKeyboard
                    },
                    parse_mode: 'Markdown'
                });
            })
        }, 20000);
    } else {
        bot.sendMessage(chatId, `Hm... let's try again?`, {
            reply_markup: {
                inline_keyboard: initialKeyboard
            }
        });
    }
});