define([
	'server/routes-workflow/getMarketOrders',
	'server/routes-workflow/findProfitableTrades',
	'server/routes-workflow/filterOutTrades',
	'server/routes-workflow/findTradeRoutes',
	'server/helper/ItemTypeLookup',
	'server/helper/SystemJumpsLookup'
],
function(
	getMarketOrders,
	findProfitableTrades,
	filterOutTrades,
	findTradeRoutes
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
				});
		});
	};
});