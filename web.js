exports.listen = function (port) {
    var loadAPI = function () {
        var api = findJS('api');
        for (var i in api) {
            if (require('./' + api[i]).route) {
                var api_path = '/' + api[i];
                api_path = api_path.replace(/.js/gim, '');
                app.route(api_path).get(require('./' + api[i]).route);
            }
        }
    };

    var findJS = function (path, result) {
        if (!result) result = [];
        var fs = require('fs');
        var dir = fs.readdirSync(path);

        for (var i in dir) {
            var child = path + '/' + dir[i];
            if (fs.lstatSync(child).isDirectory()) {
                findJS(child, result);
            } else {
                if (require('mime').lookup(child).toLowerCase().indexOf('javascript') > -1)
                    result.push(child);
            }
        }

        return result;
    };

    var express = require('express');
    var app = express();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    // Express
    app.use('/angular', express.static('static-web/angular'));
    app.use('/libs', express.static('static-web/libs'));
    app.use('/templates', express.static('static-web/templates'));

    app.get('/', function (req, res) {
        res.sendfile('static-web/index.html');
    });

    loadAPI();

    // Socket I/O
    io.on('connection', function (socket) {
        socket.on('chat/message', function (msg) {
            console.log('message: ' + msg);
        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });

    http.listen(port, function () {
        console.log('Web Console @ 127.0.0.1:' + port);
    });
};