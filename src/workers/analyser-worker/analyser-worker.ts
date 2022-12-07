import { tulind } from "tulind";
import { Series } from "danfojs-node";
import { ArrayType1D } from "danfojs-node/dist/danfojs-base/shared/types";

export class AnalyserWorker {
  async macd(klines) {
    const time_: string[] = [];
    const close: number[] = [];
    let macd = {};
    klines.map((t: number[]) => {
      time_.push(new Date(t[0]).toLocaleString());
      close.push(t[4]);
      // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = t;
      return t;
    });
    if (time_.length > 2) {
      const output_cut = tulind.indicators.macd.start([12, 26, 9]);
      tulind.indicators.macd.indicator(
        [close],
        [12, 26, 9],
        function (err, results) {
          macd = {
            time: time_,
            macd: results[0],
            macd_signal: results[1],
            macd_histogram: results[2],
            output_cut
          };
        }
      );
      //   tulind.indicators.sma.indicator([close], [200], function (err, results) {
      //     ma = results[0];
      //   });
    }

    return macd;
  }

  async positiveMacd(
    macd_data: { time: number[]; macd_histogram: number[] },
    n
  ) {
    // avoid processing old stucked messages
    if (
      new Date(macd_data.time[macd_data.time.length - 1]).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0)
    )
      return [];
    // console.log("SLICED", macd_data.macd_histogram.slice(-n));
    const histogram_df = new Series(macd_data.macd_histogram.slice(-(n + 1)));
    // console.log("HISTOGRAM", histogram_df.values);
    const lower_start = histogram_df
      .iloc([`0:${histogram_df.shape[0] - 1}`])
      .lt(0);
    // console.log("LOWER", lower_start.values);
    const higher_start = histogram_df.iloc([`1:`]).gt(0);
    // console.log("HIGHER", higher_start.values);
    const logical_product = lower_start.and(higher_start);
    const times = new Series(macd_data.time.slice(-(n + 1)));
    // console.log("LOGICAL", logical_product);
    // console.log("TIMES", times.values);
    const logical_idx = logical_product.values;
    // if(!logical_idx.includes(true)) return
    // console.log("IDX", symbol, logical_idx);
    // logical_idx.unshift(...new Array(macd_data.output_cut + 2).fill(false))
    logical_idx.unshift(...new Array(1).fill(false));

    const cross_times = times.loc(logical_idx as ArrayType1D);
    // console.log("CROSS TIMES", cross_times.values);
    return cross_times.values;
  }
}
