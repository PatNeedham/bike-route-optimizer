import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function transformDockElement(original) {
	const { geometry, properties } = original;
	const { coordinates } = geometry;
	const [lng, lat] = coordinates;
	const {
		station_id,
		name,
		bikes_available,
		docks_available,
		bike_angels_action,
		bike_angels_points,
		valet_status
	} = properties;

	return {
		lng,
		lat,
		station_id,
		name,
		bikes_available,
		docks_available,
		bike_angels_action,
		bike_angels_points,
		valet_status
	};
}

async function run() {
  const response = await fetch('https://layer.bicyclesharing.net/map/v1/nyc/stations');
  const data = await response.json();
  const docks = data.features.filter(f => f.type === 'Feature').map(transformDockElement);
  var json = JSON.stringify(docks);
  fs.writeFileSync(__dirname + '/../data/docks.json', json, 'utf8');
}

run();