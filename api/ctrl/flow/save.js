exports.route = function (req, res) {
    var $query = require('url').parse(req.url, true).query;

    var status = {status: 'FAIL'};

    if ($query.id && $query.data) {
        try {
            status.status = 'SUCCESS';
            require('fs').writeFileSync(home + '/protected-web/flow/' + $query.id + '.json', $query.data);
        } catch (e) {
            status.status = 'FAIL';
        }
    }

    res.send(status);
};