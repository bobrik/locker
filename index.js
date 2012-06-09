(function(module) {
	var net              = require("net"),
		Lock             = require("./lib/Lock"),
		LockQueueManager = require("./lib/LockQueuemanager");
	
	function releaseLocks(locksRegistry) {
		Object.keys(locksRegistry).forEach(function(key) {
			locksRegistry[key].release();
		});
	};
	
	function Locker() {
		var manager = new LockQueueManager();

		this.server = net.createServer(function(connection) {
			var locksRegistry   = {},
				currentSequence = 0,
				data            = new Buffer(0),
				temp            = new Buffer(0);
		
			connection.on("error", function(error) {
				//console.log(error);
				connection.end();
				releaseLocks(locksRegistry);
			});
		
			connection.on("end", function() {
				releaseLocks(locksRegistry);
			});
			
			connection.on("timeout", function() {
				releaseLocks(locksRegistry);
			});
			
			connection.on("connect", function() {
				//console.log("got connection");
			});
			
			connection.on("data", function(part) {
				var sequence = 0,
					wait     = 0,
					timeout  = 0,
					action   = 0,
					name;
		
				temp = new Buffer(data.length + part.length);
				data.copy(temp, 0);
				part.copy(temp, data.length);
				
				data = new Buffer(temp)
				
				while (data.length && ((data[0] + 14) <= data.length)) {
					sequence = data.readUInt32LE(1);
					action   = data[13];
		
					if ((currentSequence < sequence && action == 1) || action == 0) {
						currentSequence = sequence;
						
						length   = data[0];
						wait     = data.readUInt32LE(5);
						timeout  = data.readUInt32LE(9);
						name     = data.slice(14, length + 14).toString();
						
						//console.log([length, wait, timeout, action, name]);
						
						if (action == 1) {
							lock(name, sequence, wait, timeout);
						} else if (action == 0) {
							unlock(sequence);
						}
		
						data = data.slice(length + 14);
						
						//console.log("data after all")
					} else {
						//console.log("SHIT!");
						connection.end();
						break;
					}
				}
			});
			
			function lock(name, sequence, wait, timeout) {
				var lock = new Lock(name, manager);
		
				locksRegistry[sequence] = lock;
				
				lock.acquire(wait, timeout, function(error) {
					respond(sequence, 1, error ? 0 : 1);
				});
			};
			
			function unlock(sequence) {
				var lock = locksRegistry[sequence];
				
				if (lock) {
					delete locksRegistry[sequence];
				}
				
				respond(sequence, 0, lock && lock.release());
			};
			
			function respond(sequence, action, result) {
				var response = new Buffer(6);
		
				response.writeUInt32LE(sequence, 0);
				response[4] = action;
				response[5] = result ? 1 : 0;
				
				//console.log("Written response: " + sequence + " " + action + " " + result);
				connection.write(response, "binary");
			};
		});
	};
	
	Locker.prototype.listen = function() {
		this.server.listen.apply(this.server, arguments);
	};
	
	Locker.prototype.close = function() {
		this.server.close.apply(this.server, arguments);
	};
	
	module.exports = Locker;
})(module);
