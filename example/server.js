(function() {
	var Locker = require("./index"),
		locker = new Locker();
	
	
	locker.listen(4545);
	
	
	// return;
	// 
	// var net = require("net");
	// 
	// var counter = 0,
	// 	time    = new Date().getTime();
	// 
	// function Lock(name, manager) {
	// 	this.name         = name;
	// 	this.acquired     = false;
	// 	this.manager      = manager;
	// 	this.waitTimer    = undefined;
	// 	this.timeoutTimer = undefined;
	// };
	// 
	// Lock.prototype.getName = function() {
	// 	return this.name;
	// };
	// 
	// Lock.prototype.isAcquired = function() {
	// 	return this.acquired;
	// };
	// 
	// Lock.prototype.acquire = function(wait, timeout, callback) {
	// 	var self = this;
	// 	
	// 	if (self.acquired) {
	// 		return true;
	// 	}
	// 	
	// 	self.waitTimer = setTimeout(function() {
	// 		//console.log("TWO");
	// 		if (!self.acquired) {
	// 			self.release();
	// 			callback(new Error("Lock waiting timeout for " + self.getName()));
	// 		}
	// 	}, wait);
	// 	
	// 	self.queue = self.manager.getQueue(self.getName());
	// 	self.queue.push(self, function(error) {
	// 		//console.log("ONE");
	// 		if (self.waitTimer) {
	// 			clearTimeout(self.waitTimer);
	// 			self.waitTimer = undefined;
	// 		}
	// 		
	// 		if (error) {
	// 			return callback(error);
	// 		}
	// 		
	// 		self.acquired = true;
	// 		
	// 		callback(undefined, true);
	// 		
	// 		self.timeoutTimer = setTimeout(function() {
	// 			//console.log("releasing");
	// 			//console.log(self.acquired);
	// 			if (self.acquired) {
	// 				//console.log("really releasing");
	// 				self.release();
	// 			}
	// 		}, timeout);
	// 	});
	// 	
	// 	return false;
	// };
	// 
	// Lock.prototype.release = function() {
	// 	var result = this.acquired;
	// 
	// 	if (this.waitTimer) {
	// 		clearTimeout(this.waitTimer);
	// 		this.waitTimer = undefined;
	// 	}
	// 	
	// 	if (this.timeoutTimer) {
	// 		clearTimeout(this.timeoutTimer);
	// 		this.timeoutTimer = undefined;
	// 	}
	// 	
	// 	this.queue.pop(this);
	// 	this.acquired = false;
	// 	
	// 	return result;
	// };
	// 
	// function LockQueueManager() {
	// 	this.queues   = {};
	// 	this.registry = {};
	// };
	// 
	// LockQueueManager.prototype.getQueue = function(name) {
	// 	if (!this.queues[name]) {
	// 		this.queues[name] = new LockQueue(name);
	// 	}
	// 	
	// 	// need to release some queues that is empty
	// 	
	// 	return this.queues[name];
	// };
	// 
	// function LockQueue(name) {
	// 	this.name  = name;
	// 	this.queue = [];
	// };
	// 
	// LockQueue.prototype.getName = function() {
	// 	return this.name;
	// };
	// 
	// LockQueue.prototype.push = function(lock, callback) {
	// 	if (lock.getName() != this.getName()) {
	// 		return callback(new Error("Incorrect lock name " + lock.getName() + " for queue " + this.getName()));
	// 	}
	// 	
	// 	this.queue.push({
	// 		lock     : lock,
	// 		callback : callback
	// 	});
	// 	
	// 	//console.log("queue length: " + this.queue.length);
	// 
	// 	if (this.queue.length == 1) {
	// 		callback(undefined, true);
	// 	}
	// };
	// 
	// LockQueue.prototype.pop = function(lock) {
	// 	//console.log("POP FROM QUEUE!")
	// 	
	// 	var first = this.queue[0];
	// 	if (first && first.lock == lock) {
	// 		this.queue.shift();
	// 
	// 		// take next lock to acquire
	// 		first = this.queue[0];
	// 		
	// 		if (first && first.callback) {
	// 			first.callback(undefined, true);
	// 		}
	// 	} else {
	// 		this.queue = this.queue.filter(function(current) {
	// 			return current.lock != lock;
	// 		});
	// 	}
	// };
	// 
	// function releaseLocks(locksRegistry) {
	// 	Object.keys(locksRegistry).forEach(function(key) {
	// 		locksRegistry[key].release();
	// 	});
	// };
	// 
	// var manager = new LockQueueManager();
	// 
	// net.createServer(function(connection) {
	// 	var locksRegistry   = {},
	// 		currentSequence = 0,
	// 		data            = new Buffer(0),
	// 		temp            = new Buffer(0);
	// 
	// 	connection.on("error", function(error) {
	// 		//console.log(error);
	// 		connection.end();
	// 		releaseLocks(locksRegistry);
	// 	});
	// 
	// 	connection.on("end", function() {
	// 		releaseLocks(locksRegistry);
	// 	});
	// 	
	// 	connection.on("timeout", function() {
	// 		releaseLocks(locksRegistry);
	// 	});
	// 	
	// 	connection.on("connect", function() {
	// 		//console.log("got connection");
	// 	});
	// 	
	// 	connection.on("data", function(part) {
	// 		var sequence = 0,
	// 			wait     = 0,
	// 			timeout  = 0,
	// 			action   = 0,
	// 			name;
	// 
	// 		temp = new Buffer(data.length + part.length);
	// 		data.copy(temp, 0);
	// 		part.copy(temp, data.length);
	// 		
	// 		data = new Buffer(temp)
	// 		
	// 		while (data.length && ((data[0] + 14) <= data.length)) {
	// 			sequence = data.readUInt32LE(1);
	// 			action   = data[13];
	// 
	// 			if ((currentSequence < sequence && action == 1) || action == 0) {
	// 				currentSequence = sequence;
	// 				
	// 				length   = data[0];
	// 				wait     = data.readUInt32LE(5);
	// 				timeout  = data.readUInt32LE(9);
	// 				name     = data.slice(14, length + 14).toString();
	// 				
	// 				//console.log([length, wait, timeout, action, name]);
	// 				
	// 				if (action == 1) {
	// 					lock(name, sequence, wait, timeout);
	// 				} else if (action == 0) {
	// 					unlock(sequence);
	// 				}
	// 
	// 				data = data.slice(length + 14);
	// 				
	// 				//console.log("data after all")
	// 			} else {
	// 				//console.log("SHIT!");
	// 				connection.end();
	// 				break;
	// 			}
	// 		}
	// 	});
	// 	
	// 	function lock(name, sequence, wait, timeout) {
	// 		var lock = new Lock(name, manager);
	// 
	// 		locksRegistry[sequence] = lock;
	// 		
	// 		lock.acquire(wait, timeout, function(error) {
	// 			respond(sequence, 1, error ? 0 : 1);
	// 		});
	// 	};
	// 	
	// 	function unlock(sequence) {
	// 		var lock = locksRegistry[sequence];
	// 		
	// 		if (lock) {
	// 			delete locksRegistry[sequence];
	// 		}
	// 		
	// 		respond(sequence, 0, lock && lock.release());
	// 	};
	// 	
	// 	function respond(sequence, action, result) {
	// 		var response = new Buffer(6);
	// 
	// 		response.writeUInt32LE(sequence, 0);
	// 		response[4] = action;
	// 		response[5] = result ? 1 : 0;
	// 		
	// 		//console.log("Written response: " + sequence + " " + action + " " + result);
	// 		connection.write(response, "binary");
	// 		
	// 		counter++;
	// 	}
	// }).listen(4545);
	// 
	// setInterval(function() {
	// 	var now = new Date().getTime();
	// 	console.log(Math.round(process.memoryUsage().rss / 1024) + " | " + Math.round(1000 * counter / (now - time)) + "rps");
	// 	time = now;
	// 	counter = 0;
	// }, 5000);
	
	//console.log("lock server is ready");
})();
