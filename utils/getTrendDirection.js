import { SMA, RSI }  from 'technicalindicators';
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
export const getTrendDirection = (
    prices,
    shortPeriod = 10,
    longPeriod = 50,
    rsiPeriod = 14,
    overboughtThreshold = 70,
    oversoldThreshold = 30
) => {
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
        return 'up'; // Uptrend with RSI indicating overbought condition
    } if (lastShortSMA < lastLongSMA && lastRSI < oversoldThreshold) {
        return 'down'; // Downtrend with RSI indicating oversold condition
    } 
    return 'sideways'; // Sideways trend or inconclusive conditions
}