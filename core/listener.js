exports.listen = function () {
    var http = require('http').createServer(function (request, response) {
        response.writeHead(200, {'Content-Type': 'text/json'});

        process.setMaxListeners(0);
        process.on('uncaughtException', function (err) {
            response.end(JSON.stringify({status: 500, output: err}));
        });

        var path = require('url').parse(request.url).pathname;
        var input = '';

        request.on('data', function (data) {
            input += data;
        });
        request.on('end', function () {
            input = decodeURI(input);
            input = require('querystring').parse(input);
            filter(path, input, response);
        });
    });

    http.listen(port, function () {
        console.log('App Manager @ 127.0.0.1:' + port);
    });
};

var filter = function (path, input, response) {
    if (path.startsWith('/status')) {
        var status = {};
        status.status = 200;
        status.memory = process.memoryUsage();
        status.cpu = require('os').cpus();

        var user = 0, sys = 0, idle = 0;
        for (var i in status.cpu) {
            user += status.cpu[i].times.user;
            sys += status.cpu[i].times.sys;
            idle += status.cpu[i].times.idle;
        }

        status.usage = {
            memory: status.memory.heapUsed * 100 / status.memory.heapTotal,
            cpu: (user + sys) * 100 / (idle + user + sys)
        };

        response.end(JSON.stringify(status));
        return;
    } else if (path.startsWith('/apps/')) {
        if (!require('fs').existsSync(home + path + '/index.js')) {
            response.end(JSON.stringify({status: 404, output: 'No Application'}));
            return;
        }

        input.$next = function (output, code) {
            response.end(JSON.stringify({status: code ? code : 200, output: output}));
        };

        var app = require(home + path);
        app.run.map(input)();

        return;
    } else if (path.startsWith('/apps')) {
        response.end(JSON.stringify({status: 404, output: 'No Application'}));
        return;
    }

    response.end(JSON.stringify({status: 404, output: 'No Application'}));
};
