
import { SMA, RSI, MACD }  from 'technicalindicators';
import * as constants from '../settings/constants';
/**
 * Determine the direction of trend movement using SMA, RSI and MACD
 * @returns {number} - '1', '-1', '0'
 * 
 *  Example usage:
 * const historicalPrices = [Your array of historical prices here]
 * getTrendDirectionNew(historicalPrices)
 * 
 * Main logic : 
 * trendUp = close > sma50 and rsi > rsi_oversold and macdLine > signalLine
 * trendDown = close < sma50 and rsi < rsi_overbought and macdLine < signalLine
*/
export const getTrendDirectionNew = (prices) => {
    const sma50 = SMA.calculate({ period: constants.MA50.period, values: prices });
    const macd = new MACD({
        values: prices,
        fastPeriod: constants.MACD.fastPeriod,
        slowPeriod: constants.MACD.slowPeriod,
        signalPeriod: constants.MACD.signalPeriod
    });
    const macdResult = macd.getResult();
    const macdLine = macdResult[macdResult.length - 1].MACD;
    const macdSignalLine = macdResult[macdResult.length - 1].signal;
    const rsi = RSI.calculate({ period: constants.RSI.period, values: prices });
    const lastClose = prices[prices.length - 1];
    const trendUp = lastClose > sma50 && rsi > constants.RSI.oversold && macdLine > macdSignalLine;
    const trendDown = lastClose < sma50 && rsi < constants.RSI.overbought && macdLine < macdSignalLine;

    if (trendUp) return 1;
    if (trendDown) return -1;
    return 0;
}