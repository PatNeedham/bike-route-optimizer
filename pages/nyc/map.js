import React from 'react';
import GoogleMapReact from 'google-map-react';

const { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } = process.env;

const AnyReactComponent = ({ text }) => <div>{text}</div>;


const MapContainer = () => {
  const defaultProps = {
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 11
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        <AnyReactComponent
          lat={40.7128}
          lng={-74.0050}
          text="My Marker"
        />
      </GoogleMapReact>
    </div>
  );
};

export default MapContainer;
