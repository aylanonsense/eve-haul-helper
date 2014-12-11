var app = require('./app');
var http = require('http');

app.get('/orders', function(req, res) {
	http.request({
		host: 'api.eve-marketdata.com',
		path: '/api/item_orders2.json?' +
			'char_name=bridgs' +
			'&buysell=a' +
			'&type_ids=34' +
			'&solarsystem_ids=' + req.query.systems
	}, function(response) {
		var str = '';
		response.on('data', function (chunk) { str += chunk; });
		response.on('end', function () { res.send(str); });
	}).end();
});