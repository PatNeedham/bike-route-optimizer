import axios from "axios";

const { MONGO_SERVERLESS_API_KEY, MONGO_SERVERLESS_PROJECT_ID } = process.env;

const axiosConfig = {
  headers: {
    "content-type": "application/json",
    "api-key": MONGO_SERVERLESS_API_KEY,
  },
};

export default async function handler(req, res) {
  const latestRefresh = await axios.post(
    `https://data.mongodb-api.com/app/${MONGO_SERVERLESS_PROJECT_ID}/endpoint/data/v1/action/find`,
    {
      dataSource: "BikeRouteOptimizer",
      database: "nyc-docks",
      collection: "refresh-times",
      sort: { timestamp: -1 },
    },
    axiosConfig
  );

  return res
    .status(200)
    .json(latestRefresh.data.documents.map((d) => d.timestamp));
}
