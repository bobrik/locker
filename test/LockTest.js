(function() {
    var assert           = require("assert"),
        Lock             = require("../lib/Lock"),
        LockQueueManager = require("../lib/LockQueueManager");

    suite("Lock", function() {
        suite("new Lock()", function() {
            test("new Lock() should only accept LockQueueManager as manager argument", function(done) {
                try {
                    new Lock("pew", {});
                } catch (error) {
                    return done();
                }

                done(new Error("Invalid manager accepted"));
            });
        });

        suite("Lock::getName", function() {
            test("Lock::getName should return name that was passed to the constructor", function(done) {
                var lock = new Lock("pew", new LockQueueManager());

                assert.equal("pew", lock.getName());

                done();
            });
        });
    });
})();
