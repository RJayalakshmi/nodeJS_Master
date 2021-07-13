/*
* Server-related tasks
*
* Author: Jayalakshmi Ramasamy
* Date: 23/6/2021
*/

// Dependencies 
var http = require('http');
var https = require('https');
var fs = require('fs');
var url = require('url');
var path = require('path');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var handlers = require('./handlers');
var helpers = require('./helpers');

// Instantiate server object
var server = {};

// Instantiate HTTP Server
server.httpServer = http.createServer(function(req, res){
	server.unifiedServer(req, res);
});

// Define HTTPS server
server.httpsServerOptions = {
	'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
	'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem')),
};

// Instantiate HTTPS server
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
	server.unifiedServer(req, res);
});

// All server login for both HTTP and HTTPS server
server.unifiedServer = function(req, res){
	// Get the URL and parse it
	var parsedUrl = url.parse(req.url, true);

	// Get the path
	var path = parsedUrl.pathname;

	// Trim the slashes from the path both side
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');
	var splitPath = trimmedPath.split('/');
	var baseRoute = splitPath[0];
	var routeMethod = (splitPath.length > 1) ? splitPath[splitPath.length - 1] : '';

	// Get the HTTP method
	var method = req.method.toLowerCase();

	// Get query string as an object
	var queryStringObject = parsedUrl.query;

	// Get headers as an object
	var headers = req.headers;

	// Get the payload if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';

	req.on('data', function (chunk){
		buffer += decoder.write(chunk);
	});

	req.on('end', function (){
		buffer += decoder.end();

		// Choose the handler this request should go to. if route is not found, use notFound
		var chosenHandler = typeof(server.route[baseRoute]) !== 'undefined' ? server.route[baseRoute] : handlers.notFound;

		// Construnct the data object to send to the handler
		var data = {
			'trimmedPath': trimmedPath,
			'baseRoute': baseRoute,
			'routeMethod': routeMethod,
			'method': method,
			'queryStringObject': queryStringObject,
			'headers': headers,
			'payLoad' : helpers.parseJsonToObject(buffer)
		};

		// Route the request to the handler specified in th route
		chosenHandler(data, function(StatusCode, payLoad){
			// Use the status code called back by the handler, or default to 200
			var StatusCode = typeof(StatusCode) == 'number' ? StatusCode : 200;

			// Use the payload called back by the handler, or default to an empty object
			var payLoad = typeof(payLoad) == 'object' ? payLoad : {};

			// Convert payload to string
			var payLoadString = JSON.stringify(payLoad);
			// Return the response
			res.setHeader('Content-Type','application/json');
			res.writeHead(StatusCode);
			res.end(payLoadString);

			// If the status code of response is 200, print green otherwise print red
			if(StatusCode == 200){
				console.log('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+StatusCode);
			}else{
				console.log('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+StatusCode);
			}
		});
	});
}

// Define routes
server.route = {
	'users':handlers.users,
	'tokens': handlers.tokens,
	'menus': handlers.menus,
	'cart': handlers.cart,
	'orders': handlers.orders
};

// Init script
server.init = function(){
	// Start HTTP Server
	server.httpServer.listen(config.httpPort, function(){
		console.log('\x1b[33m%s\x1b[0m','The server is listening to the port'+config.httpPort);
	});
	// Start HTTPS server
	server.httpsServer.listen(config.httpsPort, function(){
		console.log('\x1b[35m%s\x1b[0m','The server is listening to the port'+ config.httpsPort);
	});
}

// Export module
module.exports = server;