exports.route = function (req, res) {
    var $query = require('url').parse(req.url, true).query;

    var flow = '{}';
    if ($query.flow) {
        try {
            flow = require('fs').readFileSync(home + '/protected-web/flow/' + $query.flow + '.json') + '';
        } catch (e) {
        }
    }

    res.send({name: $query.flow, data: flow});
};