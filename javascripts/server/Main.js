define([
	'server/routes-workflow/getMarketOrders',
	'server/routes-workflow/findProfitableTrades',
	'server/routes-workflow/filterOutTrades',
	'server/routes-workflow/findTradeRoutes',
	//'async!server/helper/ItemTypeLookup'
	'server/helper/SystemLookup'
],
function(
	getMarketOrders,
	findProfitableTrades,
	filterOutTrades,
	findTradeRoutes,
	//ItemTypeLookup
	SystemLookup
) {
	return function Main(app) {

		function toNum(str) { return +str; }

		//set up REST service for getting trade routes
		app.get('/api/routes', function(req, res) {
			var params = {
				regions: (req.query.regions ? req.query.regions.split(",").map(toNum) : null),
				security: (req.query.security ? Math.round(+req.query.security * 10) : 0),
				capacity: (req.query.capacity ? +req.query.capacity : null),
				assets: (req.query.assets ? Math.floor(+req.query.assets) : null),
				tax: 0.015 - (req.query.accounting ? +req.query.accounting * 0.0015 : 0),
				allowIllegal: (req.query.allow_illegal === 'true')
				// + maximum amount that can be carried before it is considered "unsafe"
				// + minimum profits to be worthwhile
				// + granular selection of illegal goods
				// + ability to choose particular systems
			};

			//execute code
			getMarketOrders(params)
				.then(function(orders) {
					return findProfitableTrades(params, orders.sellOrders, orders.buyOrders);
				})
				.then(function(trades) {
					return filterOutTrades(params, trades);
				})
				.then(function(trades) {
					return findTradeRoutes(params, trades);
				})
				.then(function(routes) {
					res.send(routes);
				}).done();
		});

		for(var i = 0; i < SystemLookup.allSystemIds.length; i++) {
			var id = SystemLookup.allSystemIds[i];
			var jumps = SystemLookup.getJumpsBetween(30002187, id, 10);
			if(jumps >= 0) {
				console.log("  " + SystemLookup.getById(30002187).name + " to " +
					SystemLookup.getById(id).name + ": " + jumps + " jumps  (" +
					SystemLookup.getRouteBetween(30002187, id).map(function(id) {
						return SystemLookup.getById(id).name;
					}).join(" -> ") + ")");
			}
		}
		console.log("done");
	};
});