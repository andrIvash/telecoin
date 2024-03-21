import { SMA, RSI, ADX, MACD, bullish, bearish }  from 'technicalindicators';
import { getTrendDirection } from './getTrendDirection';

/**
 * Determine a potential trend reversal using MACD and ADX
 * @param {Object} prices - An array of historical prices
 * @param {number} shortPeriod - Short-term EMA period for MACD
 * @param {number} longPeriod - Long-term EMA period for MACD
 * @param {number} signalPeriod - Signal period for MACD
 * @param {number} adxPeriod - ADX period
 * @param {number} adxThreshold - ADX threshold for trend strength (e.g., 25)
 * @returns {boolean} - true if a potential reversal is detected, false otherwise
 * const historicalPrices = [Your array of historical prices here];
 * const shortTermPeriod = 12; // Adjust as needed
* const longTermPeriod = 26; // Adjust as needed
 * const signalPeriod = 9; // Adjust as needed
 * const adxPeriod = 14; // Adjust as needed
 * const adxThreshold = 25; // Adjust as needed
 */

export const detectTrendReversal = (
    prices,
    shortPeriod = 12,
    longPeriod = 26,
    signalPeriod = 9,
    adxPeriod = 14,
    adxThreshold = 25
) => {
    // Calculate MACD
    const macdInput = { values: prices.prices, fastPeriod: shortPeriod, slowPeriod: longPeriod, signalPeriod };
    const macd = new MACD(macdInput);
    const macdResult = macd.getResult();

    // Calculate MACD Histogram
    const macdHistogram = macdResult.map((point) => point.histogram);

    // Calculate ADX
    const adxInput = { close: prices.prices, high: prices.highPrices, low: prices.lowPrices, period: adxPeriod };
    const adx = new ADX(adxInput);
    const adxResult = adx.getResult();

    // Check for potential trend reversal
    const lastMacdHistogram = macdHistogram[macdHistogram.length - 1];
    const lastAdx = adxResult[adxResult.length - 1];

    // Criteria for potential reversal: MACD Histogram crossover above zero and ADX indicating weakening trend
    if (lastMacdHistogram > 0 && lastAdx < adxThreshold) {
        return true; // Potential trend reversal
    } 
    return false; // No trend reversal detected
}

  
/**
   * Calculate the average volatility of historical prices
   * @param {Array} prices - An array of historical prices with OHLC format
   * @returns {number} - Average volatility
   */
const calculateAverageVolatility = (prices) => {
    const priceRanges = prices.high.map((high, i) => high - prices.low[i]);
    const averageVolatility = priceRanges.reduce((sum, range) => sum + range, 0) / priceRanges.length;
    return averageVolatility;
}

/**
 * Determine potential bullish or bearish reversal figures (Double Tops, Head and Shoulders)
 * @param {Object} prices - An object of historical prices with OHLC format
 * @returns {string} - 'bullish', 'bearish', or 'none'
 */
const detectBullishFigures = (prices) => {
    return bullish(prices);
}

const detectBearishFigures = (prices) => {
    return bearish(prices);
}

/**
 * Check if prices form a Rectangle pattern
 * @param {Array} prices - An array of historical prices with OHLC format
 * @returns {boolean} - true if a Rectangle pattern is detected, false otherwise
 */
const isRectanglePattern = (prices) => {  
    const priceRange = Math.max(...prices.high) - Math.min(...prices.low);
    // Adjust the threshold based on the average volatility
    const averageVolatility = calculateAverageVolatility(prices);
    const threshold = 1.5 * averageVolatility;
    return priceRange < threshold;
}
  
/**
   * Check if prices form a Flag pattern
   * @param {Array} prices - An array of historical prices with OHLC format
   * @returns {boolean} - true if a Flag pattern is detected, false otherwise
   */
const isFlagPattern = (prices) => {  
    const priceChannelWidth = Math.max(...prices.high) - Math.min(...prices.low);
    const priceOpenCloseDistance = Math.max(...prices.open) - Math.min(...prices.open);
    // Adjust the threshold based on the average volatility
    const averageVolatility = calculateAverageVolatility(prices);
    const channelWidthThreshold = 0.5 * averageVolatility;
    return priceOpenCloseDistance < channelWidthThreshold * priceChannelWidth;
}
  
/**
   * Check if prices form a Pennant pattern
   * @param {Array} prices - An array of historical prices with OHLC format
   * @returns {boolean} - true if a Pennant pattern is detected, false otherwise
   */
const isPennantPattern = (prices) => {  
    const priceRange = Math.max(...prices.high) - Math.min(...prices.low);
    // Adjust the threshold based on the average volatility
    const averageVolatility = calculateAverageVolatility(prices);
    const triangleWidthThreshold = 1.5 * averageVolatility;
    return priceRange < triangleWidthThreshold;
}

export const detectPatterns = (prices) => {
    if (detectBullishFigures(prices)) {
        return "bullish"
    }
    if (detectBearishFigures(prices)) {
        return "bearish"
    }
    if (isRectanglePattern(prices)) {
        return "rectangle"
    }
    if (isFlagPattern(prices)) {
        return "flag"
    }
    if (isPennantPattern(prices)) {
        return "pennant"
    }

    return "none";
}

/**
   * get format prices
   * @param {prices}
   * @returns
   */
export const getFormattedPrice = (prices, ticksLength) => {
    const resultPrices = {open: [], close: [], high: [], low: []};
    for (let i = ticksLength ? prices.length - ticksLength : 0; i < prices.length; i += 1) {
        resultPrices.open.push(prices[i].open);
        resultPrices.close.push(prices[i].close);
        resultPrices.high.push(prices[i].high);
        resultPrices.low.push(prices[i].low);
    }
    return resultPrices
};

/** 
 * 
 * get Highest and Lowest price peacks
*/

export const getPricePeacks = (closes) => {
    // Store highest and lowest peaks
    const highPeaks = [];
    const lowPeaks = [];

    for (let i = 1; i < closes.length; i += 1) {
        const price = closes[i];
        const previousPrice = closes[i - 1];
        // Update highest peaks
        if (price > previousPrice) {
            highPeaks.push({ index: i, price });
        }
    
        // Update lowest peaks
        if (price < previousPrice) {
            lowPeaks.push({ index: i, price });
        }
    }
    console.log("//", highPeaks, lowPeaks);
    const lastHighs = highPeaks.sort((a, b) => a.price - b.price).slice(-4);
    const lastLows = lowPeaks.sort((a, b) => b.price - a.price).slice(-4);

    return {highPeaks: lastHighs, lowPeaks: lastLows};
}

/**
 * check divergence
 */

export const checkDivergence = (closes, rsiValues, stochasticValues) => {
    console.log("rsiValues", rsiValues.length);
    console.log("stochasticValues", stochasticValues.length);
    // Store highest and lowest peaks
    const highPeaks = [];
    const lowPeaks = [];

    // Check for divergence between close price and RSI/Stochastic Oscillator
    for (let i = 1; i < closes.length; i += 1) {
        const closePrice = closes[i];
        const rsiValue = rsiValues[i];
        const stochasticValue = stochasticValues[i] ? stochasticValues[i].k : undefined;

        const previousClose = closes[i - 1];
        const previousRSI = rsiValues[i - 1];
        const previousStochastic = stochasticValues[i - 1] ? stochasticValues[i - 1].k : undefined;

        // Update highest peaks
        if (closePrice > previousClose) {
            highPeaks.push({ index: i, price: closePrice });
        }

        // Update lowest peaks
        if (closePrice < previousClose) {
            lowPeaks.push({ index: i, price: closePrice });
        }

        // Check for divergence (increase)
        if (
            highPeaks.length >= 2 &&
            highPeaks[highPeaks.length - 1].price > highPeaks[highPeaks.length - 2].price &&
            lowPeaks.length >= 2 &&
            lowPeaks[lowPeaks.length - 1].price < lowPeaks[lowPeaks.length - 2].price &&
            closePrice < previousClose &&
            rsiValue < previousRSI &&
            stochasticValue < previousStochastic
        ) {
            console.log(`Increase Divergence found at index ${i},
            prices: ${highPeaks[highPeaks.length - 2].price} - ${highPeaks[highPeaks.length - 1].price}`);
        }

        // Check for divergence (decrease)
        if (
            highPeaks.length >= 2 &&
            highPeaks[highPeaks.length - 1].price < highPeaks[highPeaks.length - 2].price &&
            lowPeaks.length >= 2 &&
            lowPeaks[lowPeaks.length - 1].price > lowPeaks[lowPeaks.length - 2].price &&
            closePrice > previousClose &&
            rsiValue > previousRSI &&
            stochasticValue > previousStochastic
        ) {
            console.log(`Decrease Divergence found at index ${i},
            prices: ${lowPeaks[lowPeaks.length - 2].price} - ${lowPeaks[lowPeaks.length - 1].price}`);
        }
    }
}

export default {
    getTrendDirection
}