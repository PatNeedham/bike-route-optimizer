import React from "react";
import GoogleMapReact from "google-map-react";
import axios from "axios";
import Popover from "@mui/material/Popover";
import { useQuery } from "@tanstack/react-query";

const { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } = process.env;

const useDocks = () => {
  return useQuery(["docks"], async () => {
    const { data } = await axios.get("/api/latest");
    return data;
  });
};

const getDockBackgroundColor = (action) => {
  if (!action) {
    return "gray";
  } else if (action === "take") {
    return "green";
  } else {
    return "red";
  }
};

const getDockOpacity = (points) => {
  if (!points) {
    return 1;
  }
  return points / 4;
};

const DockComponent = ({ docAttributes }) => {
  const {
    id,
    name,
    bikes_available,
    docks_available,
    bike_angels_action,
    bike_angels_points,
  } = docAttributes;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? `${id}-popover` : undefined;

  return (
    <>
      <div
        style={{
          height: 7,
          width: 7,
          cursor: "pointer",
          backgroundColor: getDockBackgroundColor(bike_angels_action),
          opacity: getDockOpacity(bike_angels_points),
        }}
        onClick={handleClick}
      />
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div style={{ padding: 15 }}>
          <h3>{name}</h3>
          <p>Bikes available: {bikes_available}</p>
          <p>Docks available: {docks_available}</p>
          <p>Action: {bike_angels_action}</p>
          <p>Points available: {bike_angels_points}</p>
        </div>
      </Popover>
    </>
  );
};

const MapContainer = () => {
  const defaultProps = {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 11,
  };
  const { data } = useDocks();

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        {data?.length > 0 ? (
          data.map((d) => (
            <DockComponent
              key={d.id}
              docAttributes={d}
              lat={d.location.coordinates[1]}
              lng={d.location.coordinates[0]}
            />
          ))
        ) : (
          <p>loading...</p>
        )}
      </GoogleMapReact>
    </div>
  );
};

export default MapContainer;
