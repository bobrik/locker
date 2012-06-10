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

    Lock.prototype.acquire = function(wait, timeout, callback) {
        var self = this;

        if (self.acquired) {
            return true;
        }

        self.waitTimer = setTimeout(function() {
            if (!self.acquired) {
                self.release();
                callback(new Error("Lock waiting timeout for " + self.getName()));
            }

            clearTimeout(self.waitTimer);
            self.waitTimer = undefined;
        }, wait);

        self.queue = self.manager.getQueue(self.getName());
        self.queue.push(self, function(error) {
            if (self.waitTimer) {
                clearTimeout(self.waitTimer);
                self.waitTimer = undefined;
            } else {
                // already returned
                return;
            }

            if (error) {
                return callback(error);
            }

            self.acquired = true;

            callback(undefined, true);

            self.timeoutTimer = setTimeout(function() {
                if (self.acquired) {
                    self.release();
                }

                clearTimeout(self.timeoutTimer);
                self.timeoutTimer = undefined;
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
