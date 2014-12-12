define([
	'server/data/RawData'
], function(
	RawData
) {
	var loaded = false;
	var SOLAR_SYSTEM_IDS = [];
	var SOLAR_SYSTEMS_LOOKUP = {};
	var ROUTE_LOOKUP = {};
	var MAX_DIST_TO_PRECALCULATE = 5;

	//load solar system data
	var rows = RawData.mapSolarSystems;
	for(var i = 0; i < rows.length; i++) {
		SOLAR_SYSTEM_IDS.push(+rows[i].SOLARSYSTEMID);
		SOLAR_SYSTEMS_LOOKUP[rows[i].SOLARSYSTEMID] = {
			solarSystemId: +rows[i].SOLARSYSTEMID,
			name: rows[i].SOLARSYSTEMNAME,
			constellationId: +rows[i].CONSTELLATIONID,
			regionId: +rows[i].REGIONID,
			security: Math.round(+rows[i].SECURITY * 10)
		};
	}
	SOLAR_SYSTEM_IDS.sort();
	console.log("Loaded " + rows.length + " solar systems!");

	//load solar system connections
	rows = RawData.mapSolarSystemJumps;
	for(i = 0; i < rows.length; i++) {
		var smallerId = Math.min(+rows[i].FROMSOLARSYSTEMID, +rows[i].TOSOLARSYSTEMID);
		var largerId = Math.max(+rows[i].FROMSOLARSYSTEMID, +rows[i].TOSOLARSYSTEMID);
		if(!ROUTE_LOOKUP[smallerId]) { ROUTE_LOOKUP[smallerId] = {}; }
		if(!ROUTE_LOOKUP[smallerId][largerId]) {
			ROUTE_LOOKUP[smallerId][largerId] = { dist: 1, route: [ largerId ] };
		}
		if(!ROUTE_LOOKUP[largerId]) { ROUTE_LOOKUP[largerId] = {}; }
		if(!ROUTE_LOOKUP[largerId][smallerId]) {
			ROUTE_LOOKUP[largerId][smallerId] = { dist: 1, route: [ smallerId ] };
		}
	}
	console.log("Loaded " + rows.length + " solar system connections!");

	//repeatedly find more distant connections
	for(var dist = 2; dist <= MAX_DIST_TO_PRECALCULATE; dist++) {
		for(i = 0; i < SOLAR_SYSTEM_IDS.length; i++) {
			var id = SOLAR_SYSTEM_IDS[i];
			//for every system this solar system is connected to
			var connections = ROUTE_LOOKUP[id];
			for(var id2 in connections) {
				if(connections[id2].dist === dist - 1) {
					//it is also connected to all of that connection's 1-dist connections
					var connections2 = ROUTE_LOOKUP[id2];
					for(var id3 in connections2) {
						if(id3 !== id && connections2[id3].dist === 1) {
							var route;
							if(!connections[id3] && connections[id2].route.indexOf(id3) === -1) {
								route = Array.prototype.slice.call(connections[id2].route);
								route.push(id3);
								connections[id3] = {
									dist: dist,
									route: route
								};
							}
							var connections3 = ROUTE_LOOKUP[id3];
							if(!connections3[id] && connections2[id].route.indexOf(id2) === -1) {
								route = Array.prototype.slice.call(connections2[id].route);
								route.unshift(id2);
								connections3[id] = {
									dist: dist,
									route: route
								};
							}
						}
					}
				}
			}
		}
	}
	console.log("Calculated all solar system connections up to " + MAX_DIST_TO_PRECALCULATE + " jumps apart!");

	function getById(systemId) {
		return SOLAR_SYSTEMS_LOOKUP[systemId];
	}

	function getRouteBetween(fromSystemId, toSystemId, security) {
		return ROUTE_LOOKUP[fromSystemId][toSystemId] && ROUTE_LOOKUP[fromSystemId][toSystemId].route || null;
	}

	function getJumpsBetween(fromSystemId, toSystemId, security) {
		return ROUTE_LOOKUP[fromSystemId][toSystemId] && ROUTE_LOOKUP[fromSystemId][toSystemId].dist || -1;

		/*
		if(!loaded) {
			throw new Error("ItemTypeLookup is not loaded yet!");
		}
		security = security || 0;
		if(SOLAR_SYSTEMS_LOOKUP[fromSystemId].security < security || SOLAR_SYSTEMS_LOOKUP[toSystemId].security < security) {
			return false; //impossible
		}
		var smallerId = Math.min(fromSystemId, toSystemId);
		var largerId = Math.max(fromSystemId, toSystemId);
		if(!ROUTE_LOOKUP[smallerId] || !ROUTE_LOOKUP[smallerId][largerId]) {
			return false; //impossible or too long
		}
		var shortestRoute = null;
		for(var sec = security; sec <= 10; sec++) {
			var route = ROUTE_LOOKUP[smallerId][largerId][sec];
			if(shortestRoute === null || route.length <= shortestRoute.length) {
				shortestRoute = route;
			}
		}
		if(shortestRoute !== null) {
			shortestRoute = Array.prototype.slice.call(shortestRoute);
			if(fromSystemId !== toSystemId && fromSystemId > toSystemId) {
				shortestRoute.reverse();
			}
		}
		return shortestRoute;*/
	}

	return {
		getById: getById,
		getJumpsBetween: getJumpsBetween,
		getRouteBetween: getRouteBetween,
		allSystemIds: SOLAR_SYSTEM_IDS
	};
});