(function(module) {
    function Lock(name, manager) {
        this.name         = name;
        this.acquired     = false;
        this.manager      = manager;
        this.waitTimer    = undefined;
        this.timeoutTimer = undefined;
    };

    Lock.prototype.getName = function() {
        return this.name;
    };

    Lock.prototype.isAcquired = function() {
        return this.acquired;
    };

    Lock.prototype.acquire = function(wait, timeout, callback) {
        var self = this;

        if (self.acquired) {
            return true;
        }

        self.waitTimer = setTimeout(function() {
            //console.log("TWO");
            if (!self.acquired) {
                self.release();
                callback(new Error("Lock waiting timeout for " + self.getName()));
            }
        }, wait);

        self.queue = self.manager.getQueue(self.getName());
        self.queue.push(self, function(error) {
            //console.log("ONE");
            if (self.waitTimer) {
                clearTimeout(self.waitTimer);
                self.waitTimer = undefined;
            }

            if (error) {
                return callback(error);
            }

            self.acquired = true;

            callback(undefined, true);

            self.timeoutTimer = setTimeout(function() {
                //console.log("releasing");
                //console.log(self.acquired);
                if (self.acquired) {
                    //console.log("really releasing");
                    self.release();
                }
            }, timeout);
        });

        return false;
    };

    Lock.prototype.release = function() {
        var result = this.acquired;

        if (this.waitTimer) {
            clearTimeout(this.waitTimer);
            this.waitTimer = undefined;
        }

        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }

        this.queue.pop(this);
        this.acquired = false;

        return result;
    };

    module.exports = Lock;
})(module);
