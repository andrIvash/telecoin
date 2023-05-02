  // Moving Average (MA) function
  function movingAverage(period, prices) {
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i];
    }
    return sum / period;
}
  
  // Relative Strength Index (RSI) function
  function relativeStrengthIndex(period, prices) {
    let gain = 0;
    let loss = 0;
    for (let i = 1; i <= period; i++) {
      if (prices[i] > prices[i-1]) {
        gain += prices[i] - prices[i-1];
      } else {
        loss += prices[i-1] - prices[i];
      }
    }
    let averageGain = gain / period;
    let averageLoss = loss / period;
    let rs = averageGain / averageLoss;
    return 100 - (100 / (1 + rs));
  }
  
  // Volume Weighted Average Price (VWAP) function
  function volumeWeightedAveragePrice(period, prices, volumes) {
    let sumPriceVolume = 0;
    let sumVolume = 0;
    for (let i = 0; i < period; i++) {
      sumPriceVolume += prices[i] * volumes[i];
      sumVolume += volumes[i];
    }
    return sumPriceVolume / sumVolume;
  }
  
  // On-Balance Volume (OBV) function
  function onBalanceVolume(period, prices, volumes) {
    let obv = 0;
    for (let i = 1; i <= period; i++) {
      if (prices[i] > prices[i-1]) {
        obv += volumes[i];
      } else if (prices[i] < prices[i-1]) {
        obv -= volumes[i];
      }
    }
    return obv;
  }
  
  
let prices = [10, 12, 15, 14, 18, 20, 22, 24, 25, 26];
let volumes = [100, 120, 150, 140, 180, 200, 220, 240, 250, 260];

let ma = movingAverage(5, prices); // Calculate 5-day Moving Average
let rsi = relativeStrengthIndex(14, prices); // Calculate 14-day RSI
let vwap = volumeWeightedAveragePrice(10, prices, volumes); // Calculate 10-day VWAP
let obv = onBalanceVolume(10, prices, volumes); // Calculate 10-day OBV



/**
To use this function, you can call it with the symbol and interval parameters, where symbol 
is the trading pair symbol (e.g. "BTCUSDT") and interval is the time interval for the candlesticks
(e.g. "1m" for 1-minute intervals, "5m" for 5-minute intervals, etc.). The function fetches the last 1000 
candlesticks for the specified trading pair and interval, calculates the total volume and total volume price,
 and then calculates the VWAP by dividing the total volume price by the total volume.
 */
 function calculateVWAP(symbol, interval) {
    const endpoint = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`;
    let totalVolume = 0;
    let totalVolumePrice = 0;
  
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        data.forEach((candle) => {
          const volume = parseFloat(candle[5]);
          const volumePrice = parseFloat(candle[7]);
          totalVolume += volume;
          totalVolumePrice += volumePrice;
        });
        const vwap = totalVolumePrice / totalVolume;
        console.log(`VWAP for ${symbol} (${interval} interval): ${vwap}`);
        return vwap;
      })
      .catch(error => console.log(error));
  }

  /*
  First, let's define what OBV is. The On-Balance Volume (OBV) is a technical indicator that uses volume
  flow to predict changes in stock price. It measures buying and selling pressure as a cumulative indicator
  that adds volume on up days and subtracts volume on down days.

To calculate the OBV indicator in JavaScript, we can use the following steps:

Initialize the OBV value as zero.
Iterate through each candle in the intraday data, starting from the earliest candle.
Calculate the difference between the current candle's closing price and the previous candle's closing price.
If the current candle's closing price is higher than the previous candle's closing price, add the current
    candle's volume to the OBV value.
If the current candle's closing price is lower than the previous candle's closing price, subtract the
    current candle's volume from the OBV value.
If the current candle's closing price is the same as the previous candle's closing price, leave the OBV
    value unchanged.
Repeat steps 3-6 for each candle in the intraday data.

The data parameter is an array of candles, where each candle contains the open, high, low, close, and volume data
for a specific time interval. This data can be obtained from the Binance API.

To use this code, simply pass your intraday data to the calculateOBV function, and it will return
the OBV value for that data.
  */

function calculateOBV(data) {
    let obv = 0;
  
    for (let i = 1; i < data.length; i++) {
        const candle = data[i];
        const prevCandle = data[i - 1];
        const closeDiff = candle.close - prevCandle.close;
    
        if (closeDiff > 0) {
            obv += candle.volume;
        } else if (closeDiff < 0) {
            obv -= candle.volume;
        }
    }
  
    return obv;
  }


  const interval = '15m';
const symbol = 'BTCUSDT';

const period = 20;

const klines = await client.candles({
    symbol: symbol,
    interval: interval,
    limit: period + 1,
});


const closes = klines.map(kline => parseFloat(kline.close));

const sum = closes.reduce((acc, val) => acc + val, 0);
const sma = sum / period;


const lastClose = closes[closes.length - 1];
if (lastClose > sma) {
  console.log(`Buy ${symbol}`);
} else {
  console.log(`Sell ${symbol}`);
}