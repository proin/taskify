exports.route = function (req, res) {
    var $query = require('url').parse(req.url, true).query;
    if ($query.flows && $query.app && $query.input && $query.name) {
        var instance = ctrl.instance(JSON.parse($query.flows), $query.app, JSON.parse($query.input));
        instance.info = {flow: $query.name, app: $query.app};

        require('fs').writeFileSync(home + '/protected-web/instances/' + instance.id + '.json', JSON.stringify(instance));
        res.send({id: instance.id});
    } else {
        res.send({id: 'FAIL TO CREATE INSTANCE'});
    }
};