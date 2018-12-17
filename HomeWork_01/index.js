/*
 * HomeWork Assignment #1 - Create a simple "Hello world" API
 * 
 * Author : Jayalakshmi Ramasamy
 * Date  : 17/12/2018
 */

  // Dependencies
  var config = require('./config');
  var http = require('http');
  var url = require('url');
  var https = require('https');
  var fs = require('fs');


  // Define a HTTP server
  var http = http.createServer(function(req, res){
  	// Pass request and respose to the common ParseRequest function
  	parseRequest(req, res);  	
  });

  // Start created http server
  http.listen(config.httpPort, function(){
  	console.log('The HTTP server is listening on the port: '+ config.httpPort);
  });

  // Define HTTPS server options
  var httpsOption = {
  	'key' : fs.readFileSync('https/key.pem'),
  	'cert': fs.readFileSync('https/cert.pem') 
  };

  // Define HTTPS server
  var https = https.createServer(httpsOption, function(req, res){
  	// Pass request and respose to the common ParseRequest function
  	parseRequest(req, res); 
  });

  // Start HTTPS server
  https.listen(config.httpsPort, function(){
  	console.log('The HTTPS server is listening on the port: '+ config.httpsPort);
  });

  // Parse the request from both HTTP or HTTPS server
  var parseRequest = {};

  parseRequest = function(req, res){
  	// Parse URL
  	var parsedURL = url.parse(req.url, true);

  	// Get Path name
  	var pathName = parsedURL.pathname;

  	// Trim slash(/) from both side of path name
  	var trimmedPathName = pathName.replace(/^\/+|\/+$/g, '').toLowerCase();

  	// Get request methos
  	var method = req.method.toLowerCase();

  	// Get headers as an object
  	var headers = req.headers;

  	// Get query string as an object
  	var queryString = parsedURL.query;

    // Check the path name is in allowed router and choose the handler
    var chosenHandler = typeof(router[trimmedPathName]) !== 'undefined' ? router[trimmedPathName] : handler.notFound;

    // Define data object to pass via handler
    var data = {
    	'trimmedPathName' : trimmedPathName,
    	'method' : method,
    	'headers' : headers,
    	'queryString' : queryString
    };
    // Call choosed handler
    chosenHandler(data, function(statusCode, statusMsg, payLoad){
    	// Use the status code called back by the handler, or default to 200
    	var statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

    	// Use the message for the status code called back by the handler, or default to OK
    	var statusMsg = typeof(statusMsg) == 'string' ? statusMsg : 'OK';

    	// Use the pay load called back by the handler, or default to an empty object
    	var payLoad = typeof(payLoad) == 'object' ? payLoad : {};

    	// convert payload object to string
    	var payLoadString = JSON.stringify(payLoad);

    	// Define JSON response type
  		res.setHeader('Content-Type', 'application/json');
  		res.writeHead(statusCode, statusMsg);
  		res.end(payLoadString);

  		// Log the request details
  		console.log("The request is received from '" + data.trimmedPathName + "' with method: " + data.method + " with headers & query string: ", data.headers, data.queryString);
    });
  };

  // Define handlers
  var handler = {};

  // Hello Handler
  handler.hello = function(data, callback){
  	// Callback a HTTP statusCode, and payLoad object
  	callback(604, 'Page Found', {'success':'Welcome to HomeWork Assignment #1 - Hello World!'});
  };

  // Not Found handler
  handler.notFound = function(data, callback){
  	callback(404,'Not Found', {'error' : 'Requested URL is not found.'})
  };
  // Define a request router
  var router = {
  	'hello' : handler.hello
  };