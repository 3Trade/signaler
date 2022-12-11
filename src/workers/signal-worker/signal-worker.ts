export class SignalWorker {
  // this signal consists of a cross of macd bellow the zero line, indicating a buy sign. The oposite should be a sell
  getMacdSignalIndexes = async (macd: {
    macd: number[];
    macd_signal: number[];
    macd_histogram: number[];
    output_cut: number;
  }) => {
    const a = macd.macd_histogram;
    const b = Array(1).fill(null).concat(macd.macd_histogram.slice(0, -1));

    const positive_cross_indexes = [];
    const negative_cross_indexes = [];
    for (let i = 0; i < a.length; i++) {
      if (b[i] < 0 && a[i] > 0 && macd.macd_signal[i] < 0 && macd.macd[i] < 0) {
        positive_cross_indexes.push(i);
      } else if (
        b[i] > 0 &&
        a[i] < 0 &&
        macd.macd_signal[i] > 0 &&
        macd.macd[i] > 0
      ) {
        negative_cross_indexes.push(i);
      }
    }

    return {
      upCross: positive_cross_indexes,
      downCross: negative_cross_indexes
    };
  };

  getPriceAboveSmaIndexes = async (sma: number[], close: number[]) => {
    const sma_signal = [];
    for (let i = 0; i < sma.length; i++) {
      if (sma[i]) {
        if (close[i] > sma[i]) sma_signal.push("positive");
        else sma_signal.push("negative");
      } else sma_signal.push(null);
    }
    return sma_signal;
  };
}
