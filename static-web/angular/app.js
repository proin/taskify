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

var app = angular.module('actionflow', [
    'ngRoute',
    'ctrl'
]);

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/main', {
                templateUrl: 'templates/main.html',
                controller: 'main'
            }).
            when('/apps', {
                templateUrl: 'templates/apps.html',
                controller: 'apps'
            }).
            when('/flows', {
                templateUrl: 'templates/flows.html',
                controller: 'flows'
            }).
            when('/flows/:id', {
                templateUrl: 'templates/flows.html',
                controller: 'flows'
            }).
            when('/instances', {
                templateUrl: 'templates/instances.html',
                controller: 'instances'
            }).
            when('/instances/:id', {
                templateUrl: 'templates/instances.html',
                controller: 'instances'
            }).
            otherwise({
                redirectTo: '/main'
            });
    }]);