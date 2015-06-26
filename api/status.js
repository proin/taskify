exports.route = function (req, res) {
    var ctrl = actionflow.ctrl;
    ctrl.status(function (data) {
        res.send(data);
    });
};