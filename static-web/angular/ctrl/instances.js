controller.controller('instances', ['$scope', '$routeParams',
    function ($scope, $routeParams) {
        page = 'instances';

        $scope.showCreate = function () {
            $scope.instance = {
                input: {}
            };

            $.get("/api/ctrl/apps/list", function (apps) {
                $scope.apps = apps;
                $.get("/api/ctrl/flow/list", function (data) {
                    $scope.flows = data;
                    $scope.$apply();
                    $('#modal-create').openModal();

                    var loadFlow = function (val) {
                        $scope.instance.flow = val;
                        $.get("/api/ctrl/flow/get?flow=" + val, function (data) {
                            $scope.instance.flowdata = data.data;
                            var modules = JSON.parse(data.data);
                            showGraph(modules, true);
                            $scope.$apply();
                        });
                    };

                    var showGraph = function (data, success, error) {
                        var nodes = [];
                        var edges = [];
                        for (var key in data) {
                            nodes.push({id: key, label: key, shape: 'box', color: {background: '#fff', border: '#26a69a'}});
                            if (data[key].next && data[key].next.id && success) {
                                var linelabel = '';
                                for (var k in data[key].next.input)
                                    linelabel += k + '; ';
                                edges.push({from: key, to: data[key].next.id, arrows: 'to', color: {color: '#26a69a'}, label: linelabel, font: {align: 'horizontal'}});
                            }
                            if (data[key].error && data[key].error.id && error) {
                                edges.push({from: key, to: data[key].error.id, arrows: 'to', color: {color: 'red'}});
                            }
                        }

                        nodes = new vis.DataSet(nodes);
                        edges = new vis.DataSet(edges);

                        var container = document.getElementById('instance-create-network');
                        var nData = {
                            nodes: nodes,
                            edges: edges
                        };
                        var options = {};
                        var network = new vis.Network(container, nData, options);

                        network.on('click', function (params) {
                            $scope.instance.app = params.nodes[0];
                            var tapp = data[params.nodes[0]].app;
                            var doc = {};
                            for (var i in $scope.apps) {
                                if ($scope.apps[i].name == tapp)
                                    doc = $scope.apps[i].doc;
                            }
                            $scope.inputs = [];
                            for (var key in doc.inputs)
                                $scope.inputs.push({key: key, value: doc.inputs[key]});

                            $scope.$apply();
                        });
                    };

                    if ($scope.flows && $scope.flows[0])
                        loadFlow($scope.flows[0]);

                    $('#instance-create-flow').unbind('change');
                    $('#instance-create-flow').change(function () {
                        loadFlow($('#instance-create-flow option:selected').val());
                    });
                });
            });
        };

        $scope.list = [];
        $scope.active = {};
        $scope.panel = 'visibility: hidden;';

        var list = function () {
            $.get("/api/ctrl/instance/list", function (data) {
                $scope.list = data;

                for (var i in $scope.list)
                    $scope.list[i].statuscolor = ($scope.list[i].status == 'RUNNING' ? 'teal' : 'orange');

                if (!$routeParams.id && $scope.list.length > 0)
                    location.href = '/#/instances/' + $scope.list[0].id;

                if (!$routeParams.id) {
                    $scope.$apply();
                    return;
                }

                var id = $routeParams.id;

                $scope.panel = 'visibility: visible;';

                $scope.active = {};
                $scope.active[id] = 'active';
                $scope.selected;
                for (var i in $scope.list)
                    if ($scope.list[i].id == id)
                        $scope.selected = $scope.list[i];
                $scope.selected.id = id;
                $scope.$apply();
            });
        };

        list();

        $scope.create = function () {
            if ($scope.instance.flowdata && $scope.instance.app) {
                var q = '?flows=' + encodeURI($scope.instance.flowdata);
                q += '&app=' + encodeURI($scope.instance.app);
                q += '&input=' + encodeURI(JSON.stringify($scope.instance.input));
                q += '&name=' + $scope.instance.flow;
                $.get("/api/ctrl/instance/create" + q, function (data) {
                    Materialize.toast(data.id, 2000, 'rounded');
                    list();
                });
            }
        };

        if (!$routeParams.id) return;
        var id = $routeParams.id;
        page = 'instances/' + id;

        $scope.start = function (id) {
            if (!id) return;
            $.get("/api/ctrl/instance/start?id=" + id, function (data) {
                Materialize.toast(data.status, 3000, 'rounded');
            });
        };

        $scope.restart = function (id) {
            if (!id) return;
            $.get("/api/ctrl/instance/restart?id=" + id, function (data) {
                Materialize.toast(data.status, 3000, 'rounded');
            });
        };

        $scope.stop = function (id) {
            if (!id) return;
            $.get("/api/ctrl/instance/stop?id=" + id, function (data) {
                Materialize.toast(data.status, 3000, 'rounded');
            });
        };

        var logger = function () {
            if (page == 'instances/' + id)
                setTimeout(function () {
                    $.get("/api/ctrl/instance/log?id=" + id, function (data) {
                        if (data && data.logs && data.logs.length > 0) {
                            for (var i in data.logs) {
                                data.logs[i].idx = i * 1 + 1;
                                data.logs[i].codecolor = '';
                                if (data.logs[i].code == 'WARNING')
                                    data.logs[i].codecolor = 'lime lighten-3';
                                else if (data.logs[i].code == 'STOP' || data.logs[i].code == 'ERROR')
                                    data.logs[i].codecolor = 'red lighten-3';
                            }

                            data.logs.sort(function (a, b) {
                                return b.timestamp - a.timestamp;
                            });
                            $scope.logs = data.logs;

                            $scope.selected.info.app = $scope.logs[0].flow;
                        }

                        $scope.status = data.status;
                        if ($scope.status == 'STOP')
                            $scope.statuscolor = 'red';
                        else if ($scope.status == 'RUNNING')
                            $scope.statuscolor = 'teal';
                        else {
                            $scope.status = 'STOPPING';
                            $scope.statuscolor = 'orange';
                        }

                        $scope.$apply();
                        logger();
                    });
                }, 500);
        };

        logger();

        $scope.loginfo = function (log) {
            $scope.log = log;
            $('#modal-log').openModal();
            $scope.$apply();
        };

        $scope.delete = function (id) {
            $.get("/api/ctrl/instance/delete?id=" + id, function (data) {
                location.href = '/#/instances';
            });
        };

    }
]);