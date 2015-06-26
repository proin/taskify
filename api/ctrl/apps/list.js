exports.route = function (req, res) {

    var find = function (path, result) {
        if (!result) result = [];
        var fs = require('fs');
        var dir = fs.readdirSync(path);

        if (fs.lstatSync(path).isDirectory() && fs.existsSync(path + '/index.js')) {
            result.push(path);
        }

        for (var i in dir) {
            var child = path + '/' + dir[i];
            if (fs.lstatSync(child).isDirectory())
                find(child, result);
        }

        return result;
    };

    var lists = find(home + '/apps');

    for (var i in lists) {
        var doc = require(lists[i]).docs;
        lists[i] = {
            name: lists[i].replace(home + '/apps/', ''),
            doc: doc
        };
    }

    res.send(lists);
};