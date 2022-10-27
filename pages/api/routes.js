import { MongoClient, ServerApiVersion } from "mongodb";

const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_ENDPOINT } = process.env;

export default async function handler(req, res) {
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

    const latest = client.db("nyc-routes").collection("latest");
    const all = latest.find({});
    const docks = await all.toArray();
    return res.status(200).json(docks);
  });
}
