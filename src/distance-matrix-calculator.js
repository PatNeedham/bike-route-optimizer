import fs from 'fs';

function toRad(value) {
	return value * Math.PI / 180;
}

// from https://stackoverflow.com/a/18883819/772985
function calcCrow(lat1, lng1, lat2, lng2) {
	const R = 6371; // Radius of the earth in km
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lng2 - lng1);
	const lat1Rad = toRad(lat1);
	const lat2Rad = toRad(lat2);

	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad); 
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	const d = R * c; // distance in km
	return d;
}

function gatherDistances(docks) {
	const dockMap = {};
	const routeMap = {};
	docks.forEach((dock1, idx) => {
		dockMap[dock1.station_id] = dock1;
		docks.forEach(dock2 => {
			if (dock1.station_id !== dock2.station_id) {
				const { lat: lat1, lng: lng1, station_id: dock1Id } = dock1;
				const { lat: lat2, lng: lng2, station_id: dock2Id } = dock2;
				routeMap[`${dock1Id}_${dock2Id}`] = calcCrow(lat1, lng1, lat2, lng2);
			}
		});
	});
	return routeMap;
}

function generate() {
  const file = fs.readFileSync('myjsonfile.json', 'utf8');
  const docks = JSON.parse(file.toString());
  const routeMap = gatherDistances(docks);
  fs.writeFileSync('routeDistances.json', JSON.stringify(routeMap));
}

generate();