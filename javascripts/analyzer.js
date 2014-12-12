define([
	'jquery',
	'systems',
	'goods'
], function(
	$,
	SYSTEMS,
	GOODS
	//Promise already included
) {
	var TAX = 0.015;
	var SYSTEM_IDS = [];
	var AVAILABLE_CAPITAL = 2000000;
	for(var systemId in SYSTEMS) { SYSTEM_IDS.push(+systemId); }

	function getOrders(goods) {
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: "orders?" +
					"systems=" + SYSTEM_IDS.join(",") +
					"&goods=" + goods.join(","),
				dataType: "json"
			}).done(resolve);
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
		var goodIds = [];
		for(i = 0; i < orders.length; i++) {
			if(goodIds.indexOf(orders[i].good) === -1) {
				goodIds.push(orders[i].good);
			}
		}
		console.log("Found " + orders.length + " orders of " + goodIds.length +
			" different goods over " + systemIds.length + " systems: " +
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
							buyOrder.price * (1 - TAX) > sellOrder.price &&
							sellOrder.price < AVAILABLE_CAPITAL &&
							buyOrder.timeUntilExpiration > 0 && sellOrder.timeUntilExpiration > 0) {
							var maxAmountPurchasable = Math.floor(AVAILABLE_CAPITAL / sellOrder.price);
							var amt = Math.min(buyOrder.amt, sellOrder.amt, maxAmountPurchasable);
							var trade = {
								buyOrder: buyOrder,
								sellOrder: sellOrder,
								amt: amt,
								profit: Math.floor(amt * (buyOrder.price * (1 - TAX) - sellOrder.price))
							};
							if(trade.profit >= 10000) {
								trades.push(trade);
							}
						}
					}
				}
			}
		}
		return trades;
	}
	function logTradeStats(trades) {
		if(trades.length === 0) {
			return trades;
		}
		else {
			console.log("Found " + trades.length + " profitable trades:");
			trades.sort(function(a, b) { return b.profit - a.profit; });
			console.log("                AMT GOOD                              PROFIT                           " +
				"START                     PRICE                    DESTINATION               PRICE");
			for(var i = 0; i < trades.length; i++) {
				var trade = trades[i];
				var buyOrder = trade.buyOrder;
				var sellOrder = trade.sellOrder;
				var amt = Math.min(buyOrder.amt, sellOrder.amt);
				console.log("  Trade up to " +
					rjust(amt, 5) + " " +
					ljust(GOODS[buyOrder.good] ?
						GOODS[buyOrder.good].name :
						"<GOOD " + buyOrder.good + ">", 21) +
					" for up to " +
					rjust(trade.profit, 8) +
					" ISK profit by buying from " + ljust(SYSTEMS[sellOrder.system].name, 18) +
					" for " + rjust(Math.ceil(sellOrder.price), 8) + " ISK" +
					" and hauling to " + ljust(SYSTEMS[buyOrder.system].name, 18) +
					" for " + rjust(Math.floor(buyOrder.price), 8) + " ISK");
			}
			console.log("");
			return trades;
		}
	}

	//helper methods
	function ljust(str, size) {
		str = "" + str;
		while(str.length < size) {
			str += " ";
		}
		return str;
	}
	function rjust(str, size) {
		str = "" + str;
		while(str.length < size) {
			str = " " + str;
		}
		return str;
	}

	return {
		analyze: function(params) {
			return getOrders(params.goods)
				.then(cleanOrders)
				.then(logOrderStats)
				.then(findProfitableTrades)
				.then(logTradeStats);
		}
	};
});