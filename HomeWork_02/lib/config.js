/*
* Create and export configuration variables
*
*/

// Instantiate config object
var config = {};

// Define values for staging environment
config = {
	'envName' : 'staging',
	'httpPort' : '3000',
	'httpsPort' : '3001',
	'hashingSecret' : 'ASecret',
	'stripe':{
		'secretKey' : 'sk_test_hH3jfbRRkRiqHcajOP2yAkIl'
	},
	'mailGun': {
		'api_key': '403daf39b83fb455f8a82efa5e6f7061-aff8aa95-0f55db0c',
		'base_url': 'api.mailgun.net',
		'domain' : 'sandbox2f35153ecd514415aa58edf0386af7ac.mailgun.org',
		'template': 'order_receipt',
		'from': 'orders@dominos.com',
		'subject': 'Dominos\'s Pizza: Order Receipt'
	},
	'menus':[
		{
			'id': 'PIZZA01',
			'name':'Margherita',
			'type':'veg',
			'price': 200,
			'currency': 'USD',
			'currency_symbol': '$',
		},
		{
			'id': 'PIZZA02',
			'name':'Double Cheese Margherita',
			'type':'veg',
			'price': 300,
			'currency': 'USD',
			'currency_symbol': '$',
		},
		{
			'id': 'PIZZA03',
			'name': 'Farm House',
			'type': 'veg',
			'price': 300,
			'currency': 'USD',
			'currency_symbol': '$',
		}, 
		{
			'id': 'PIZZA04',
			'name': 'Chicken Golden Delight',
			'type': 'non-veg',
			'price': 500,
			'currency': 'USD',
			'currency_symbol': '$',
		},
		{
			'id': 'PIZZA05',
			'name': 'Non Veg Supreme',
			'type': 'non-veg',
			'price': 600,
			'currency': 'USD',
			'currency_symbol': '$',
		}, 
		{
			'id': 'PIZZA06',
			'name': 'Garlic Breadsticks',
			'type':'veg',
			'price': 150,
			'currency': 'USD',
			'currency_symbol': '$',
		},
		{
			'id': 'PIZZA07',
			'name': 'Choco Lava',
			'type': 'veg',
			'price': 100,
			'currency': 'USD',
			'currency_symbol': '$',
		}
	]
};
// // Define values for production environment
// config.production = {
// 	'envName' : 'production',
// 	'httpPort' : '3000',
// 	'httpsPort' : '3001',
// 	'hashingSecret' : 'ASecret',
// 	'stripe':{},
// 	'mailGun': {}
// };

// // Define which environment was passed as a command-line argument
// var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// // Check that the current environment is one the environment mentioned above, if not, set to default environment STAGING
// var environmentToExport = typeof(config[currentEnvironment]) == 'object' ? config[currentEnvironment] : config.staging;

// Export module
module.exports = config;


