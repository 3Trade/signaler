import { SignalWorker } from "./signal-worker";
describe("Signals Test", () => {
  test("Should calculate the correct macd signals", async () => {
    const signalWorker = new SignalWorker();
    const macd_histogram = [-3, -2, -5, 3, 4, -2, 6, 7, 8];
    const res = await signalWorker.getMacdSignalIndexes(macd_histogram, 0);
    expect(res.upCross).toEqual([
      false,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      false
    ]);
    expect(res.downCross).toEqual([
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      false
    ]);
  });
});
