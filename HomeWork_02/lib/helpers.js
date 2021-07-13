/**
* Helper functions
*
*/

// Dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');	
var queryString = require('querystring');
var StringDecoder = require('string_decoder').StringDecoder;

// Container for helper object
var helpers = {};

// Create SHA256 hash
helpers.hash = function(str){
	if(typeof(str) == 'string' && str.trim().length > 0){
		var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	}else{
		return false;
	}
}

// Convert a string to an object
helpers.parseJsonToObject = function(str){
	try{
		return JSON.parse(str);
	}catch(e){
		return {'Error': 'Could not parse the given string'};
	}
}

// Create a random string of specified length
helpers.createRandomString = function(length){
	// Validate the string length
	var strLength = typeof(length) == 'number' ? length : false;

	if(strLength){
		// Define all the possible characters that could go into random string
		var possibleCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';

		// Variable to store random string
		var randomStr = '';
		for(var i=0; i<strLength; i++){
			randomStr += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
		}

		return randomStr;
	}else{
		return false;
	}
}

// validate email addresses
helpers.isValidEmail = function(email) {
	var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return !!email && typeof email === 'string' && email.match(emailRegex);
};

// Formate menu items
helpers.formateMenu = function(menu){
	var menuItems = typeof(menu) == 'object' ? menu : {};
	if(menuItems.length > 0){
		// Container to store formated menu
		var formatedMenu = [];

		menuItems.forEach(function(item){
			formatedMenu.push({'menu_id' : item.id, 'name' : item.name, 'type' : item.type, 'price': item.currency + ' '+item.price})
		});
		return formatedMenu;
	}else{
		return menuItems;
	}
}

// Get price of a menu using menu_id
helpers.getPrice = function(menu_id){
	var menu_id = typeof(menu_id) == 'string' ? menu_id : '';
	var requestedMenu = {};
	if(menu_id.trim().length > 0){
		var menus = config.menus;
		menus.forEach(function(item){
			if(item.id == menu_id){
				requestedMenu = item;
				return;
			}
		});
		return requestedMenu;
	}else{
		return false;
	}
}

// Place order using STRIPE payment gateway API
helpers.placeOrder = function(user, amount, currency, callback){
	// Validate the required data
	amount = typeof(amount) == 'number' && amount > 0 ? amount : false;
	currency = typeof(currency) == 'string' && currency.length > 0 ? currency : false;

	if(amount && currency){
		// Create request payload object
		var payLoad = {
			'amount' : amount,
			'currency' : currency.toLowerCase(),
			'description' : 'Order from the user '+ user.email_address,
			'source': 'tok_visa',
			'receipt_email': user.email_address
		}

		// Stringify request payload
		var stringPayload = queryString.stringify(payLoad);

		// Create authorization header
		var auth = "Basic " + new Buffer.from(config.stripe.secretKey + ":" + '').toString("base64");

		// configure request details
		var requestDetails = {
			'protocol': 'https:',
			'hostname': 'api.stripe.com',
			'path': '/v1/charges',
			'method' : 'POST',
			'headers': {
				'content-Type' : 'application/x-www-form-urlencoded',
				'content-Length':Buffer.byteLength(stringPayload),
				'Authorization' : auth
			}
		};

		// Instantiate request object
		var req = https.request(requestDetails, function(res){
			// Get the status code
			var status = res.statusCode;
			// Get the payload if any
			var decoder = new StringDecoder('utf-8');
			var buffer = '';

			res.on('data', function(chunk){
				buffer += decoder.write(chunk);
			});

			res.on('end', function(){
				buffer += decoder.end();

				var responsePayload = helpers.parseJsonToObject(buffer);
				//console.log(responsePayload);
				if(status == 200 || status == 201){ 				
					callback(false, responsePayload);
				}else{
					callback(status, responsePayload)
				}
			});
			
		});

		// Handle request error
		req.on('error', function(err){
			callback(err, {});
		});

		// add payload to the request
		req.write(stringPayload);

		// End the request
		req.end();
	}else{
		callback(400, {'status':0,'error':'Missing required inputs, or inputs are invalid'});
	}
}

// Send order receipt mail to customer via MailGun
// required data: from, to, variables
helpers.sendOrderReceiptMail = function(to, template_variables, callback){
	// Check for the required data
	to = typeof(to) == 'string' && to.length > 0 ? to : false;
	template_variables = typeof(template_variables) == 'object' ? template_variables : false;

	if(to && template_variables){
		// Create request payload object
		var payLoad = {
			'from' : config.mailGun.from,
			'to': to,
			'subject': config.mailGun.subject,
			//'text':'body'
			'template': config.mailGun.template,
			'h:X-Mailgun-Variables' : JSON.stringify(template_variables)
		};

		// Stringify request payload
		var stringPayload = queryString.stringify(payLoad);

		// Create authorization header
		var auth = "Basic " + new Buffer.from("api:" + config.mailGun.api_key).toString("base64");

		// configure request details
		var requestDetails = {
			'protocol': 'https:',
			'hostname': config.mailGun.base_url,
			'path': '/v3/'+config.mailGun.domain+'/messages',
			'method' : 'POST',
			'headers': {
				'content-Type' : 'application/x-www-form-urlencoded',
				'content-Length':Buffer.byteLength(stringPayload),
				'Authorization' : auth
			}
		};

		// Instantiate request object
		var req = https.request(requestDetails, function(res){
			// Get the status code
			var status = res.statusCode;
			// Get the payload if any
			var decoder = new StringDecoder('utf-8');
			var buffer = '';

			res.on('data', function(chunk){
				buffer += decoder.write(chunk);
			});

			res.on('end', function(){
				buffer += decoder.end();

				var responsePayload = helpers.parseJsonToObject(buffer);
				if(status == 200 || status == 201){ 				
					callback(false, responsePayload);
				}else{
					callback(status, responsePayload)
				}
			});
			
		});

		// Handle request error
		req.on('error', function(err){
			callback(err, {'error': err});
		});

		// add payload to the request
		req.write(stringPayload);

		// End the request
		req.end();

	}else{
		callback(400, {'status':0,'error':'Missing required inputs, or inputs are invalid'});
	}

}

// Export the module
module.exports = helpers;