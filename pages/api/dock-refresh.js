// import getClient from 'mongodb-atlas-api-client';
import { MongoClient, ServerApiVersion } from "mongodb";
import { format } from "date-fns";
import { transformDockElement } from "../../src/dock-generator";

const { DOCK_REFRESH_API_KEY, MONGO_USERNAME, MONGO_PASSWORD, MONGO_ENDPOINT } =
  process.env;

export default async function handler(req, res) {
  if (req.query.token !== DOCK_REFRESH_API_KEY) {
    return res.status(403).json({ error: "unauthorized" });
  }
  console.log("authorized dock-refresh request");

  const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_ENDPOINT}/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  client.connect(async (err) => {
    if (err) {
      console.log("mongo connection error: ", err);
      return res.status(400);
    }
    console.log("connected to Mongo client");
    const collection = client.db("nyc-docks").collection("latest");
    // perform actions on the collection object
    const count = await collection.estimatedDocumentCount();
    console.log("count here: ", count);

    const response = await fetch(
      "https://layer.bicyclesharing.net/map/v1/nyc/stations"
    );
    const data = await response.json();
    const docks = data.features
      .filter((f) => f.type === "Feature")
      .map(transformDockElement);
    const newCollectionName = format(new Date(), "yyyy-MM-dd HH:mm");
    const newCollection = await client
      .db("nyc-docks")
      .createCollection(newCollectionName);
    console.log(`newCollectionName: ${newCollectionName}`);
    await newCollection.insertMany(docks);

    const latest = client.db("nyc-docks").collection("latest");
    await latest.deleteMany({});
    console.log("just finished deleteMany command...");
    await latest.insertMany(docks);
    console.log("just finished insertMany command...");

    client.close();
    res.status(200).json({ name: "John Doe", collection: newCollectionName });
  });
}
