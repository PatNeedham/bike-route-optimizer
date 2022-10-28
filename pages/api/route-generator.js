import axios from "axios";
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

const {
  DOCK_REFRESH_API_KEY,
  MONGO_SERVERLESS_PROJECT_ID,
  MONGO_SERVERLESS_API_KEY,
} = process.env;

const BASE_URI = `https://data.mongodb-api.com/app/${MONGO_SERVERLESS_PROJECT_ID}/endpoint/data/v1/action`;

export default async function handler(req, res) {
  if (req.query.token !== DOCK_REFRESH_API_KEY) {
    return res.status(403).json({ error: "unauthorized" });
  }
  console.log("authorized dock-refresh request");
  const { timestamp } = req.query;
  if (!timestamp) {
    return res.status(400).json({ error: "missing timestamp" });
  }

  try {
    const response = await axios.post(
      `${BASE_URI}/find`,
      {
        dataSource: "BikeRouteOptimizer",
        database: "nyc-docks",
        collection: "point-values",
        filter: { timestamp },
      },
      {
        headers: {
          "content-type": "application/json",
          "api-key": MONGO_SERVERLESS_API_KEY,
        },
      }
    );
    const pointValues = response.data.documents;

    const routes = [];
    let skippedDueToDistance = 0;
    let skippedDueToPoints = 0;
    let skippedToDuePonitsPerDistance = 0;
    console.log("beginning O(n^2) operation...");
    pointValues.forEach((dock1) => {
      pointValues.forEach((dock2) => {
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
                  timestamp,
                  dock1_location: dock1.location,
                  dock2_location: dock2.location,
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

    await axios.post(
      `${BASE_URI}/insertMany`,
      {
        dataSource: "BikeRouteOptimizer",
        database: "nyc-docks",
        collection: "routes",
        documents: routes,
      },
      {
        headers: {
          "content-type": "application/json",
          "api-key": MONGO_SERVERLESS_API_KEY,
        },
      }
    );

    console.log("finished insertMany");
    return res.status(200).json({
      skippedDueToDistance,
      skippedDueToPoints,
      skippedToDuePonitsPerDistance,
      routesInserted: routes.length,
    });
  } catch (err) {
    console.log("mongo connection error: ", err);
    return res.status(400);
  }
}
