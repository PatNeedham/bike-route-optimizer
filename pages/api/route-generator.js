import { MongoClient, ServerApiVersion } from "mongodb";

import routeDistances from "../../data/routeDistances.json";

export const getPointsEarned = (dock1, dock2) => {
  if (
    dock1.bike_angels_action === "give" ||
    dock2.bike_angels_action === "take"
  ) {
    return 0;
  }
  return dock1.bike_angels_points + dock2.bike_angels_points;
};

const { DOCK_REFRESH_API_KEY, MONGO_USERNAME, MONGO_PASSWORD, MONGO_ENDPOINT } =
  process.env;

export default async function handler(req, res) {
  if (req.query.token !== DOCK_REFRESH_API_KEY) {
    return res.status(403).json({ error: "unauthorized" });
  }
  console.log("authorized dock-refresh request");
  const { collection: collectionName } = req.query;
  if (!collectionName) {
    return res.status(400).json({ error: "missing collection name" });
  }

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

    const latest = client.db("nyc-docks").collection("latest");
    const all = latest.find({});
    const docks = await all.toArray();

    const routes = [];
    let skippedDueToDistance = 0;
    let skippedDueToPoints = 0;
    let skippedToDuePonitsPerDistance = 0;
    console.log("beginning O(n^2) operation...");
    docks.forEach((dock1) => {
      docks.forEach((dock2) => {
        if (dock1.station_id !== dock2.station_id) {
          const pointsEarned = getPointsEarned(dock1, dock2);
          if (pointsEarned > 0) {
            const distance =
              routeDistances[`${dock1.station_id}_${dock2.station_id}`];
            if (!!distance && distance < 5) {
              const pointsPerDistance = pointsEarned / distance;
              if (pointsPerDistance >= 5) {
                routes.push({
                  start_station: dock1.station_id,
                  end_station: dock2.station_id,
                  points: pointsEarned,
                  distance,
                  points_per_distance: pointsPerDistance,
                });
              } else {
                skippedToDuePonitsPerDistance += 1;
              }
            }
            {
              skippedDueToDistance += 1;
            }
          } else {
            skippedDueToPoints += 1;
          }
        }
      });
    });
    console.log("completed O(n^2) operation");
    console.log(`routes.length: ${routes.length}`);

    const newCollection = await client
      .db("nyc-routes")
      .createCollection(collectionName);

    await newCollection.insertMany(routes);
    console.log("finished insertMany");
    return res.status(200).json({
      skippedDueToDistance,
      skippedDueToPoints,
      skippedToDuePonitsPerDistance,
      routesInserted: routes.length,
    });
  });
}
