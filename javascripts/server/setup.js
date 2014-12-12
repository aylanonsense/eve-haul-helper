define([
	'server/data/RawData'
],
function(
	RawData
) {
	return function setup(app) {
		RawData.load().then(function() {
			console.log("Done preloading!");
			require([ 'server/Main' ], function(Main) {
				Main(app);
			});
		});
	};
});