import { AnalyserWorker } from "./analyser-worker";
describe("Test indicator", () => {
  test("Should signalize the correct MACD", async () => {
    const analiser = new AnalyserWorker();
    const time = [1, 2, 3, 4, Date.now()];
    const macd_histogram = [-1, 2, -3, -4, 5];
    const n = 1;
    const res = await analiser.positiveMacd({ time, macd_histogram }, n);
    console.log("RES", res);
  });
});
