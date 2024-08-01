import { SMA, RSI, VWAP, OBV, Stochastic }  from 'technicalindicators';

export const calculateTechIndicatorsData = ({
    periods,
    rawPrices,
    ticks
}) => {
    try {
        const sma20 = SMA.calculate({ period: periods.sma20, values: rawPrices.close });
        const sma50 = SMA.calculate({ period: periods.sma50, values: rawPrices.close });
        const sma100 = SMA.calculate({ period: periods.sma100, values: rawPrices.close });
        const rsi = RSI.calculate({ period: periods.rsi, values: rawPrices.close });
        const vwap = VWAP.calculate({
            period: periods.vwap,
            volume: ticks.map(tick => parseFloat(tick[5])),
            high: ticks.map(tick => parseFloat(tick[2])),
            low: ticks.map(tick => parseFloat(tick[3])),
            close: rawPrices.close
        });
        const obv = OBV.calculate({
            close: rawPrices.close,
            volume: ticks.map(tick => parseFloat(tick[7]))
        });
        const stoch = Stochastic.calculate({
            period: periods.stochPeriod,
            low: rawPrices.low,
            high: rawPrices.high,
            close: rawPrices.close,
            signalPeriod: periods.stochSignalPeriod
        })
        return {
            sma20,
            sma50,
            sma100,
            rsi,
            vwap,
            obv,
            stoch
        }
    } catch (err) {
        console.log('tech indicator data error', err);
        return undefined
    }
};