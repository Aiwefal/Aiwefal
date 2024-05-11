let fs = require('fs'),
    path = require('path'),
    publicRoot = path.join(__dirname, "../../../public"),
    mimeSet = {
        "js": "application/javascript",
        "json": "application/json",
        "css": "text/css",
        "html": "text/html",
        "md": "text/markdown",
        "png": "image/png",
        "ico": "image/x-icon"
    },
    // If someone tries to get a file that does not exist, send them this instead.
    DEFAULT_FILE = 'index.html',
    server,
    wsServer = new (require('ws').WebSocketServer)({ noServer: true });

if (c.host === 'localhost') {
    util.warn(`config.host is just "localhost", are you sure you don't mean "localhost:${c.port}"?`);
}
if (c.host.match(/localhost:(\d)/) && c.host !== 'localhost:' + c.port) {
    util.warn('config.host is a localhost domain but its port is different to config.port!');
}

server = require('http').createServer((req, res) => {
    let resStr = "";

    switch (req.url) {
        case "/lib/json/mockups.json":
            resStr = mockupJsonData;
            break;
        case "/serverData.json":
            resStr = JSON.stringify({
                ip: c.host,
                gameMode: c.gameModeName,
                players: views.length,
                closed: arenaClosed,
                location: c.LOCATION,
                hidden: c.HIDDEN,
            });
            break;
        default:
            if (c.COMBINED) {
                let fileToGet = path.join(publicRoot, req.url);

                if (!fs.existsSync(fileToGet)) {
                    fileToGet = path.join(publicRoot, DEFAULT_FILE);
                } else if (!fs.lstatSync(fileToGet).isFile()) {
                    fileToGet = path.join(publicRoot, DEFAULT_FILE);
                }

                //return the file
                res.writeHead(200, { 'Content-Type': mimeSet[ fileToGet.split('.').pop() ] || 'text/html' });
                return fs.createReadStream(fileToGet).pipe(res);
            }
    }

    if (req.url == '/serverData.json' || req.url == '/lib/json/mockups.json') {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.writeHead(200);
    res.end(resStr);
});

server.on('upgrade', (req, socket, head) => wsServer.handleUpgrade(req, socket, head, ws => sockets.connect(ws, req)));
server.listen(c.port, () => console.log("Server listening on port", c.port));

module.exports = { server };
