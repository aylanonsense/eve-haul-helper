requirejs.config({ baseUrl: 'javascripts', paths: { jquery: '/javascripts/lib/jquery-1.10.2' } });

requirejs([
	'analyzer',
	'goods'
], function(
	analyzer,
	GOODS
) {
	var goodIndex = 0;
	var GOOD_IDS = [];
	for(var goodId in GOODS) { GOOD_IDS.push(+goodId); }

	function analyzeAllGoods() {
		analyzer.analyze({ goods: GOOD_IDS }, function() {
			console.log("Done analyzing!");
		});
	}

	function analyzeNextGood() {
		console.log("Analyzing " + GOODS[GOOD_IDS[goodIndex]].name + "!");
		analyzer.analyze({ goods: [ GOOD_IDS[goodIndex] ] }, function() {
			if(++goodIndex < GOOD_IDS.length) {
				console.log("");
				setTimeout(function() {
					analyzeNextGood();
				}, 200);
			}
			else {
				console.log("Done analyzing!");
			}
		});
	}

	analyzeAllGoods();
});