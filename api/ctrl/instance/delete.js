exports.route = function (req, res) {
    var $query = require('url').parse(req.url, true).query;

    var result = {};
    result.status = 'ID NOT EXISTS';
    if ($query.id) {
        ctrl.del($query.id);
        if (require('fs').existsSync(home + '/protected-web/instances/' + $query.id + '.json'))
            require('fs').unlinkSync(home + '/protected-web/instances/' + $query.id + '.json');
    }
    res.send(result);
};