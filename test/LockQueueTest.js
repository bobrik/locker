(function() {
    var assert    = require("assert"),
        LockQueue = require("../lib/LockQueue"),
        Lock      = require("../lib/Lock"),
        queueName = "pewpewpew";

    suite("LockQueue", function() {
        function makeLockWaiting(lock) {
            lock.isWaiting = function() {
                return true;
            }

            return lock;
        }

        suite("LockQueue::push", function() {
            var queue = new LockQueue(queueName);

            test("LockQueue::push should only accept instances of Lock", function(done) {
                queue.push(queue, function(error) {
                    assert.ok(error);
                    done();
                });
            });

            test("LockQueue::push should not accept not waiting locks", function(done) {
                var badLock = new LockQueue(queueName);

                queue.push(badLock, function(error) {
                    assert.ok(error);
                    done();
                });
            });

            test("LockQueue::push should only accept locks with the same name", function(done) {
                var badLock = makeLockWaiting(new LockQueue(queueName + queueName));

                queue.push(badLock, function(error) {
                    assert.ok(error);
                    done();
                });
            });
        });

        suite("LockQueue::length", function() {
            var queue = new LockQueue(queueName);

            test("LockQueue length getter is zero with empty queue", function(done) {
                assert.equal(queue.length, 0);
                done();
            });

            test("LockQueue size should be 1 after lock adding", function(done) {
                var lock = makeLockWaiting(new Lock(queue.getName()));

                queue.push(lock, function(error) {
                    assert.ok(!error);
                    assert.equal(queue.length, 1);
                    done();
                });
            });
        });

        suite("Lock::getName", function() {
            test("Lock::name should return name that was passed to the constructor", function(done) {
                var queue = new LockQueue(queueName);

                assert.equal(queue.getName(), queueName);

                done();
            });
        });
    });
})();
