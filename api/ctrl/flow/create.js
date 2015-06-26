exports.route = function (req, res) {
    var $query = require('url').parse(req.url, true).query;

    var status = {status: 'FAIL'};

    if ($query.flow && $query.data) {
        try {
            if (!require('fs').existsSync(home + '/protected-web/flow/' + $query.flow + '.json')) {
                status.status = 'SUCCESS';
                require('fs').writeFileSync(home + '/protected-web/flow/' + $query.flow + '.json', $query.data);
            }
        } catch (e) {
            status.status = 'FAIL';
        }
    }

    res.send(status);
};