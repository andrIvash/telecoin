import { SMA, RSI, MACD, Stochastic } from 'technicalindicators';
import * as constants from '../settings/constants.js';

/**
 * Determine the direction of trend movement using SMA crossover and RSI
 * @param {Array} prices - An array of historical prices
 * @param {number} shortPeriod - Short-term SMA period
 * @param {number} longPeriod - Long-term SMA period
 * @param {number} rsiPeriod - RSI period
 * @param {number} overboughtThreshold - RSI overbought threshold (e.g., 70)
 * @param {number} oversoldThreshold - RSI oversold threshold (e.g., 30)
 * @returns {string} - 'up', 'down', 'sideways'
 *
 *  Example usage:
 * const historicalPrices = [Your array of historical prices here]
 * const shortTermPeriod = 10; // Adjust as needed
 * const longTermPeriod = 50; // Adjust as needed
 * const rsiPeriod = 14; // Adjust as needed
 * const overboughtThreshold = 70; // Adjust as needed
 * const oversoldThreshold = 30; // Adjust as needed
 */
export const trendDirectionV1 = (prices) => {
    const shortPeriod = 10;
    const longPeriod = 50;
    const rsiPeriod = 14;
    const overboughtThreshold = 70;
    const oversoldThreshold = 30;

    // Calculate short-term SMA
    const shortSMA = new SMA({ period: shortPeriod, values: prices });
    const shortSMAResult = shortSMA.getResult();

    // Calculate long-term SMA
    const longSMA = new SMA({ period: longPeriod, values: prices });
    const longSMAResult = longSMA.getResult();

    // Calculate RSI
    const rsi = new RSI({ period: rsiPeriod, values: prices });
    const rsiResult = rsi.getResult();

    // Determine the trend direction based on SMA crossover and RSI
    const lastShortSMA = shortSMAResult[shortSMAResult.length - 1];
    const lastLongSMA = longSMAResult[longSMAResult.length - 1];
    const lastRSI = rsiResult[rsiResult.length - 1];

    if (lastShortSMA > lastLongSMA && lastRSI > overboughtThreshold) {
        return 1; // Uptrend with RSI indicating overbought condition
    }
    if (lastShortSMA < lastLongSMA && lastRSI < oversoldThreshold) {
        return -1; // Downtrend with RSI indicating oversold condition
    }
    return 0; // Sideways trend or inconclusive conditions
};

/**
 * Determine the direction of trend movement using SMA, RSI and MACD
 * @returns {number} - '1', '-1', '0'
 *
 *  Example usage:
 * const historicalPrices = {high: [], low: [], close: [], open: []} //historical prices here
 * getTrendDirectionNew(historicalPrices)
 *
 * Main logic :
 * trendUp = close > sma50 and rsiTrend + stochTrend + macdTrend > 0
 * trendDown = close < sma50 and rsiTrend + stochTrend + macdTrend < 0
 */
const trendDirectionV2 = (prices) => {
    const { low, high, close } = prices;
    const sma50 = SMA.calculate({
        period: constants.MA50.period,
        values: close
    });
    const macd = new MACD({
        values: close,
        fastPeriod: constants.MACD.fastPeriod,
        slowPeriod: constants.MACD.slowPeriod,
        signalPeriod: constants.MACD.signalPeriod
    });
    const macdResult = macd.getResult();
    const macdLine = macdResult[macdResult.length - 1].MACD;
    const macdSignalLine = macdResult[macdResult.length - 1].signal;

    const stoch = Stochastic.calculate({
        period: constants.STOCH.period,
        low,
        high,
        close,
        signalPeriod: constants.STOCH.signalPeriod
    });

    const rsi = RSI.calculate({ period: constants.RSI.period, values: close });
    const lastClose = prices[prices.length - 1];

    const rsiTrend = rsi > 50 ? 1 : rsi < 50 ? -1 : 0;
    const stochTrend = stoch > 80 ? -1 : stoch < 20 ? 1 : 0;
    const macdTrend =
        macdLine > macdSignalLine ? 1 : macdLine < macdSignalLine ? -1 : 0;
    const overallTrend = rsiTrend + stochTrend + macdTrend;

    const trendUp = lastClose > sma50 && overallTrend > 0;

    const trendDown = lastClose < sma50 && overallTrend < 0;

    if (trendUp) return 1;
    if (trendDown) return -1;
    return 0;
};

export default {
    v1: trendDirectionV1,
    v2: trendDirectionV2
};
