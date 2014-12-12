define(function() {
	return function filterOutTrades(params, trades) {
		return trades.filter(function(trade) {
			return trade.expiresIn > 20 * 60 * 1000; //you have 20+ minutes
			//TODO filter out trades that start or end in (too) low sec space
			//TODO filter out illegal trades
		});
	};
});