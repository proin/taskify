exports.route = function (req, res) {
    var $query = require('url').parse(req.url, true).query;

    var result = {};
    result.status = 'ID NOT EXISTS';
    if ($query.id) {
        var instance = ctrl.find($query.id);
        result.status = instance.start();
    }
    res.send(result);
};