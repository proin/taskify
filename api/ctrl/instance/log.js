exports.route = function (req, res) {
    var $query = require('url').parse(req.url, true).query;

    var result = {};
    result.status = 'NULL';
    if ($query.id) {
        var instance = ctrl.find($query.id);
        if(instance) {
            result.status = instance.status;
            result.logs = instance.getLog();
        }
    }
    res.send(result);
};