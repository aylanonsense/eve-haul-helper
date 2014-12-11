requirejs.config({ baseUrl: 'javascripts', paths: { jquery: '/javascripts/lib/jquery-1.10.2' } });

requirejs([
	'jquery',
	'systems'
], function(
	$,
	SYSTEMS
	//Promise already included
) {
	var CAPACITY = 400;

	function setUpUI() {}
	function waitForInput() {
		return new Promise(function(resolve, reject) {
			resolve();
		});
	}
	function getItemOrders() {
		return new Promise(function(resolve, reject) { resolve([]); });
	}
	function findProfitableTrades(itemOrders) {
		console.log("itemorders");
	}
	function findBestRoute(trades) {
		// assuming trades is an array of:
		//	{ fromSystem: 1, toSystem: 2, profit: 3456, capacity: 100 ... }
	}
	function renderRoute(route) {}

	//application flow
	setUpUI();
	waitForInput()
		.then(getItemOrders)
		.then(findProfitableTrades)
		.then(findBestRoute)
		.then(renderRoute);
});