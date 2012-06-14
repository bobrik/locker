(function(module) {
    var Lock = require("./Lock");

    function LockQueue(name) {
        var self = this;

        self.name  = name;
        self.queue = [];

        self.__defineGetter__("length", function() {
            return self.queue.length;
        });
    };

    LockQueue.prototype.getName = function() {
        return this.name;
    };

    LockQueue.prototype.push = function(lock, callback) {
        if (!(lock instanceof Lock)) {
            return callback(new Error("Not a lock passed"));
        }

        if (!lock.isWaiting()) {
            return callback(new Error("Only waiting locks can be accepted!"));
        }

        if (lock.getName() != this.getName()) {
            return callback(new Error("Incorrect lock name " + lock.getName() + " for queue " + this.getName()));
        }

        this.queue.push({
            lock     : lock,
            callback : callback
        });

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
