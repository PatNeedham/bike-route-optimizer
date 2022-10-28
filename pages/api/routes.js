import axios from "axios";

const { MONGO_SERVERLESS_API_KEY, MONGO_SERVERLESS_PROJECT_ID } = process.env;

const axiosConfig = {
  headers: {
    "content-type": "application/json",
    "api-key": MONGO_SERVERLESS_API_KEY,
  },
};

export default async function handler(req, res) {
  let timestamp;

  if (req.query.timestamp) {
    timestamp = req.query.timestamp;
  } else {
    const latestRefresh = await axios.post(
      `https://data.mongodb-api.com/app/${MONGO_SERVERLESS_PROJECT_ID}/endpoint/data/v1/action/find`,
      {
        dataSource: "BikeRouteOptimizer",
        database: "nyc-docks",
        collection: "refresh-times",
        sort: { timestamp: -1 },
        limit: 1,
      },
      axiosConfig
    );

    timestamp = latestRefresh.data.documents[0].timestamp;
  }

  console.log("timestamp here: ", timestamp);

  const routes = await axios.post(
    `https://data.mongodb-api.com/app/${MONGO_SERVERLESS_PROJECT_ID}/endpoint/data/v1/action/find`,
    {
      dataSource: "BikeRouteOptimizer",
      database: "nyc-docks",
      collection: "routes",
      filter: { timestamp },
    },
    axiosConfig
  );

  return res.status(200).json(routes.data.documents);
}
