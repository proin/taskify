exports.route = function (req, res) {
    var $query = require('url').parse(req.url, true).query;

    var status = {status: 'FAIL'};
    if ($query.flow) {
        try {
            if (require('fs').existsSync(home + '/protected-web/flow/' + $query.flow + '.json')) {
                require('fs').unlinkSync(home + '/protected-web/flow/' + $query.flow + '.json');
                status.status = 'SUCCESS';
            }
        } catch (e) {
            status.status = 'FAIL';
        }
    }

    res.send(status);
};