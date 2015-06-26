exports.docs = {
    tag: ['crawler', 'parser', 'jquery'],
    inputs: {
        $html: 'Web Source',
        $script: 'Process Script'
    },
    outputs: 'next(data)'
};

exports.run = function ($html, $script, $next) {
    setTimeout(function () {
        if ($html && $html.length > 0) {
            var $ = require('./jquery.js')(require("jsdom").jsdom($html).parentWindow);
            eval("__innerScript = function($, next) { " + $script + " };");
            __innerScript.map({$: $, next: $next})();
            return;
        }
        $next("Input Null", 300);
    }, 3000);
};