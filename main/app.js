var port = 3000;

_ = require('./client/resources/js/lib/lodash-2.4.1.min.js');

_(process.argv)
	.map(function (arg) { return arg.indexOf('port=') == 0 ?
			arg.substring('port='.length, arg.length) : undefined })
	.filter(function(port) { return !_.isUndefined(port); })
	.at([0])
	.forEach(function(finalPort) { if (!_.isUndefined(finalPort)) port = finalPort; });
console.log('port ', port);

var express = require('express'),
		app = express(),
		server = require('http').createServer(app),
	debug = require('debug');

app.get('/', function (req, res) {
	debug(__dirname + '/client/views/index.html');
    res.sendfile(__dirname + '/client/views/index.html');
});

app.use('/resources', express.static(__dirname + "/client/resources"));
//Expose files under views, mainly for spiking now
app.use('/', express.static(__dirname + "/client/views"));

server.listen(port);
