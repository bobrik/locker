(function() {
    var net       = require("net"),
        startTime = new Date().getTime(),
        count     = 1000;

    var client = net.createConnection(4545, "127.0.0.1", function() {
        var sequence = 0;

        client.on("data", function(data) {
            if (data.readUInt32LE(data.length - 6) == count && data[data.length - 2] == 0) {
                var total = new Date().getTime() - startTime;
                console.log("Completed in " + total + "ms (" + (count / total * 1000) + " locks per second" + ")");
                client.end();
            }
        });

        function createRequest(name) {
            var request = new Buffer(1 + 4 + 4 + 4 + 1 + name.length),
                name    = new Buffer(name);

            request[0] = name.length;
            request.writeUInt32LE(++sequence, 1);
            request.writeUInt32LE(2000, 5); // wait time
            request.writeUInt32LE(3000, 9); // max lock time
            request[13] = 1;

            name.copy(request, 14);

            return request;
        }

        function writeSome() {
            for (var i = 0; i < count; i++) {
                (function() {
                    var request = createRequest("five:" + 1);

                    // lock
                    client.write(request, "binary");

                    // unlock
                    setTimeout(function() {
                        request = new Buffer(request);
                        request[13] = 0;
                        client.write(request, "binary");
                    }, 20);
                })();
            }
        }

        writeSome();
    });
})();
