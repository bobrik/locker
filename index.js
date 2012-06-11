(function(module) {
    var net              = require("net"),
        Lock             = require("./lib/Lock"),
        LockQueueManager = require("./lib/LockQueueManager"),
        LockAction       = require("./lib/LockAction");

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
                connection.end();
                releaseLocks(locksRegistry);
            });

            connection.on("end", function() {
                releaseLocks(locksRegistry);
            });

            connection.on("timeout", function() {
                releaseLocks(locksRegistry);
            });

            connection.on("data", function(part) {
                var sequence,
                    wait,
                    timeout,
                    action,
                    length,
                    name;

                temp = new Buffer(data.length + part.length);
                data.copy(temp, 0);
                part.copy(temp, data.length);

                data = new Buffer(temp);

                while (data.length && ((data[0] + 14) <= data.length)) {
                    length   = data[0];
                    sequence = data.readUInt32LE(1);
                    wait     = data.readUInt32LE(5);
                    timeout  = data.readUInt32LE(9);
                    action   = data[13];
                    name     = data.slice(14, length + 14).toString();

                    currentSequence = sequence;

                    if (action == LockAction.ACTION_LOCK) {
                        lock(name, sequence, wait, timeout);
                    } else if (action == LockAction.ACTION_UNLOCK) {
                        unlock(sequence);
                    }

                    data = data.slice(length + 14);
                }
            });

            function lock(name, sequence, wait, timeout) {
                var lock = new Lock(name, manager);

                locksRegistry[sequence] = lock;

                lock.acquire(wait, timeout, function(error) {
                    respond(sequence, LockAction.ACTION_LOCK, error ? 0 : 1);
                });
            };

            function unlock(sequence) {
                var lock = locksRegistry[sequence];

                if (lock) {
                    delete locksRegistry[sequence];
                }

                respond(sequence, LockAction.ACTION_UNLOCK, lock && lock.release());
            };

            function respond(sequence, action, result) {
                var response = new Buffer(6);

                response.writeUInt32LE(sequence, 0);
                response[4] = action;
                response[5] = result ? 1 : 0;

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
