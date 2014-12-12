define([
	'promise',
	'ya-csv'
], function(
	Promise,
	csv
) {
	return function dumpCSV(fileName) {
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
	};
});