var app = require('./app');
var http = require('http');

app.get('/itemOrders', function(req, res) {
	http.request({
		host: 'api.eve-marketdata.com',
		path: '/api/item_orders2.json?char_name=demo&buysell=b&type_ids=34,36'
	}, function(response) {
		var str = '';
		response.on('data', function (chunk) { str += chunk; });
		response.on('end', function () { res.send(str); });
	}).end();
});