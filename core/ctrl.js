var uuid = require('uuid');

var RUNNING = 'RUNNING';
var STOP = 'STOP';
var STOP_ACT = 'STOP_ACT';
var ERROR = 'ERROR';
var START = 'START';
var WARNING = 'WARNING';
var SUCCESS = 'SUCCESS';
var FINISH = 'FINISH';

var timestamp = function () {
    return new Date().getTime();
};

var connector = function (app, input, output) {
    var querystring = require('querystring');
    input = querystring.stringify(input);

    var options = {
        host: 'localhost',
        path: '/apps/' + app,
        port: port,
        method: 'POST'
    };

    var request = require('http').request(options, function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            output(JSON.parse(str));
        });
    });
    request.write(input);
    request.end();
};

var manager = function (flows, flow_id, input, object) {
    var logger = object.logger;

    if (object.status == STOP || object.status == STOP_ACT) {
        setTimeout(function () {
            logger(STOP, {flow: flow_id, code: STOP, msg: 'Stopped.'});
        }, 50);
        return;
    }

    var flow = Object.clone(flows[flow_id]);

    var error = function (e) {
        if (!flow || !flow.error || !flow.error.id) {
            if (flow)
                logger(STOP, {flow: flow_id, app: flow.app, code: ERROR, msg: 'ERROR IN ' + flow_id + ': ' + JSON.stringify(e)});
            else
                logger(STOP, {flow: flow_id, code: ERROR, msg: 'ERROR IN ' + flow_id + ': Flow not exists.'});
            return;
        }

        if (object.cache[flow.error.id]) {
            logger(WARNING, {flow: flow_id, app: flow.app, code: WARNING, msg: 'WARNING IN ' + flow_id + ': ' + JSON.stringify(e)});
            manager(flows, flow.error.id, object.cache[flow.error.id].input, object);
        } else {
            logger(STOP, {flow: flow_id, app: flow.app, code: ERROR, msg: 'ERROR IN ' + flow_id + ': ' + JSON.stringify(e)});
        }
    };

    if (!flow) {
        error();
        return;
    }

    var app = flow.app;

    var next = function (result) {
        var stat = result.status;
        var output = result.output;

        if (!flow.next) {
            logger(STOP, {flow: flow_id, code: FINISH, msg: 'Finished.'});
            return;
        }

        var next_flow_id = flow.next.id;
        var next_input = flow.next.input;
        for (var key in next_input) {
            var value = next_input[key];
            try {
                eval('next_input[key]=' + value + ';');
            } catch (e) {
                next_input[key] = value;
            }
        }

        if (stat == 200) {
            delete object.cache[flow_id];
            object.cache[flow_id] = {input: input, output: output};
            logger(RUNNING, {flow: flow_id, app: app, code: SUCCESS, msg: output});
            setTimeout(function () {
                manager(flows, next_flow_id, next_input, object);
            }, 50);
        } else {
            error(output);
        }
    };

    if (!input) {
        error('No Input');
    } else {
        logger(START, {flow: flow_id, app: flow.app, code: START, msg: input});
        setTimeout(function () {
            connector(app, input, next);
        }, 50);
    }
};

var instances = {};

var instance = function (flows, flow_id, input) {
    var object = {};

    object.id = uuid.v4();
    while (instances[object.id])
        object.id = uuid.v4();

    object.LOG_LEN = 100;
    object.status = STOP;

    object.log = [];
    object.cache = {};

    object.flow = {
        id: flow_id,
        data: flows,
        input: input
    };

    object.logger = function (status, val) {
        val.timestamp = timestamp();
        object.log.push(val);
        if (object.log.length > object.LOG_LEN)
            object.log.splice(0, 1);
        if (status == STOP)
            object.status = STOP;
        require('fs').writeFileSync(home + '/protected-web/instances/' + object.id + '.json', JSON.stringify(object));
    };

    object.start = function () {
        if (object.status == STOP) {
            object.status = RUNNING;
            manager(flows, flow_id, input, object);
            return 'Start';
        }
        return 'Already Running';
    };

    object.stop = function () {
        if (object.status != STOP)
            object.status = STOP_ACT;
    };

    object.restart = function (fid) {
        if (object.status == STOP) {
            object.status = RUNNING;
            if (fid) {
                manager(flows, fid, opt.cache[fid].input, object);
            } else {
                if (object.cache[flow_id]) manager(flows, flow_id, object.cache[flow_id].input, object);
                else manager(flows, flow_id, input, object);
            }
            return 'Restart';
        }
        return 'Already Running';
    };

    object.getLog = function (idx) {
        var l = Object.clone(object.log);
        if (idx)
            return l[idx];
        return l;
    };

    object.changeID = function (id) {
        instances[object.id] = null;
        delete instances[object.id];
        object.id = id;
        instances[id] = object;
    };

    instances[object.id] = object;
    return object;
};

var load = function (path) {
    var instanceInfo = JSON.parse(require('fs').readFileSync(path) + '');
    var instance = ctrl.instance(instanceInfo.flow.data, instanceInfo.flow.id, instanceInfo.flow.input);
    instance.changeID(instanceInfo.id);
    for (var key in instanceInfo) instance[key] = instanceInfo[key];
    instance.status = STOP;
};

var del = function (instanceId) {
    delete instances[instanceId];
};

var find = function (instanceId) {
    return instances[instanceId];
};

var all = function () {
    var res = [];
    for (var key in instances)
        res.push(key);
    return res;
};

exports.instance = instance;
exports.find = find;
exports.all = all;
exports.del = del;
exports.load = load;

exports.status = function (callback) {
    var options = {
        host: 'localhost',
        path: '/status',
        port: port,
        method: 'POST'
    };

    var request = require('http').request(options, function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            callback(JSON.parse(str));
        });
    });
    request.write('');
    request.end();
};