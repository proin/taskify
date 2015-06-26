home = __dirname;
port = 5000;
gui_port = 3000;

require(home + '/libs/prototypes.js');

listener = require(home + '/core/listener.js');
ctrl = require(home + '/core/ctrl.js');
web = require(home + '/web.js');

var instance_lists = require('fs').readdirSync(home + '/protected-web/instances');
for (var i in instance_lists)
    ctrl.load(home + '/protected-web/instances/' + instance_lists[i]);

exports.ctrl = ctrl;
exports.port = port;
exports.gui_port = gui_port;
exports.start = function () {
    listener.listen();
    web.listen(gui_port);
};