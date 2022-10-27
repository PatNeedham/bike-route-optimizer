import { format } from "date-fns";
import axios from "axios";
import { transformDockElement } from "../../src/dock-generator";

const {
  DOCK_REFRESH_API_KEY,
  MONGO_SERVERLESS_API_KEY,
  MONGO_SERVERLESS_PROJECT_ID,
} = process.env;

const axiosConfig = {
  headers: {
    "content-type": "application/json",
    "api-key": MONGO_SERVERLESS_API_KEY,
  },
};

export default async function handler(req, res) {
  if (req.query.token !== DOCK_REFRESH_API_KEY) {
    return res.status(403).json({ error: "unauthorized" });
  }
  console.log("authorized dock-refresh request");

  const response = await fetch(
    "https://layer.bicyclesharing.net/map/v1/nyc/stations"
  );
  const data = await response.json();
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm");
  const docks = data.features
    .filter((f) => f.type === "Feature")
    .map(transformDockElement(timestamp));
  const result = await axios.post(
    `https://data.mongodb-api.com/app/${MONGO_SERVERLESS_PROJECT_ID}/endpoint/data/v1/action/insertMany`,
    {
      dataSource: "BikeRouteOptimizer",
      database: "nyc-docks",
      collection: "point-values",
      documents: docks,
    },
    axiosConfig
  );
  console.log("result.data: ", result.data);
  const insertedIdCount = result.data?.insertedIds?.length;
  await axios.post(
    `https://data.mongodb-api.com/app/${MONGO_SERVERLESS_PROJECT_ID}/endpoint/data/v1/action/insertOne`,
    {
      dataSource: "BikeRouteOptimizer",
      database: "nyc-docks",
      collection: "refresh-times",
      document: { timestamp, insertedIdCount },
    },
    axiosConfig
  );
  res.status(200).json({ timestamp, insertedIdCount });
}
