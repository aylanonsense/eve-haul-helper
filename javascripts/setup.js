requirejs.config({ baseUrl: 'javascripts', paths: { jquery: '/javascripts/lib/jquery-1.10.2' } });

requirejs([
	'jquery',
	'systems'
], function(
	$,
	SYSTEMS
	//Promise already included
) {
	var TAX = 0.015;
	var SYSTEM_IDS = [];
	for(var systemId in SYSTEMS) { SYSTEM_IDS.push(systemId); }

	function setUpUI() {}
	function waitForInput() {
		return new Promise(function(resolve, reject) {
			resolve(); //TODO
		});
	}
	function getOrders() {
		console.log("Getting orders...");
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: "orders?systems=" + SYSTEM_IDS.join(","),
				dataType: "json"
			}).done(function(data) {
				resolve(data);
			});
		});
	}
	function cleanOrders(orders) {
		return orders.emd.result.map(function(order) {
			return {
				id: +order.row.orderID,
				isBuyOrder: (order.row.buysell === 'b'),

				//what's being bought/sold
				good: +order.row.typeID,
				price: +order.row.price,
				amt: +order.row.volRemaining,
				minAmt: +order.row.minVolume, //buy orders only
				buyRange: (order.row.range === "-1" ? 0 : +order.row.range), //buy orders only

				//where is the order
				station: +order.row.stationID,
				system: +order.row.solarsystemID,
				region: +order.row.regionID,

				//when does it expire
				timeUntilExpiration: (new Date(order.row.expires)).getTime() - Date.now()
			};
		});
	}
	function logOrderStats(orders) {
		var systemIds = [];
		for(var i = 0; i < orders.length; i++) {
			if(systemIds.indexOf(orders[i].system) === -1) {
				systemIds.push(orders[i].system);
			}
		}
		console.log("Found " + orders.length + " orders over " +
			systemIds.length + " systems: " +
			systemIds.map(function(id) { return SYSTEMS[id].name; }).join(", "));
		return orders;
	}
	function findProfitableTrades(orders) {
		var trades = [];
		//for each buy order
		for(var i = 0; i < orders.length; i++) {
			if(orders[i].isBuyOrder) {
				var buyOrder = orders[i];
				//for each sell order
				for(var j = 0; j < orders.length; j++) {
					if(!orders[j].isBuyOrder) {
						var sellOrder = orders[j];
						//figure out if it's a profitable trade
						if(buyOrder.good === sellOrder.good &&
							buyOrder.price * (1 - TAX) > sellOrder.price) {
							trades.push({ buyOrder: buyOrder, sellOrder: sellOrder });
						}
					}
				}
			}
		}
		console.log("Found " + trades.length + " profitable trades!");
	}
	function findBestRoute(trades) {
		// assuming trades is an array of:
		//	{ fromSystem: 1, toSystem: 2, profit: 3456, capacity: 100 ... }
	}
	function renderRoute(route) {}

	//application flow
	setUpUI();
	waitForInput()
		.then(getOrders)
		.then(cleanOrders)
		.then(logOrderStats)
		.then(findProfitableTrades)
		.then(findBestRoute)
		.then(renderRoute);
});