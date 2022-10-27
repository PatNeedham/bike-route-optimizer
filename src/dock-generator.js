export const transformDockElement = (timestamp) => (original) => {
  const { geometry, properties } = original;
  const { coordinates } = geometry;
  const [lng, lat] = coordinates;
  const {
    station_id,
    bikes_available,
    docks_available,
    bike_angels_action,
    bike_angels_points,
    valet_status,
  } = properties;

  return {
    location: {
      type: "Point",
      coordinates: [lng, lat],
    },
    timestamp,
    station_id,
    bikes_available,
    docks_available,
    bike_angels_action,
    bike_angels_points,
    valet_status,
  };
};
