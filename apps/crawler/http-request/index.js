exports.docs = {
    tag: ['crawler', 'parser', 'jquery'],
    inputs: {
        $url: 'target url',
        $method: 'GET/POST',
        $query: 'Query'
    },
    outputs: {
        $html: 'html output'
    }
};

exports.run = function ($url, $method, $query, $next) {
    setTimeout(function () {
        var output = {};
        if (!$url || $url.length == 0) {
            output.$html = '';
            $next('Output Null', 300);
            return;
        }

        var url = require('url').parse($url);
        var protocol = url.protocol ? url.protocol.replace(/:/gim, '') : 'http';
        var host = url.host;
        var port = url.port ? url.port : protocol == 'https' ? 443 : 80;
        var path = url.pathname;
        var method = $method ? $method : 'GET';

        var options = {
            host: host,
            path: method == 'GET' && $query ? path + '?' + require('querystring').stringify($query) : null,
            port: port,
            method: method
        };

        var request = require(protocol).request(options, function (response) {
            var str = ''
            response.on('data', function (chunk) {
                str += chunk;
            });
            response.on('end', function () {
                output.$html = str;
                $next(output);
            });
        });

        if ($query && method == 'POST')
            request.write(require('querystring').stringify($query));
        request.end();
    }, 3000);
};