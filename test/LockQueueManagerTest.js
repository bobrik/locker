(function() {
    var assert           = require("assert"),
        LockQueueManager = require("../lib/LockQueueManager"),
        LockQueue        = require("../lib/LockQueue");

    suite("LockQueueManager", function() {
        suite("new LockQueueManager()", function() {
            test("Every created LockQueueManager provide own queues cache", function(done) {
                var one = new LockQueueManager().getQueue("pewpew"),
                    two = new LockQueueManager().getQueue("pewpew");

                assert.notEqual(one, two);
                done();
            });
        });

        suite("LockQueueManager::getQueue", function() {
            var manager = new LockQueueManager();

            test("LockQueueManager::getQueue provide LockQueue objects", function(done) {
                assert.ok(manager.getQueue("pew") instanceof LockQueue);
                done();
            });

            test("LockQueueManager::getQueue provide the same object for two sequence requests with the same name", function(done) {
                assert.equal(manager.getQueue("pewpew"), manager.getQueue("pewpew"));
                done();
            });

            test("LockQueueManager::getQueue provide different objects for two sequence requests with different names", function(done) {
                assert.notEqual(manager.getQueue("one"), manager.getQueue("two"));
                done();
            });

            test("LockQueueManager::getQueue provide queue with the name that was passed", function(done) {
                assert.equal("karamba!", manager.getQueue("karamba!").getName());
                done();
            })
        });
    });
})();
