
var connect = require("connect");

connect().
    use(connect.static("../")).
    listen(process.argv[2] || 3000);
