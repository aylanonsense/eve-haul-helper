define([
	'promise',
	'ya-csv'
], function(
	Promise,
	csv
) {
	var FILE_NAMES = [ 'invContrabandTypes',  'invMarketGroups',  'invTypes',  'mapConstellations',
			'mapRegions',  'mapSolarSystemJumps',  'mapSolarSystems',  'staStations' ];

	function dumpCSV(fileName) {
		return new Promise(function(resolve, reject) {
			var stream = csv.createCsvFileReader(fileName);
			var rows = [];
			var cols = [];
			var rowNum = 0;
			stream.addListener('data', function(data) {
				if(rowNum++ === 0) {
					cols = data;
				}
				else {
					var row = {};
					for(var i = 0; i < cols.length; i++) {
						row[cols[i]] = data[i];
					}
					rows.push(row);
				}
			});
			stream.addListener('end', function() {
				resolve(rows);
			});
		});
	}

	return {
		load: function load() {
			var self = this;
			return new Promise(function(resolve, reject) {
				var numFilesLoaded = 0;
				FILE_NAMES.forEach(function(fileName) {
					dumpCSV('./javascripts/server/data/' + fileName + '.csv').then(function(rows) {
						self[fileName] = rows;
						console.log("Loaded " + fileName + ".csv");
						if(++numFilesLoaded === FILE_NAMES.length) {
							resolve();
						}
					});
				});
			});
		}
	};
});