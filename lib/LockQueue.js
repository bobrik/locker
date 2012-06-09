(function(module) {
	function LockQueue(name) {
		this.name  = name;
		this.queue = [];
	};
	
	LockQueue.prototype.getName = function() {
		return this.name;
	};
	
	LockQueue.prototype.push = function(lock, callback) {
		if (lock.getName() != this.getName()) {
			return callback(new Error("Incorrect lock name " + lock.getName() + " for queue " + this.getName()));
		}
		
		this.queue.push({
			lock     : lock,
			callback : callback
		});
		
		//console.log("queue length: " + this.queue.length);
	
		if (this.queue.length == 1) {
			callback(undefined, true);
		}
	};
	
	LockQueue.prototype.pop = function(lock) {
		//console.log("POP FROM QUEUE!")
		
		var first = this.queue[0];
		if (first && first.lock == lock) {
			this.queue.shift();
	
			// take next lock to acquire
			first = this.queue[0];
			
			if (first && first.callback) {
				first.callback(undefined, true);
			}
		} else {
			this.queue = this.queue.filter(function(current) {
				return current.lock != lock;
			});
		}
	};
	
	module.exports = LockQueue;
})(module);
