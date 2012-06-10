(function() {
    var Locker = require("../index"),
        locker = new Locker();

    locker.listen(4545);
})();
