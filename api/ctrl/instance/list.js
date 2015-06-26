exports.route = function (req, res) {
    var result = Object.clone(ctrl.all());
    for (var i in result) {
        var finded = ctrl.find(result[i]);
        result[i] = {id: result[i], status: finded.status, info: finded.info};
    }
    res.send(result);
};