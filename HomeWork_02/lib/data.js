/**
* Library to Create, update, delete data
*
*/

// Dependencies
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

// Container for the data module
var lib = {};

// Define base directory for the data folder
lib.baseDir = path.join(__dirname,'/../.data/');

// Write into a file
lib.create = function(dir, filename, data, callback){
	// Open the file for writing
	fs.open(lib.baseDir+dir+'/'+filename+'.json','wx',function(err, fileDescriptor){
		if(!err && fileDescriptor){
			// Convert the data to String
			var stringData = JSON.stringify(data);
			// write to file and close it
			fs.writeFile(fileDescriptor, stringData, function(err){
				if(!err){
					fs.close(fileDescriptor, function(err){
						if(!err){
							callback(false)
						}else{
							callback('Error closing new file')
						}
					});
				}else{
					console.log('Error writing to new file');
				}
			});
		}else{
			callback('Error creating a new file');
		}
	});
}

// Read a file
lib.read = function(dir, filename, callback){
	fs.readFile(lib.baseDir+dir+"/"+filename+'.json','utf8', function(err, data){
		if(!err && data){
			var formatedData = helpers.parseJsonToObject(data);
			callback(false, formatedData);
		}else{
			callback(err, data);
		}
	});
}

// Update a file
lib.update = function(dir, filename, data, callback){
	fs.open(lib.baseDir+dir+'/'+filename+'.json', 'r+',function(err, fileDescriptor){
		if(!err && fileDescriptor){
			// Convert data to string
			var stringData = JSON.stringify(data);

			// Remove old content
			fs.ftruncate(fileDescriptor, function(err){
				if(!err){
					// Write to file
					fs.writeFile(fileDescriptor, stringData, function(err){
						if(!err){
							fs.close(fileDescriptor, function(err){
								if(!err){
									callback(false);
								}else{
									callback('Error closing existing file');
								}
							})
						}else{
							callback('Error writing existing file');
						}
					});
				}else{
					callback('Error truncating existing file');
				}
			});
		}else{
			callback('Could not open existing file');
		}
	})
}

// Delete a file
lib.delete = function(dir, filename, callback){
	// Delete file
	fs.unlink(lib.baseDir+dir+'/'+filename+'.json', function(err){
		if(!err){
			callback(false);
		}else{
			callback('Could not delete existing file');
		}
	})
}

// Export
module.exports = lib;
