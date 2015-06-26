String.prototype.startsWith = function (suffix) {
    return !(this.indexOf(suffix) !== 0);
};

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

Function.prototype.getParamNames = function () {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    var fnStr = this.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
};

Function.prototype.map = function (map) {
    var params = this.getParamNames();
    var fn = this;
    for (var i in params)
        fn = fn.bind({}, map[params[i]]);
    return fn;
};

Object.clone = function (obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    var temp = obj.constructor();
    for (var key in obj) {
        temp[key] = Object.clone(obj[key]);
    }

    return temp;
};