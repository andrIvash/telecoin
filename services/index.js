import Binance from 'node-binance-api';
import { SMA, RSI, VWAP, OBV }  from 'technicalindicators';

// Initialize Binance API client
const binance = new Binance().options({
    APIKEY: process.env.B_KEY,
    APISECRET: process.env.BS_KEY
});

const calculateSignals = (currency, timeframe, cb) => {
    console.log(`go: ${  currency}`);
    const symbol = currency || 'BTCUSDT'; //
    const interval = timeframe || '15m';// '1h';
    const periods = {
        sma20: 20,
        sma50: 50,
        sma100: 100,
        rsi: 14,
        vwap: 60,
        obv: null // this can be set dynamically based on the time interval
    };
    const stopLoss = 0.01;
    const takeProfit = 0.03;

    // Fetch historical price data
    binance.candlesticks(symbol, interval, (error, ticks, selectedSymbol) => {
        if (error) {
            console.error(error, selectedSymbol);
            return;
        }

        // Format price data
        const prices = ticks.map(tick => parseFloat(tick[4]));

        // Calculate technical indicators
        const sma20 = SMA.calculate({ period: periods.sma20, values: prices });
        const sma50 = SMA.calculate({ period: periods.sma50, values: prices });
        const sma100 = SMA.calculate({ period: periods.sma100, values: prices });
        const rsi = RSI.calculate({ period: periods.rsi, values: prices });
        const vwap = VWAP.calculate({
            period: periods.vwap,
            volume: ticks.map(tick => parseFloat(tick[5])),
            high: ticks.map(tick => parseFloat(tick[2])),
            low: ticks.map(tick => parseFloat(tick[3])),
            close: prices
        });
        const obv = OBV.calculate({ close: prices, volume: ticks.map(tick => parseFloat(tick[7])) });

        // Determine entry and exit points
        const lastPrice = prices[prices.length - 1];
        const lastRsi = rsi[rsi.length - 1];
        const lastObv = obv[obv.length - 1];
        const lastVwap = vwap[vwap.length - 1];
        const lastSma20 = sma20[sma20.length - 1];
        const lastSma50 = sma50[sma50.length - 1];
        const lastSma100 = sma100[sma100.length - 1];

        if (lastRsi > 50 && lastSma20 > lastSma50 && lastSma50 > lastSma100) {
            // up
            if (lastPrice > lastVwap && lastObv > 0) {
                const stopLossLevel = lastPrice - (lastPrice * stopLoss);
                const takeProfitLevel = lastPrice + (lastPrice * takeProfit);
                const isReverse = lastPrice < lastSma20 || lastRsi < 50 || lastObv < 0 || lastPrice < lastVwap;
                const result = {
                    current: lastPrice,
                    currency,
                    shouldBuy: isReverse ? false :
                        lastPrice > lastVwap && lastObv > 0,
                    stopLossLevel,
                    takeProfitLevel,
                    reverse: isReverse
                }
                console.log(`${selectedSymbol} r-up: `, result);
                cb(result);
            }

        } else if (lastRsi < 50 && lastSma20 < lastSma50 && lastSma50 < lastSma100) {
            // down
            const stopLossLevel = lastPrice + (lastPrice * stopLoss);
            const takeProfitLevel = lastPrice - (lastPrice * takeProfit);
            const isReverse = lastPrice > lastSma20 || lastRsi > 50 || lastObv > 0 || lastPrice > lastVwap
            const result = {
                current: lastPrice,
                currency,
                shouldSell: isReverse ? false :
                    lastPrice < lastVwap && lastObv < 0,
                stopLossLevel,
                takeProfitLevel,
                reverse: isReverse
            }
            console.log(`${selectedSymbol} r-down: `, result);
            cb(result);
        } else {
            const lastTick = ticks[ticks.length - 1];
	        const [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = lastTick;
	        console.log(`last close: ${close}`);
            cb({currency, close});
        }   
    });
};

export default {
    calculateSignals
}