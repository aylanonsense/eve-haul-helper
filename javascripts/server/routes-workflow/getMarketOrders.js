define([
	'promise'
],
function(
	Promise
) {
	return function getMarketOrders(params) {
		return new Promise(function(resolve, reject) {
			resolve({
				sellOrders: [
					{ itemTypeId: 5, amount: 200, price: 200, stationId: 40, systemId: 50, expiresIn: 1000000000 }
				],
				buyOrders: [
					{ itemTypeId: 5, amount: 175, price: 300, stationId: 20, systemId: 40, expiresIn: 1000000000,
						minBuyAmount: 1, buyRange: 1 }
				]
			});
		});
	};
});