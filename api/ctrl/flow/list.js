exports.route = function (req, res) {
    var lists = require('fs').readdirSync(home + '/protected-web/flow');

    for (var i in lists)
        lists[i] = lists[i].replace(/.json/gim, '');

    res.send(lists);
};