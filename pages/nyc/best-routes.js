import React from "react";
import { GoogleMap, LoadScript, Polyline } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";

const { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } = process.env;
const center = { lat: 40.7128, lng: -74.006 };
const style = { height: "100vh", width: "100%" };

export const startSymbol = {
  path: "M -2,-2 2,2 M 2,-2 -2,2",
  strokeColor: "#7CFC00",
  strokeWeight: 4,
};

export const endSymbol = {
  path: "M -2,-2 2,2 M 2,-2 -2,2",
  strokeColor: "#FF0000",
  strokeWeight: 4,
};

const MapContainer = () => {
  // const [dockMap, setDockMap] = useState({});
  const {
    data: routes,
    isLoading,
    isFetched,
  } = useQuery(["routes"], () =>
    fetch("/api/routes").then((res) => res.json())
  );

  // const { data: docks, isFetched: fetchedDocks } = useQuery(["docks"], () =>
  //   fetch("/api/latest").then((res) => res.json())
  // );

  const { data: timestamps = [] } = useQuery(["timestamps"], () =>
    fetch("/api/timestamps").then((res) => res.json())
  );

  // useEffect(() => {
  //   if (fetchedDocks) {
  //     const newDockMap = {};
  //     docks.forEach((dock) => {
  //       newDockMap[dock.station_id] = dock;
  //     });
  //     setDockMap(newDockMap);
  //   }
  // }, [fetchedDocks]);
  return (
    <LoadScript googleMapsApiKey={NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={style} center={center} zoom={11}>
        {!isLoading &&
          isFetched &&
          routes.map((route) => (
            <Polyline
              key={route._id}
              options={{
                strokeColor: "#D3D3D3",
                icons: [
                  { icon: startSymbol, offset: "0%" },
                  { icon: endSymbol, offset: "100%" },
                ],
              }}
              path={[
                {
                  lat: route.dock1_location.coordinates[1],
                  lng: route.dock1_location.coordinates[0],
                },
                {
                  lat: route.dock2_location.coordinates[1],
                  lng: route.dock2_location.coordinates[0],
                },
              ]}
              onClick={(polyline) => {
                console.log("first arg: ", polyline);
                console.log(polyline.latLng.lat());
              }}
            />
          ))}
      </GoogleMap>
      <div
        style={{
          width: "calc(100vw - 70px)",
          height: 75,
          backgroundColor: "white",
          position: "absolute",
          left: 0,
          bottom: 0,
        }}
      >
        <span>Available timestamps from past:</span>
        {timestamps.map((timestamp) => (
          <p key={timestamp}>{timestamp}</p>
        ))}
      </div>
    </LoadScript>
  );
};

export default MapContainer;
