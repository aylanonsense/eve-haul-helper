define([
	'client/findRoutes'
],
function(
	findRoutes
) {
	return function Main() {
		var p = Promise;
		findRoutes({
			regions: [ 1 ],
			security: 0.5,
			capacity: 1000,
			assets: 5000000,
			accounting: 0,
			allowIllegal: false
		}).then(function(routes) {
			console.log("Got routes:", routes);
		}, function(err) {
			console.log("Error getting routes:", err);
		});
	};
});