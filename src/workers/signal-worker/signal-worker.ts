import { config } from "process";

const dfd = require("danfojs-node");

export class SignalWorker {
  getMacdSignalIndexes = async (
    macd_histogram: number[],
    outputCut: number
  ) => {
    const a = Array(outputCut).fill(null).concat(macd_histogram);
    const b = Array(outputCut + 1)
      .fill(null)
      .concat(macd_histogram.slice(0, -1));

    const positive_cross_indexes = [];
    const negative_cross_indexes = [];
    for (let i = 0; i < a.length; i++) {
      if (b[i] < 0 && a[i] > 0) {
        positive_cross_indexes.push(true);
      } else {
        positive_cross_indexes.push(false);
      }

      if (b[i] > 0 && a[i] < 0) {
        negative_cross_indexes.push(true);
      } else {
        negative_cross_indexes.push(false);
      }
    }

    return {
      upCross: positive_cross_indexes,
      downCross: negative_cross_indexes
    };
  };
}
