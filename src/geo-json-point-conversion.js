import { MongoClient, ServerApiVersion } from "mongodb";
import axios from "axios";

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_ENDPOINT,
  MONGO_SERVERLESS_API_KEY,
  MONGO_SERVERLESS_PROJECT_ID,
} = process.env;

const run = async () => {
  try {
    console.log(`MONGO_USERNAME val: ${MONGO_USERNAME}`);
    const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_ENDPOINT}/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });

    client.connect(async (err) => {
      if (err) {
        console.log("mongo connection error: ", err);
        return;
      }

      const latest = client.db("nyc-docks").collection("latest");
      const all = latest.find({});
      const docks = await all.toArray();
      const dockLocations = [];
      docks.forEach((dock) => {
        dockLocations.push({
          name: dock.name,
          station_id: dock.station_id,
          location: {
            type: "Point",
            coordinates: [dock.lng, dock.lat],
          },
        });
      });
      const result = await axios.post(
        `https://data.mongodb-api.com/app/${MONGO_SERVERLESS_PROJECT_ID}/endpoint/data/v1/action/insertMany`,
        {
          dataSource: "BikeRouteOptimizer",
          database: "nyc-docks",
          collection: "locations",
          documents: dockLocations,
        },
        {
          headers: {
            "content-type": "application/json",
            "api-key": MONGO_SERVERLESS_API_KEY,
          },
        }
      );
      console.log("result: ", result);
    });
  } catch (err) {
    console.log("error : ", err);
  }
};

run();
