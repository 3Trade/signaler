import { SignalWorker } from "./signal-worker";
describe("Signals Test", () => {
  test("Should calculate the correct macd signals", async () => {
    const signalWorker = new SignalWorker();

    const macd_histogram = [-3, -2, -5, 3, 4, -2, 6, 7, 8];
    const macd = [-3, -2, -5, 3, 4, -2, 6, 7, 8];
    const macd_signal = [-3, -2, -5, 3, 4, -2, 6, 7, 8];
    const output_cut = 0;
    const macd_info = { macd_histogram, macd, macd_signal, output_cut };
    const res = await signalWorker.getMacdSignalIndexes(macd_info);
    expect(res.upCross).toEqual([
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      false,
      false
    ]);
    expect(res.downCross).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]);
  });
});
