/*
 * HomeWork_01 - create and export configuration
 *
 */

 // Container for the environment variables
 var environments ={};

 // Development environment
 environments.development = {
 	'envName' : 'Development',
 	'httpPort' : 3000,
 	'httpsPort' : 3001
 };

 // Production environment
 environments.production = {
 	'envName' : 'Production',
 	'httpPort' : 5000,
 	'httpsPort' : 5001
 }

 // Read NODE_ENV variable passed via command-line
 var nodeENV = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

 // Check the NODE_ENV value within envtironmens
 var currentEnvironment = typeof(environments[nodeENV]) == 'object' ? environments[nodeENV] : environments.development;

 // Export module
 module.exports = currentEnvironment;