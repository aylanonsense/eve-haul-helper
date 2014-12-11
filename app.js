//dependencies
var express = require('express');
var lessMiddleware = require('less-middleware');

//set up server
var app = express();
app.use(lessMiddleware({ src: __dirname + "/public", compress : true }));
app.use(express.static(__dirname + '/public'));
app.use('/javascripts', express.static(__dirname + '/javascripts'));
app.listen(process.env.PORT || 3000);
module.exports = app;

//add api services
require('./api');