requirejs.config({ baseUrl: 'javascripts', paths: { jquery: '/javascripts/lib/jquery-1.10.2' } });

requirejs([
	'analyzer'
], function(
	analyzer
) {

	function getRecentOrders() {
		console.log("Getting recent orders...");
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: "recent",
				dataType: "json"
			}).done(resolve);
		});
	}
	function getUniqueGoodIds(orders) {
		var goodIds = [];
		orders = orders.emd.result.rowset.row;
		for(var i = 0; i < orders.length; i++) {
			if(goodIds.indexOf(orders[i].typeID) === -1) {
				goodIds.push(orders[i].typeID);
			}
		}
		console.log("Got " + orders.length + " orders of " + goodIds.length + " different goods!");
		return goodIds;
	}

	function repeatedlyAnalyzeRandomGoods(goodIds, repeatsLeft, msUntilRepeat) {
		if(typeof repeatsLeft !== 'number') { repeatsLeft = 90; }
		if(typeof msUntilRepeat !== 'number') { msUntilRepeat = 500; }
		var randomGoodIds = [];
		for(var i = 0; i < 100; i++) {
			randomGoodIds.push(goodIds[Math.floor(Math.random() * goodIds.length)]);
		}
		analyzer.analyze({ goods: randomGoodIds }).then(function() {
			if(repeatsLeft > 0) {
				setTimeout(function() {
					repeatedlyAnalyzeRandomGoods(goodIds, repeatsLeft - 1, Math.min(msUntilRepeat * 2, 5000));
				}, msUntilRepeat);
			}
			else {
				console.log("DONE!");
			}
		});
	}

	getRecentOrders()
		.then(getUniqueGoodIds)
		.then(repeatedlyAnalyzeRandomGoods);
});