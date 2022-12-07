import { MongoClient } from "mongodb";

const url = "mongodb://mongo:27017";
const mongo_client = new MongoClient(url);

export class DBWorker {
  private db;
  private dbName;
  constructor(dbName) {
    this.dbName = dbName;
    this.connect();
  }

  async connect() {
    // Use connect method to connect to the server
    await mongo_client.connect();
    console.log("Connected successfully to Mongo DB");
    this.db = mongo_client.db(this.dbName);
    // collection = db.collection('1d');

    // the following code examples can be pasted here...
    return "done.";
  }

  async deleteCollection(collectionName: string) {
    this.db.getCollection(collectionName).deleteMany({});
  }

  async saveSignals(timeframe, pair, signals) {
    // console.log(`Saving to ${timeframe} signals db`, signals);

    const filter = { _id: pair };
    const updateDoc = {
      $set: {
        _id: pair,
        signals
      }
    };
    const result = await this.db
      .collection(timeframe)
      .updateOne(filter, updateDoc, { upsert: true });

    return result;
  }
}
