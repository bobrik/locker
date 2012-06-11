locker - lock server written in node.js
===========================

This is lock server for system that need to share and lock common resources across servers with sub-second precision.

## Features

* Lock timeouts with millisecond precision:
    * Timeout to wait for getting lock.
    * Timeout to keep lock before releae.
* No polling: one request to acquire, one request to release.
* Auto-releasing locks on disconnect.
* Pure node.js. Just awesome.

## Clients

### node.js

[Client for node.js](https://github.com/bobrik/node-locker) is completely async.

Example:

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

### PHP

[Client for php](https://github.com/bobrik/php-locker).

Example:

```php
require_once('Locker.php');

$Locker = new \Locker\Locker("127.0.0.1", 4545);

// Lock creation
$LockOne = $Locker->createLock('example');

// getting lock
$LockOne->acquire(200, 10000);
// doing very important stuff
echo 'Waiting for 5 seconds..'."\n";
sleep(5);
// releasing lock
$LockOne->release();
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