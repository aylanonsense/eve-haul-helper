define(function() {
	return function findProfitableTrades(params, sellOrders, buyOrders) {
		var trades = [];
		for(var i = 0; i < sellOrders.length; i++) {
			var sellOrder = sellOrders[i];
			for(var j = 0; j < buyOrders.length; j++) {
				var buyOrder = buyOrders[j];
				var profit = buyOrder.price * (1 - params.tax) - sellOrder.price;
				if(sellOrder.itemTypeId === buyOrder.itemTypeId && profit > 0) {
					//determine the maximum amount that can be bought
					var maxAmount = Math.min(buyOrder.amount, sellOrder.amount);
					if(maxAmount >= buyOrder.minBuyAmount) {
						trades.push({
							//what is it
							itemTypeId: buyOrder.itemTypeId,
							pricePer: sellOrder.price,
							profitPer: profit,
							minBuyAmount: buyOrder.minBuyAmount,
							maxBuyAmount: maxAmount,

							//where is it
							fromSystemId: sellOrder.systemId,
							toSystemId: buyOrder.systemId,
							fromStationId: sellOrder.stationId,
							toStationId: buyOrder.stationId,

							//when does it expire
							expiresIn: Math.min(buyOrder.expiresIn, sellOrder.expiresIn)
						});
					}
				}
			}
		}
		return trades;
	};
});