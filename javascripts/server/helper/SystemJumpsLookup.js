define([
	'server/helper/dumpCSV'
], function(
	dumpCSV
) {
	var loaded = false;
	var SOLAR_SYSTEMS_LOOKUP = {};
	var CONNECTION_MATRIX = {};
	dumpCSV('./javascripts/server/data/mapSolarSystems.csv')
		.then(function(rows) {
			for(var i = 0; i < rows.length; i++) {
				SOLAR_SYSTEMS_LOOKUP[rows[i].SOLARSYSTEMID] = {
					solarSystemId: +rows[i].SOLARSYSTEMID,
					name: rows[i].SOLARSYSTEMNAME,
					constellationId: +rows[i].CONSTELLATIONID,
					regionId: +rows[i].REGIONID,
					security: Math.round(+rows[i].SECURITY * 10)
				};
			}
			console.log("Loaded " + rows.length + " solar systems!");
			return dumpCSV('./javascripts/server/data/mapSolarSystemJumps.csv');
		})
		.then(function(rows) {
			for(var i = 0; i < rows.length; i++) {
			}
			console.log("Loaded " + rows.length + " solar system connections!");
		});

	function getJumpsBetween(fromSystemId, toSystemId, security) {
		if(!loaded) {
			throw new Error("ItemTypeLookup is not loaded yet!");
		}
		security = security || 0;
		return null;
	}

	return {
		getJumpsBetween: getJumpsBetween
	};
});