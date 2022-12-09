import { TransportWorker } from "../workers/transport-worker/transport-worker";

const close = [
  81.59, 81.06, 82.87, 83.0, 83.61, 83.15, 82.84, 83.99, 84.55, 84.36, 85.53,
  86.54, 86.89, 87.77, 87.29
];

let transportWorker = new TransportWorker();

describe("Test signals queue", () => {
  beforeAll(async () => {
    await transportWorker.connect(
      "amqp://guest:guest@docker.for.mac.host.internal:5672"
    );
  });
  test("Should receive the msg on the queue", async () => {
    transportWorker.sendToQueue("signals", { test: "OK" });
  });
});
