import Binance from 'node-binance-api';
import { SMA, RSI, VWAP, OBV, Stochastic }  from 'technicalindicators';
import {
    getTrendDirection,
    detectTrendReversal,
    detectPatterns,
    getFormattedPrice,
    getPricePeacks,
    checkDivergence
} from "../utils/index.js";

// Initialize Binance API client
const binance = new Binance().options({
    APIKEY: process.env.B_KEY,
    APISECRET: process.env.BS_KEY,
    "family": 4,
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
        obv: null, // this can be set dynamically based on the time interval
        stochPeriod: 14,
        stochSignalPeriod: 3,
        atr: 14
    };
    const stopLoss = 0.01;
    const takeProfit = 0.03;
    const stochThreshold = 80;
    const riskFactor = 1.0;
    const rewaerdFactor = 1.5;

    // Fetch historical price data
    binance.candlesticks(symbol, interval, (error, ticks, selectedSymbol) => {
        if (error) {
            console.error(error, selectedSymbol);
            return;
        }

        // Format price data
        const  resultPrices = ticks.map(tick => {
            return {
                open: parseFloat(tick[1]),
                high: parseFloat(tick[2]),
                low: parseFloat(tick[3]),
                close: parseFloat(tick[4]),
            }
        });
        const prices = resultPrices.map(p => p.close);
        const highPrices = resultPrices.map(p => p.high);
        const lowPrices = resultPrices.map(p => p.low);
        const openPrices = resultPrices.map(p => p.open);
        const formattedPrice = getFormattedPrice(resultPrices, 20);
        console.info("prices", prices);
        console.log("resultPrice1", resultPrices.slice(-2));
        console.log("resultPrice2", getFormattedPrice(resultPrices, 2));
        // test space
        console.log("trend:", getTrendDirection(prices));    
        
        const isReversal = detectTrendReversal({
            lowPrices,
            highPrices,
            prices
        });
        if (isReversal) {
            console.log('Potential trend reversal detected!');
        } else {
            console.log('No trend reversal detected.');
        }

        console.log("pattern: ", detectPatterns(formattedPrice));
        // =>

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
        const stoch = Stochastic.calculate({
            period: periods.stochPeriod,
            low: lowPrices,
            high: highPrices,
            close: prices,
            signalPeriod: periods.stochSignalPeriod
        })

        if (stoch[stoch.length - 1].k >= stochThreshold) {
            console.log('Stoch: Sell Signal');
        } else if (stoch[stoch.length - 1].k <= 100 - stochThreshold) {
            console.log('Stoch: Buy Signal');
        } else {
            console.log('Stoch: No Signal');
        }

        // divergence
        const peacks = getPricePeacks(prices);
        console.log("peacks", peacks);
        checkDivergence(prices, rsi, stoch);
        // =>

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
    }, {limit: 100});
};

export default {
    calculateSignals
}