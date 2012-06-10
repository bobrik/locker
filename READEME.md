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
    var Locker = require("../index"),
        locker = new Locker();

    locker.listen(4545);
})();
```

Run it after all:

```
node server.js
```