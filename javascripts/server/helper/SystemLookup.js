define([
	'server/data/RawData'
], function(
	RawData
) {
	var loaded = false;
	var SOLAR_SYSTEM_IDS = [];
	var SOLAR_SYSTEMS_LOOKUP = {};
	var ROUTE_LOOKUP = {};
	var MAX_DIST_TO_PRECALCULATE = 3;
	var startTime = Date.now();

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

	for(var sec = 0; sec <= 10; sec++) {
		console.log(" sec=" + sec);
		ROUTE_LOOKUP[sec] = {};
		var R_L = ROUTE_LOOKUP[sec];
		//load solar system connections
		rows = RawData.mapSolarSystemJumps;
		for(i = 0; i < rows.length; i++) {
			var smallerId = Math.min(+rows[i].FROMSOLARSYSTEMID, +rows[i].TOSOLARSYSTEMID);
			var largerId = Math.max(+rows[i].FROMSOLARSYSTEMID, +rows[i].TOSOLARSYSTEMID);
			if(SOLAR_SYSTEMS_LOOKUP[smallerId].security >= sec && SOLAR_SYSTEMS_LOOKUP[largerId].security >= sec) {
				if(!R_L[smallerId]) { R_L[smallerId] = {}; }
				if(!R_L[smallerId][largerId]) {
					R_L[smallerId][largerId] = { dist: 1, route: [] };
				}
				if(!R_L[largerId]) { R_L[largerId] = {}; }
				if(!R_L[largerId][smallerId]) {
					R_L[largerId][smallerId] = true;
				}
			}
		}

		//repeatedly find more distant connections
		for(var dist = 2; dist <= MAX_DIST_TO_PRECALCULATE; dist++) {
			console.log("  dist=" + dist);
			for(i = 0; i < SOLAR_SYSTEM_IDS.length; i++) {
				//look at every solar syatem
				var id = SOLAR_SYSTEM_IDS[i];
				//for every distant system [id2] that system [id] is connected to
				for(var id2 in R_L[id]) {
					if((id < id2 ? R_L[id][id2] : R_L[id2][id]).dist === dist - 1) {
						//system [id] is ALSO connected to all of system [id2]'s adjacent connections
						for(var id3 in R_L[id2]) {
							//ignoring connections that system [id] is already connected to
							if(id !== id3 && (id2 < id3 ? R_L[id2][id3] : R_L[id3][id2]).dist === 1 && !R_L[id][id3]) {
								var route = Array.prototype.slice.call((id < id2 ? R_L[id][id2] : R_L[id2][id]).route);
								if(id < id3) {
									if(id2 < id) { route.reverse(); }
									route.push(id2);
									R_L[id][id3] = { dist: dist, route: route };
									R_L[id3][id] = true;
								}
								else {
									if(id < id2) { route.reverse(); }
									route.unshift(id2);
									R_L[id3][id] = { dist: dist, route: route };
									R_L[id][id3] = true;
								}
							}
						}
					}
				}
			}
		}
	}
	console.log("Loaded " + rows.length + " solar system connections and extrapolated them " +
		MAX_DIST_TO_PRECALCULATE + " jumps apart!");
	var loadTime = Date.now() - startTime;
	console.log("Load time: " + Math.floor(loadTime / 1000 / 60) + "m " + Math.floor(loadTime / 1000 % 60) + "s");

	function getById(systemId) {
		return SOLAR_SYSTEMS_LOOKUP[systemId];
	}

	function getRouteBetween(fromSystemId, toSystemId, sec) {
		sec = sec || 0;
		if(fromSystemId <= toSystemId) {
			var route = ROUTE_LOOKUP[sec][fromSystemId] && ROUTE_LOOKUP[sec][fromSystemId][toSystemId] &&
				ROUTE_LOOKUP[sec][fromSystemId][toSystemId].route || null;
			return (route ? Array.prototype.slice.call(route).reverse() : null);
		}
		else {
			return ROUTE_LOOKUP[sec][toSystemId] && ROUTE_LOOKUP[sec][toSystemId][fromSystemId] &&
				ROUTE_LOOKUP[sec][toSystemId][fromSystemId].route || null;
		}
	}

	function getJumpsBetween(fromSystemId, toSystemId, sec) {
		sec = sec || 0;
		var minSystemId = Math.min(fromSystemId, toSystemId);
		var maxSystemId = Math.max(fromSystemId, toSystemId);
		return ROUTE_LOOKUP[sec][minSystemId] && ROUTE_LOOKUP[sec][minSystemId][maxSystemId] &&
				ROUTE_LOOKUP[sec][minSystemId][maxSystemId].dist || -1;

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