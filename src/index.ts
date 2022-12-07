import amqp from "amqplib";
import { createClient } from "redis";
import { MongoClient } from "mongodb";
import { DBWorker } from "./workers/db-worker/db-worker";
import { Series } from "danfojs-node";
import { ArrayType1D } from "danfojs-node/dist/danfojs-base/shared/types";

const DBNAME = "signals";

let rabbit_connected = false;
let redis_connected = false;
let rabbitMQConnection;
let rabbitMQChannel;
let db;

const redis_client = createClient({
  url: "redis://redis"
});

// Connection URL
const url = "mongodb://mongo:27017";
const mongo_client = new MongoClient(url);

const dbWorker = new DBWorker("signals");

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

const connectRedis = async () => {
  console.log("Starting Redis connection...");
  while (!redis_connected) {
    console.log("Trying to connect to redis...");
    try {
      await redis_client.connect();
      redis_connected = true;
      console.log("Redis Connected!!!");
    } catch (err) {
      console.log("Error on connecting Redis. Retrying...", err);
      await delay(5000);
    }
  }
};

const connectRabbit = async () => {
  console.log("Starting Rabbit connection...");
  let attempt = 1;
  while (!rabbit_connected) {
    console.log(`Trying to connect to RabbitMQ. Attempt ${attempt}`);
    try {
      rabbitMQConnection = await amqp.connect("amqp://guest:guest@rabbit:5672");
      rabbitMQChannel = await rabbitMQConnection.createChannel();
      await rabbitMQChannel.assertQueue("signals", { durable: false });
      rabbit_connected = true;
      console.log("Rabbit Connectedto indicators queue!!");
    } catch {
      console.log("Error on connecting Rabbit. Retrying...");
      await delay(5000);
    }
    attempt++;
  }
};

async function connectMongo() {
  // Use connect method to connect to the server
  await mongo_client.connect();
  console.log("Connected successfully to server");
  db = mongo_client.db(DBNAME);
  return "done.";
}

async function verifyMacdSignal(time: any, macd: any, n: number) {
  if (
    new Date(time[time.length - 1]).setHours(0, 0, 0, 0) <
    new Date().setHours(0, 0, 0, 0)
  )
    return [];
  // console.log("SLICED", macd_data.macd_histogram.slice(-n));
  const histogram_df = new Series(macd.macd_histogram.slice(-(n + 1)));
  // console.log("HISTOGRAM", histogram_df.values);
  const lower_start = histogram_df
    .iloc([`0:${histogram_df.shape[0] - 1}`])
    .lt(0);
  // console.log("LOWER", lower_start.values);
  const higher_start = histogram_df.iloc([`1:`]).gt(0);
  // console.log("HIGHER", higher_start.values);
  const logical_product = lower_start.and(higher_start);
  const times = new Series(time.slice(-(n + 1)));
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

const verifySmaSignal = async (close: number[], sma: number[]) => {
  const lastClose = close[close.length - 1];
  const lastSma = sma[sma.length - 1];

  if (lastClose > lastSma) return true;
  else return false;
};

const readSignalsQueue = () => {
  rabbitMQChannel.consume(
    "signals",
    async function (msg) {
      const msgParsed = JSON.parse(msg.content.toString());

      const { pair, timeframe, time_, close, sma, macd } = msgParsed;
      console.log("MSG", pair, timeframe);
      if (time_.length < macd.output_cut) return;
      const lastUpdate = new Date(time_[time_.length - 1]);
      const isMacdSignal = (await verifyMacdSignal(time_, macd, 1)).length > 0;
      const isSmaSignal = await verifySmaSignal(close, sma);

      // if (pair === "RNDRBTC") {
      //   console.log("close", close[close.length - 1]);
      //   console.log("sma", sma[sma.length - 1]);
      //   console.log(close[close.length - 1] > sma[sma.length - 1]);

      //   console.log({ isSmaSignal });
      // }
      const signals = {
        lastUpdate,
        macd: isMacdSignal,
        sma: isSmaSignal
      };
      await dbWorker.saveSignals(timeframe, pair, signals);
    },
    {
      noAck: true
    }
  );
};

(async () => {
  await connectRabbit();
  await connectRedis();
  await connectMongo();
  readSignalsQueue();
})();
