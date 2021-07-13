/*
* Route-related tasks or request handlers
*
*/

// Dependencies
var _data = require('./data');
var config = require('./config');
var helpers = require('./helpers');

// Instantiate handlers object
var handlers = {};

// User handlers
handlers.users = function(data, callback){
	var acceptableMethods = ['post', 'get', 'put', 'delete'];
	var allRouteMethods = ['login', 'logout'];
	if(data.routeMethod.length == 0 && acceptableMethods.indexOf(data.method) !== -1){
		handlers._users[data.method](data, callback);
	}else if(allRouteMethods.indexOf(data.routeMethod) !== -1){
		handlers._users[data.routeMethod](data, callback);
	}else{
		callback(405);
	}
};

// Container for users sub-methods
handlers._users = {};


/**
* Users - Create or Post
* @required data: name, email_address, street_address, password, confirm_password
* @optional data: none
*
* @return statuscode, json
*/

handlers._users.post = function(data, callback){
	// Validate required data
	var name = typeof(data.payLoad.name) == 'string' && data.payLoad.name.trim().length > 0 ? data.payLoad.name : false;
	var email_address = typeof(data.payLoad.email_address) == 'string' && data.payLoad.email_address.trim().length > 0 && helpers.isValidEmail(data.payLoad.email_address) ? data.payLoad.email_address : false;
	var street_address = typeof(data.payLoad.street_address) == 'string' && data.payLoad.street_address.trim().length > 0 ? data.payLoad.street_address : false;
	var password = typeof(data.payLoad.password) == 'string' && data.payLoad.password.trim().length > 0 ? data.payLoad.password.trim() : false;
	var confirm_password = typeof(data.payLoad.confirm_password) == 'string' && data.payLoad.confirm_password.trim().length > 0 && data.payLoad.confirm_password == data.payLoad.password ? data.payLoad.confirm_password.trim() : false;

	if(name && email_address && street_address && password && confirm_password){
		// Check for the duplicate user
		_data.read('users',email_address, function(err, data){
			if(err){
				// Hash the password
				var hashedPassword = helpers.hash(password);

				// Create user object
				var newUser = {
					'name' : name,
					'email_address' : email_address,
					'street_address' : street_address,
					'password' : hashedPassword
				};
				// Create user for the given details
				_data.create('users', email_address, newUser, function(err){
					if(!err){
						callback(200, {'Success' : 'User created successfully'});
					}else{
						console.log('\x1b[31m%s\x1b[0m',err);
						callback(500, {'Error' : 'Could not create new user'});
					}
				});
			}else{
				callback(400,{'Error' : 'A user with that email address already exists'});
			}
		});
	}else{
		callback(400,{'Error':'Missing/Invalid required field'});
	}
};

/**
* Users - Read or Get
* @required data: email, authorized token
* @optional data: none
*
* @return statuscode, json
*/
handlers._users.get = function(data, callback){
	// Check for the required field
	var email_address = typeof(data.queryStringObject.email_address) == 'string' && data.queryStringObject.email_address.trim().length > 0 && helpers.isValidEmail(data.queryStringObject.email_address) ? data.queryStringObject.email_address : false;

	if(email_address){
		// Get the token from the headers
		var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
		
		if(token){
			handlers._tokens.verifyToken(token, email_address, function(tokenIsValid){
				if(tokenIsValid){
					// Check that the email address is Valid
					_data.read('users', email_address,function(err, userData){
						if(!err && userData){
							delete(userData.password);
							callback(200, userData);
						}else{
							callback(404,{'Error':'The specified user does not exist'});
						}
					});
				}else{
					callback(403,{'Error':'Token Invalid/expired'})
				}					
			});		
		}else{
			callback(401,{'Error':'Unauthorized'})
		}
		
	}else{
		callback(400,{'Error':'Missing/Invalid required field'})
	}
}

/**
* Users - Update or Put
* @required data: email
* @optional data: name, mobile, street_address
*
* @return statuscode, json
*/
handlers._users.put = function(data, callback){
	// Validate required field
	var email_address = typeof(data.payLoad.email_address) == 'string' && data.payLoad.email_address.trim().length > 0 && data.payLoad.email_address.trim().length > 0 && helpers.isValidEmail(data.payLoad.email_address) ? data.payLoad.email_address : false;

	// Check for the optional field
	var name = typeof(data.payLoad.name) == 'string' && data.payLoad.name.trim().length > 0 ? data.payLoad.name : false;	
	var street_address = typeof(data.payLoad.street_address) == 'string' && data.payLoad.street_address.trim().length > 0 ? data.payLoad.street_address : false;
	var password = typeof(data.payLoad.password) == 'string' && data.payLoad.password.trim().length > 0 ? data.payLoad.password.trim() : false;
	if(email_address){
		// Get the token from the headers
		var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
		
		if(token){
			handlers._tokens.verifyToken(token, email_address, function(tokenIsValid){
				if(tokenIsValid){
					if(name || street_address || password){
						// Check if the email address valid
						_data.read('users', email_address, function(err, userData){
							if(!err && userData){
								// Container for user details
								var updatedData = userData;
								// Update optiona fields
								if(name){
									updatedData.name = name;
								}

								if(street_address){
									updatedData.street_address = street_address;
								}
								if(password){
									updatedData.password = helpers.hash(password);
								}
								// Update user details
								_data.update('users', email_address,updatedData, function(err){
									if(!err){
										callback(200, {'Error' : 'User details updated successfully'});
									}else{
										callback(500, {'Error' : 'Could not update user details'});
									}
								});
							}else{
								callback(404,{'Error':'The specified user does not exist'});
							}
						});
					}else{
						callback(400,{'Error':'Missing field to update'})
					}
				}else{
					callback(401,{'Error':'Token Invalid/expired'});
				}
			});
		}else{
			callback(401,{'Error':'Unauthorized'});
		}
	}else{
		callback(400,{'Error':'Missing/Invalid required field'})
	}
}

/**
* Users - Delete
* @required data: email, token
* @optional data: none
*
* @return statuscode, json
*/
handlers._users.delete = function(data, callback){
	// Check for the required field
	var email_address = typeof(data.queryStringObject.email_address) == 'string' && data.queryStringObject.email_address.trim().length > 0 && helpers.isValidEmail(data.queryStringObject.email_address) ? data.queryStringObject.email_address : false;

	if(email_address){
		// Get the token from the headers
		var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
		
		if(token){
			handlers._tokens.verifyToken(token, email_address, function(tokenIsValid){
				if(tokenIsValid){
					_data.read('users', email_address, function(err,userData){
						if(!err && userData){
							// Delete user
							_data.delete('users', email_address, function(err){
								if(!err){
									callback(200,{'Error':'The specified user has been deleted successfully'});
								}else{
									callback(500,{'Error':'Could not delete the user'});
								}
							});
						}else{
							callback(404,{'Error':'The specified user does not exist'});
						}
					})
				}else{
					callback(401,{'Error':'Token Invalid/expired'});
				}
			});
		}else{
			callback(401,{'Error':'Unauthorized'});
		}
	}else{
		callback(400,{'Error':'Missing/Invalid required field'})
	}
}


/** 
* User - Login or POST
* @required data: email_address, password
* @optional data: none
*
* @return statuscode, json
*/
handlers._users.login = function(data, callback){
	var acceptableMethods = ['post'];
	if(acceptableMethods.indexOf(data.method) === -1){
		callback(405);
	}else{
		// Validate required fields
		var email_address = typeof(data.payLoad.email_address) == 'string' && data.payLoad.email_address.trim().length > 0 && helpers.isValidEmail(data.payLoad.email_address) ? data.payLoad.email_address : false;
		var password = typeof(data.payLoad.password) == 'string' && data.payLoad.password.trim().length >= 6 ? data.payLoad.password.trim() : false;
		
		if(email_address && password){
			var hashPassword = helpers.hash(password);
			// Lookup the user
			_data.read('users', email_address, function(err, userData){
				if(!err && userData){
					if(hashPassword == userData.password){
						// Generate new token
						var token = helpers.createRandomString(20);
						// Make token valid for an hour
						var expires = Date.now() * 1000 * 60 * 60;
						// Create token object
						var tokenObject = {
							'id' : token,
							'email_address' : email_address,
							'expires' : expires
						}
						// Create new token
						_data.create('tokens',token, tokenObject, function(err){
							if(!err){
								// Welcome object
								var welcomeObject = [{
									'welcome': [{
										'greetings': "Welcome to Domino's Pizza!",
										'message': "Thank you for choosing Domino's Pizza. Please check the menu items and add the menu to the cart using menu id. Have a good day!"
									}],
									'menus': helpers.formateMenu(config.menus),
									'token':[{
										'token': token,
										'expires' : expires
									}]
								}]
								callback(200, welcomeObject);
							}else{
								callback(500, {'Error': 'Could not create new token'});
							}
						});
					}else{
						callback(401, {'Error' : 'Invalid username/password'});
					}
				}else{
					callback(404, {'Error' : 'The specified user does not exist'});
				}
			});
		}else{
			callback(400, {'Error': 'Missing/Invalid required field'});
		}
	}

}

/**
* User - Logout
* @required data: authorization token, email_address
*
* @return statuscode, json
*/
handlers._users.logout = function(data, callback){
	var acceptableMethods = ['get'];
	if(acceptableMethods.indexOf(data.method) === -1){
		callback(405);
	}else{
		// Check for the required field
		var email_address = typeof(data.queryStringObject.email_address) == 'string' && data.queryStringObject.email_address.trim().length > 0 && helpers.isValidEmail(data.queryStringObject.email_address) ? data.queryStringObject.email_address : false;

		if(email_address){
			// Get the token from the headers
			var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
			
			if(token){
				handlers._tokens.verifyToken(token, email_address, function(tokenIsValid){
					if(tokenIsValid){
						// Delete user token
						_data.delete('tokens', token, function(err){
							if(!err){
								callback(200,{'Error':'User logout successfully'});
							}else{
								callback(500,{'Error':'Could not delete the token'});
							}
						});
					}else{
						callback(403,{'Error':'Token Invalid/expired'})
					}					
				});		
			}else{
				callback(401,{'Error':'Unauthorized'})
			}
			
		}else{
			callback(400,{'Error':'Missing/Invalid required field'})
		}
	}
}

// Token handlers
handlers.tokens = function(data, callback){
	var acceptableMethods = ['post', 'get', 'put', 'delete'];
	var allRouteMethods = ['refresh'];
	if(data.routeMethod.length == 0 && acceptableMethods.indexOf(data.method) !== -1){
		handlers._tokens[data.method](data, callback);
	}else if(allRouteMethods.indexOf(data.routeMethod) !== -1){
		handlers._tokens[data.routeMethod](data, callback);
	}else{
		callback(405);
	}
};


// Container for tokens sub-methods
handlers._tokens = {};

// Verify that the given token is valid for the current user
handlers._tokens.verifyToken = function(token, email_address, callback){
	// Lookup the token
	_data.read('tokens',token, function(err, tokenData){
		if(!err && tokenData){
			if(tokenData.email_address == email_address && tokenData.expires > Date.now()){
				callback(true);
			}else{
				callback(false);
			}
		}else{
			callback(false);
		}
	});
}

// Authenticate user using token
handlers._tokens.authendicateToken = function(token, callback){
	// Lookup the token
	_data.read('tokens',token, function(err, tokenData){
		if(!err && tokenData){
			if(tokenData.expires > Date.now()){
				callback(true, tokenData);
			}else{
				callback(false, {});
			}
		}else{
			callback(false, {});
		}
	});
}

// Refresh authorization token
// Required data: token, email_address
handlers._tokens.refresh = function(data, callback){
	var acceptableMethods = ['post'];
	if(acceptableMethods.indexOf(data.method) === -1){
		callback(405);
	}else{
		// Check for the required data
		var email_address = typeof(data.payLoad.email_address) == 'string' && data.payLoad.email_address.trim().length > 0 && helpers.isValidEmail(data.payLoad.email_address) ? data.payLoad.email_address : false;
		var token = typeof(data.payLoad.token) == 'string' && data.payLoad.token.trim().length == 20 ? data.payLoad.token.trim() : false;
		if(token && email_address){
			// Lookup the user
			_data.read('users', email_address, function(err, userData){
				if(!err && userData){
					// Lookup the token
					_data.read('tokens',token, function(err,tokenData){
						if(!err && tokenData){
							if(tokenData.email_address == email_address){
								// Set new expire time
								var expires = Date.now() * 1000 * 60 * 60;
								var tokenObject = tokenData;
								tokenObject.expires = expires;

								// Update token
								_data.update('tokens', token, tokenObject, function(err){
									if(!err){
										callback(200, {'Sucess':'Token has been refreshed successfully','Token': tokenObject})
									}else{
										callback(500, {'Error': 'Could not update token expire time'});
									}
								});
							}else{
								callback(401,{'Error': 'Invalid Email address/token'})
							}
						}else{
							callback(404,{'Error':'The specified token does not exist'});
						}
					});
				}else{
					callback(404,{'Error':'The specified user does not exist'});
				}
			});
		}else{
			callback(400,{'Error':'Missing/Invalid required field'})
		}
	}
}

// Menus handlers
handlers.menus = function(data, callback){
	var acceptableMethods = ['get'];
	if(acceptableMethods.indexOf(data.method) !== -1){
		handlers._menus[data.method](data, callback);
	}else{
		callback(405);
	}
};

// Container for menus routing methods
handlers._menus = {};

/**
* Menus - Get
* @required data: token
*
* @return statuscode, json
*/
handlers._menus.get = function(data, callback){
	// Get the token from the headers
	var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;

	if(token){
		handlers._tokens.authendicateToken(token, function(isAuthentic, tokenData){
			if(isAuthentic){
				callback(200, helpers.formateMenu(config.menus));
			}else{
				callback(403,{'Error': 'Forbidden'})
			}
		});
	}else{
		callback(401,{'Error':'Unauthorized'})
	}
}

// Shopping cart handlers
handlers.cart = function(data, callback){
	var acceptableMethods = ['post', 'get', 'put', 'delete'];
	var allRouteMethods = ['empty'];
	if(data.routeMethod.length == 0 && acceptableMethods.indexOf(data.method) !== -1){
		handlers._cart[data.method](data, callback);
	}else if(allRouteMethods.indexOf(data.routeMethod) !== -1){
		handlers._cart[data.routeMethod](data, callback);
	}else{
		callback(405);
	}
};

// Container for cart routing methods
handlers._cart = {};

/**
* Cart - Create or Post handler
* @required data: authorization token, menu_id, quantity
* @optional field: none
*
* @return statuscode, json
*/
handlers._cart.post = function(data, callback){
	// Check for the required fields
	var menu_id = typeof(data.payLoad.menu_id) == 'string' ? data.payLoad.menu_id.trim() : false;
	var quantity = typeof(data.payLoad.quantity) == 'number' && data.payLoad.quantity > 0 ? data.payLoad.quantity : false;
	// Get the token from the headers
	var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
	if(menu_id && quantity){
		if(token){
			handlers._tokens.authendicateToken(token, function(isAuthentic, tokenData){
				if(isAuthentic && tokenData){
					// validate menu_id
					var menuDetails = helpers.getPrice(menu_id);
					if(menuDetails !== false && Object.keys(menuDetails).length > 0){
						// Lookup for the cart of given user
						_data.read('cart',tokenData.email_address, function(err,cartData){
							if(!err && cartData){
								// Update user's cart
								var updatedCart = [];
								var cartObject = cartData[0].shopping_cart;
								var cartTotal = cartData[1].total;
								// Check for item alreadt in cart
								var isAddedItem = false;

								cartObject.forEach(function(item){
									if(item.menu_id == menu_id){
										item.quantity = item.quantity + quantity;
										item.total = item.quantity * item.price;
										item.updated_on = Date.now();
										isAddedItem = true;
										return;
									}
								});
								if(!isAddedItem){
									// Create cart object
									var NewCartItem = {
										'menu_id' : menu_id,
										'menu_name': menuDetails.name,
										'quantity' : quantity,
										'price' : menuDetails.price,
										'total' : menuDetails.price * quantity,
										'currency' : menuDetails.currency,
										'currency_symbol' : menuDetails.currency_symbol,
										'created_on': Date.now(),
										'updated_on': false
									};

									cartObject.push(NewCartItem);
								}

								// Update cart item total amount
								cartTotal.total_amount += menuDetails.price * quantity;
								
								updatedCart.push({'shopping_cart' : cartObject});
								updatedCart.push({'total' : cartTotal});

								// Update cart
								_data.update('cart',tokenData.email_address, updatedCart, function(err){
									if(!err){
										callback(200, {'Success': 'Your shopping cart has beed updated successfully'});
									}else{
										callback(500, {'Error': 'Could not update your cart'})
									}
								});

							}else{
								// Create cart object
								var cartObject = [];
								var newItem = [{
									'menu_id' : menu_id,
									'menu_name': menuDetails.name,
									'quantity' : quantity,
									'price' : menuDetails.price,
									'total' : menuDetails.price * quantity,
									'currency' : menuDetails.currency,
									'currency_symbol' : menuDetails.currency_symbol,
									'created_on': Date.now(),
									'updated_on': false
								}];
								cartObject.push({'shopping_cart' : newItem });
								cartObject.push({'total' : {
									'total_amount': quantity * menuDetails.price,
									'currency': menuDetails.currency,
									'currency_symbol' : menuDetails.currency_symbol
								}});
								// Create new cart
								_data.create('cart',tokenData.email_address,cartObject, function(err){
									if(!err){
										callback(200, {'Success' : 'Your shopping cart has been updated successfully'});
									}else{
										callback(500, {'Error': 'Could not create cart'});
									}
								});
							}
						});
					}else{
						callback(401,{'Error': 'Invalid Menu'})
					}
				}else{
					callback(403,{'Error': 'Forbidden'})
				}
			});
		}else{
			callback(401,{'Error':'Unauthorized'})
		}
	}else{
		callback(400,{'Error':'Missing/Invalid required field'})
	}
	
}

/**
* Cart - View / Get
* @required data: token
* @optional data: none
* @return statuscode, json
*/
handlers._cart.get = function(data, callback){
	// Get the token from the headers
	var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
	if(token){
		handlers._tokens.authendicateToken(token, function(isAuthentic, tokenData){
			if(isAuthentic && tokenData){
				// Lookup for the cart
				_data.read('cart', tokenData.email_address, function(err, cartData){
					if(!err && cartData){
						callback(200, cartData);
					}else{
						callback(200, {'Message': "Your cart is empty"});
					}
				});
			}else{
				callback(403,{'Error': 'Forbidden'})
			}
		});
	}else{
		callback(401,{'Error':'Unauthorized'})
	}
}

/**
* Cart - Update / Put
*
* @required data: token, menu_id and quantity
* @optional data: none
* 
* @return statuscode, json
*/
handlers._cart.put = function(data, callback){
	// Get the token from the headers
	var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
	if(token){
		// Check for the required fields
		var menu_id = typeof(data.payLoad.menu_id) == 'string' ? data.payLoad.menu_id.trim() : false;
		var quantity = typeof(data.payLoad.quantity) == 'number' && data.payLoad.quantity > 0 ? data.payLoad.quantity : false;
		if(menu_id && quantity){
			handlers._tokens.authendicateToken(token, function(isAuthentic, tokenData){
				if(isAuthentic){
					// validate menu_id
					var menuDetails = helpers.getPrice(menu_id);
					if(menuDetails !== false && Object.keys(menuDetails).length > 0){
						// Lookup for the cart
						_data.read('cart', tokenData.email_address, function(err, cartData){
							if(!err && cartData){
								// Update user's cart
								var updatedCart = [];
								var cartObject = cartData[0].shopping_cart;
								var cartTotal = cartData[1].total;

								// Check for item is in cart
								var hasItem = false;
								var oldQuantity = 0;

								cartObject.forEach(function(item){
									if(item.menu_id == menu_id){
										oldQuantity = item.quantity;
										item.quantity = quantity;
										item.total = item.price * item.quantity;
										item.updated_on = Date.now();
										hasItem = true;
										return;
									}
								});
								if(hasItem){
									// Update total
									if(quantity > oldQuantity){
										cartTotal.total_amount += (quantity-oldQuantity) * menuDetails.price;
									}else if(quantity < oldQuantity){
										cartTotal.total_amount -= (oldQuantity-quantity) * menuDetails.price;
									}

									updatedCart.push({'shopping_cart' : cartObject});
									updatedCart.push({'total' : cartTotal});

									// Update cart
									_data.update('cart',tokenData.email_address, updatedCart, function(err){
										if(!err){
											callback(200, {'Success': 'Your shopping cart has beed updated successfully'});
										}else{
											callback(500, {'Error': 'Could not update your cart'})
										}
									});
								}else{
									callback(404, {'Error': 'The specified menu is not available in your cart'});
								}
							}else{
								callback(200, {'Message': "Your cart is empty"});
							}
						});
					}else{
						callback(401,{'Error': 'Invalid Menu'})
					}
				}else{
					callback(403,{'Error': 'Forbidden'})
				}
			});
		}else{
			callback(400,{'Error':'Missing/Invalid required field'})
		}
	}else{
		callback(401,{'Error':'Unauthorized'})
	}
}

/**
* Cart - Delete an item
* @required data: token, menu_id
* @optional data: none
* @return statuscode, json
*/
handlers._cart.delete = function(data, callback){
	// Get the token from the headers
	var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
	if(token){
		// Check for the required fields
		var menu_id = typeof(data.payLoad.menu_id) == 'string' ? data.payLoad.menu_id.trim() : false;
		if(menu_id){
			handlers._tokens.authendicateToken(token, function(isAuthentic, tokenData){
				if(isAuthentic){
					// validate menu_id
					var menuDetails = helpers.getPrice(menu_id);
					if(menuDetails !== false && Object.keys(menuDetails).length > 0){
						// Lookup for the cart
						_data.read('cart', tokenData.email_address, function(err, cartData){
							if(!err && cartData){
								// Update user's cart
								var updatedCart = [];
								var cartObject = cartData[0].shopping_cart;
								var cartTotal = cartData[1].total;
									// Check for item is in cart
									var hasItem = false;
									var oldQuantity = 0;

									cartObject.forEach(function(item, i){
										if(item !== null && item.menu_id == menu_id){
											oldQuantity = item.quantity; 
											hasItem = true;
											delete cartObject[i];
											return;
										}
									});

									if(hasItem){
										// Update total
										cartTotal.total_amount -= oldQuantity * menuDetails.price;


										updatedCart.push({'shopping_cart' : cartObject.filter(x => x !== null)});
										updatedCart.push({'total' : cartTotal});

										// Update cart
										_data.update('cart',tokenData.email_address, updatedCart, function(err){
											if(!err){
												callback(200, {'Success': 'Your shopping cart has beed updated successfully'});
											}else{
												callback(500, {'Error': 'Could not update your cart'})
											}
										});
									}else{
										callback(404, {'Error': 'The specified menu is not available in your cart'});
									}

								}else{
									callback(200, {'Message': "Your cart is empty"});
								}
							});
					}else{
						callback(401,{'Error': 'Invalid Menu'})
					}
				}else{
					callback(403,{'Error': 'Forbidden'})
				}
			});
		}else{
			callback(400,{'Error':'Missing/Invalid required field'})
		}
	}else{
		callback(401,{'Error':'Unauthorized'})
	}	
}

/**
* Cart - empty (remove all items)
* @required data: token
* @optional data: none
* 
* @return statuscode, json
*/
handlers._cart.empty = function(data, callback){
	var acceptableMethods = ['post'];
	if(acceptableMethods.indexOf(data.method) === -1){
		callback(405);
	}else{
		// Get the token from the headers
		var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
		if(token){
			handlers._tokens.authendicateToken(token, function(isAuthentic, tokenData){
				if(isAuthentic && tokenData){
					// Delete the cart
					_data.delete('cart', tokenData.email_address, function(err){
						if(!err){
							callback(200, {'Success': "Your cart is empty"});
						}else{
							callback(500, {'Error': "Could not empty your cart / Your cart already empty"});
						}
					});
				}else{
					callback(403,{'Error': 'Forbidden'})
				}
			});
		}else{
			callback(401,{'Error':'Unauthorized'})
		}
	}
} 

// Container for order routes
handlers.orders = {};

// Shopping cart handlers
handlers.orders = function(data, callback){
	var acceptableMethods = ['post', 'get'];
	var allRouteMethods = ['empty'];
	if(data.routeMethod.length == 0 && acceptableMethods.indexOf(data.method) !== -1){
		handlers._orders[data.method](data, callback);
	}else if(allRouteMethods.indexOf(data.routeMethod) !== -1){
		handlers._orders[data.routeMethod](data, callback);
	}else{
		callback(405);
	}
};

// Container for cart routing methods
handlers._orders = {};

// Orders - POST
// required data: token
// optional data: none
handlers._orders.post = function(data, callback){
	// Get the token from the headers
	var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
	if(token){
		handlers._tokens.authendicateToken(token, function(isAuthentic, tokenData){
			if(isAuthentic && tokenData){
					// Lookup for the cart
					_data.read('cart', tokenData.email_address, function(err, cartData){
						if(!err && cartData){
							var amount = cartData[1].total.total_amount;
							var currency = cartData[1].total.currency;
							// Lookup user
							_data.read('users',tokenData.email_address, function(err, userData){
								if(!err && userData){
									// Place order via Stripe payment gateway
									helpers.placeOrder(userData, amount, currency, function(err, orderData){

										if(!err && orderData){									
											// Create order object
											var orderObject = {
												'status': 'success',
												'transaction_id': orderData.id,
												'order_amt': orderData.amount,
												'order_currency': orderData.currency,
												'order_currency_symbol': cartData[1].total.currency_symbol,
												'user': orderData.receipt_email,
												'items' : cartData[0].shopping_cart,
												'total' : cartData[1].total,
												'ordered_on': Date.now()
											};

											// Create mail template object
											var mailObject = {
												'transaction_id': orderData.id,
												'order_amt': orderData.amount,
												'order_currency': orderData.currency,
												'order_currency_symbol': cartData[1].total.currency_symbol,
												'name': userData.name,
												'items' : cartData[0].shopping_cart,
												'total' : cartData[1].total,
												'date': new Date().toUTCString()
											};
											
											// Lookup the orders of user
											_data.read('orders', tokenData.email_address, function(err, orders){
												if(!err && orders){
													// Update order object
													var updatedOrders = [];
													var previousOrders = orders[0].orders;
													previousOrders.push(orderObject);

													updatedOrders.push({'orders': previousOrders});
													// Update order
													_data.update('orders', tokenData.email_address, updatedOrders, function(err){
														if(!err){
															// Send order recipt to user email
															var isSent = "";
															helpers.sendOrderReceiptMail(orderData.receipt_email, mailObject, function(err, response){
																if(!err && response){
																	isSent = "Your order recipt has been sent to your registered email";
																}else{
																	isSent = "Sorry, we could not send you order recipt";
																}
																// Clear Shopping Cart
																_data.delete('cart', tokenData.email_address, function(err){
																	if(!err){
																		callback(200, {'Success': 'Your order has been placed successfully','transaction_id': orderData.id, 'recipt': isSent});
																	}else{
																		callback(500, {'Error': "Could not empty your cart"});
																	}
																});
															});
														}else{
															callback(500,{'Error' : 'Could not create new order'});
														}
													});
												}else{
													// New order
													var newOrder = [];
													newOrder.push({'orders': [orderObject]});
													// Create order
													_data.create('orders', tokenData.email_address, newOrder,function(err){
														if(!err){
															// Send order recipt to user email
															var isSent = "";
															helpers.sendOrderReceiptMail(orderData.receipt_email, mailObject, function(err, response){
																if(!err && response){
																	isSent = "Your order recipt has been sent to your registered email";
																}else{
																	isSent = "Sorry, we could not send you order recipt";
																}
																// Clear Shopping Cart
																_data.delete('cart', tokenData.email_address, function(err){
																	if(!err){
																		callback(200, {'Success': 'Your order has been placed successfully','transaction_id': orderData.id, 'recipt': isSent});
																	}else{
																		callback(500, {'Error': "Could not empty your cart"});
																	}
																});
															});
															
														}else{
															callback(500,{'Error' : 'Could not create new order'});
														}
													});
												}
											});
										}else{
											callback(400, orderData);
										}
									});
								}else{
									callback(404,{'Error': 'User User not found'});
								}
							});

}else{
	callback(400, {'Error': "Your cart is empty. Fill your cart before proceed to order."});
}
});
}else{
	callback(403,{'Error': 'Forbidden'})
}
});
}else{
	callback(401,{'Error':'Unauthorized'})
}
}

// Orders - Get
// View list of all orders
// required data: token
// optional data: none
// @return statuscode, json
handlers._orders.get = function(data, callback){
	// Get the token from the headers
	var token = typeof(data.headers.authorization) == 'string' && data.headers.authorization.trim().length == 20 ? data.headers.authorization : false;
	if(token){
		handlers._tokens.authendicateToken(token, function(isAuthentic, tokenData){
			if(isAuthentic && tokenData){
				// Lookup for orders
				_data.read('orders', tokenData.email_address, function(err, orderData){
					console.log('look up');
					if(!err && orderData){
						console.log('has order');
						callback(200, {'orders': orderData[0].orders});
					}else{
						console.log('no order');
						callback(200, {'message': 'There is no order'});
					}
				});
			}else{
				callback(403,{'Error': 'Forbidden'})
			}
		});
	}else{
		callback(401,{'Error':'Unauthorized'})
	}
};

// Not Found handler
handlers.notFound = function(data, callback){
	callback(404, {'error' : "Requested URL is not found. Please check the URL."});
};

// Export module
module.exports = handlers;
