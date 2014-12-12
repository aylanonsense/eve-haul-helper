var app = require('./app');
var http = require('http');

app.get('/orders', function(req, res) {
	http.request({
		host: 'api.eve-marketdata.com',
		path: '/api/item_orders2.json?' +
			'char_name=bridgs' +
			'&buysell=a' +
			'&type_ids=' + req.query.goods +
			'&solarsystem_ids=' + req.query.systems
	}, function(response) {
		var str = '';
		response.on('data', function (chunk) { str += chunk; });
		response.on('end', function () { res.send(str); });
	}).end();
});

app.get('/recent', function(req, res) {
	http.request({
		host: 'api.eve-marketdata.com',
		path: '/api/recent_uploads2.json?char_name=bridgs&upload_type=o&hours=1'
	}, function(response) {
		var str = '';
		response.on('data', function (chunk) { str += chunk; });
		response.on('end', function () { res.send(str); });
	}).end();
});