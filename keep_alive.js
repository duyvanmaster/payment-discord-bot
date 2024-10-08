const http = require('http');

const server = http.createServer((req, res) => {
    res.write("Online");
    res.end();
});

server.listen(8080);

module.exports = server;