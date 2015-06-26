controller.controller('main', ['$scope',
    function ($scope) {
        page = 'main';

        $.get("/api/status", function (data) {
            $scope.status = JSON.stringify(data, null, 4);
            $scope.$apply();
        });
    }
]);