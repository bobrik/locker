locker - lock server written in node.js
===========================

This is lock server for system that need to share and lock common resources across servers with sub-second precision.

It allows to set wait timeout for lock and max execution time to limit your desire for eternal locking.

## Clients

### node.js

[Client for node.js](https://github.com/bobrik/node-locker) is completely async.

Example

```javascript
var Locker = require("locker"),
    locker = new Locker(4545, "127.0.0.1");

locker.on("reset", function() {
    console.log("Reset happened (is server running?)");
});

locker.on("error", function(error) {
    console.log("Catched error:", error);
});

//            name    wait  max   callback
locker.locked("five", 2000, 3000, function(error, callback) {
    if (error) {
        // lock failed
        callback(error);
        return;
    }

    // do whatever you want with your shared resource
    
    callback(undefined, {well: "done"});
});
```

## Running

First create a dir for locker:

```
mkdir locker
cd locker
mkdir node_modules
npm install locker-server
```

Then create main server file (look at `example/server.js`) and save it as `server.js`:

```javascript
(function() {
    var Locker = require("locker-server"),
        locker = new Locker();

    locker.listen(4545);
})();
```

Run it after all:

```
node server.js
```

## Capacity

More performance tests to be done, but for now on my MacBook Air (Intel i5):

```
Clients count: 5
Different locks to request: 10000
Total locks to request: 50000
Lock work time: 1ms

Server CPU usage: 100%
Server RSS memory: 70-80M (no growth after 5M requests)
Responses per second: 15000-17000 (measuring every 5 seconds)
```

If you want more, shard your locks.