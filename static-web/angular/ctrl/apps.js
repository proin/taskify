controller.controller('apps', ['$scope', '$routeParams',
    function ($scope, $routeParams) {
        page = 'apps';

        var list = function () {
            $.get("/api/ctrl/apps/list", function (data) {
                $scope.list = data;
                for (var i in data) {
                    data[i].doc.inputs = JSON.stringify(data[i].doc.inputs, null, 2);
                    data[i].doc.outputs = JSON.stringify(data[i].doc.outputs, null, 2);
                }
                $scope.$apply();
            });
        };

        list();
    }
]);