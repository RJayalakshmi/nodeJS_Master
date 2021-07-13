/*
* Primary file of Pizza-delivery application
*
* Author: Jayalakshmi Ramasamy
* Date: 23/06/2021
*/

// Dependencies
var server = require('./lib/server');


// Instantiate app object
var app = {};

// Init script
app.init = function(){
	// Start the server
	server.init();
}


// Execute
app.init();

// Export module
module.exports = app;