controller.controller('flows', ['$scope', '$routeParams',
    function ($scope, $routeParams) {
        page = 'flows';

        $scope.list = [];
        $scope.dash = {deleteVisible: 'none'};

        var list = function () {
            $.get("/api/ctrl/flow/list", function (data) {
                $scope.list = data;

                if (!$routeParams.id && $scope.list.length > 0)
                    location.href = '/#/flows/' + $scope.list[0];

                $scope.$apply();
            });
        };

        list();

        $scope.flow = {};
        $scope.flow.create = function () {
            if ($scope.flow.createname)
                $.get("/api/ctrl/flow/create?flow=" + $scope.flow.createname + '&data={}', function (data) {
                    if (data.status == 'SUCCESS') {
                        Materialize.toast('"' + $scope.flow.createname + '" is created.', 3000, 'green rounded');
                        delete $scope.flow.createname;
                        list();
                    } else {
                        Materialize.toast('"' + $scope.flow.createname + '" is not created.', 3000, 'red rounded');
                    }
                });
            else
                Materialize.toast('"' + $scope.flow.createname + '" is not created.', 3000, 'red rounded');
        };

        if (!$routeParams.id) {
            return;
        }
        var id = $routeParams.id;
        page = 'flows/id';

        $scope.active = {};
        var load = function (flow) {
            $.get("/api/ctrl/flow/get?flow=" + flow, function (data) {
                $scope.active = {};
                $scope.active[flow] = 'active';
                $scope.dash = data;
                $scope.dash.data = JSON.parse($scope.dash.data);
                $scope.success = true;
                $scope.error = false;
                $scope.dash.pretty = JSON.stringify($scope.dash.data, null, 4);
                showGraph(true, false);
                modulePane();
                $scope.$apply();
            });
        };

        load(id);

        $scope.flow.delete = function (flow) {
            if (flow)
                $.get("/api/ctrl/flow/delete?flow=" + flow, function (data) {
                    if (data.status == 'SUCCESS') {
                        Materialize.toast('"' + flow + '" is deleted.', 3000, 'green rounded');
                        $scope.dash = {deleteVisible: 'none'};
                        $scope.$apply();
                        list();
                    } else {
                        Materialize.toast('"' + flow + '" is not deleted.', 3000, 'red rounded');
                    }
                });
            else
                Materialize.toast('"' + flow + '" is not deleted.', 3000, 'red rounded');
        };

        $scope.showGraph = function () {
            showGraph($scope.success, $scope.error);
        };

        var showGraph = function (success, error) {
            var data = $scope.dash.data;

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
                    edges.push({from: key, to: data[key].error.id, arrows: 'to', color: {color: 'orange'}});
                }
            }

            nodes = new vis.DataSet(nodes);
            edges = new vis.DataSet(edges);

            var container = document.getElementById('network');
            var nData = {
                nodes: nodes,
                edges: edges
            };
            var options = {};
            var network = new vis.Network(container, nData, options);

            network.on('click', function (params) {
                modulePane(params.nodes[0]);
            });
        };

        var modulePane = function (node) {
            var data = $scope.dash.data;

            $.get("/api/ctrl/apps/list", function (apps) {
                $scope.allapps = Object.clone(apps);
                try {
                    for (var i in apps)
                        if (apps[i].name == data[node].app)
                            apps.splice(i, 1);
                } catch (e) {
                }

                $scope.apps = apps;
                $scope.$apply();
            });

            $scope.dash.node = node;
            $scope.module = {
                name: node,
                data: data[node] ? data[node] : {}
            };

            // Input Ctrl
            $scope.module.inputs = [];

            try {
                for (var key in $scope.module.data.next.input)
                    if ($scope.module.data.next.input[key])
                        $scope.module.inputs.push({key: key, value: $scope.module.data.next.input[key]});
                    else
                        delete $scope.module.data.next.input[key];
            } catch (e) {
            }

            try {
                var doc = {};
                if ($scope.allapps) {
                    for (var i in $scope.allapps) {
                        if ($scope.allapps[i].name == data[$scope.module.data.next.id].app)
                            doc = $scope.allapps[i].doc;
                    }

                    for (var key in doc.inputs) {
                        try {
                            if (!$scope.module.data.next.input[key])
                                $scope.module.inputs.push({key: key, value: doc.inputs[key]});
                        } catch (e) {
                            $scope.module.inputs.push({key: key, value: doc.inputs[key]});
                        }
                    }
                }
            } catch (e) {
            }

            $scope.module.addinput = function () {
                if (!$scope.module.data.next) $scope.module.data.next = {};
                if (!$scope.module.data.next.input) $scope.module.data.next.input = {};

                if ($scope.module.data.next.input[$scope.module.addinputvalue])
                    delete $scope.module.data.next.input[$scope.module.addinputvalue];
                else
                    $scope.module.data.next.input[$scope.module.addinputvalue] = '';
                $scope.module.addinputvalue = '';
                modulePane($scope.module.name);
            };

            // Error Ctrl
            $scope.errorModule = [];
            for (var key in $scope.dash.data) {
                if ($scope.module.data && $scope.module.data.error && $scope.module.data.error.id)
                    $scope.errorModule.push({name: key, active: $scope.module.data.error.id == key ? true : false});
                else
                    $scope.errorModule.push({name: key, active: false});
            }

            $('#module-error').unbind('change');
            $('#module-error').change(function () {
                if (!$scope.module.data.error) $scope.module.data.error = {};
                $scope.module.data.error.id = $('#module-error option:selected').val();
            });

            // Module Ctrl
            $scope.module.delete = function () {
                if (node) delete $scope.dash.data[node];
                $scope.showGraph();
                modulePane();
            };

            $scope.module.save = function () {
                if (!$scope.module.data.next || !$scope.module.data.next.id || $scope.module.data.next.id.length == 0)
                    delete $scope.module.data.next;

                if (node && $scope.dash.data[node]) {
                    $scope.dash.data[node] = $scope.module.data;
                    $scope.dash.data[$scope.module.name] = data[node];
                    if ($scope.module.name != node)
                        delete $scope.dash.data[node];

                    for (var key in $scope.dash.data) {
                        if ($scope.dash.data[key].next && $scope.dash.data[key].next.id == node)
                            $scope.dash.data[key].next.id = $scope.module.name;
                        if ($scope.dash.data[key].error && $scope.dash.data[key].error.id == node)
                            $scope.dash.data[key].error.id = $scope.module.name;
                    }
                } else if ($scope.module.name && $scope.module.name.length > 0) {
                    for (var key in $scope.dash.data) {
                        if ($scope.module.name == key) {
                            Materialize.toast('Already Exists', 2000, 'red rounded');
                            return;
                        }
                    }

                    $scope.dash.data[$scope.module.name] = $scope.module.data;
                }

                $.get("/api/ctrl/flow/save?id=" + id + '&data=' + encodeURI(JSON.stringify($scope.dash.data)), function (data) {
                    Materialize.toast(data.status, 2000, 'rounded');
                });

                $scope.showGraph();
                modulePane($scope.module.name);
            };

            // Next Module Ctrl
            $scope.nextModule = [];
            for (var key in $scope.dash.data) {
                if ($scope.module.data && $scope.module.data.next && $scope.module.data.next.id)
                    $scope.nextModule.push({name: key, active: $scope.module.data.next.id == key ? true : false});
                else
                    $scope.nextModule.push({name: key, active: false});
            }

            $('#module-next').unbind('change');
            $('#module-next').change(function () {
                if (!$scope.module.data.next) $scope.module.data.next = {};
                $scope.module.data.next.id = $('#module-next option:selected').val();

                $scope.module.inputs = [];

                try {
                    for (var key in $scope.module.data.next.input)
                        if ($scope.module.data.next.input[key])
                            $scope.module.inputs.push({key: key, value: $scope.module.data.next.input[key]});
                        else
                            delete $scope.module.data.next.input[key];
                } catch (e) {
                }

                try {
                    var doc = {};
                    if ($scope.allapps) {
                        for (var i in $scope.allapps) {
                            if ($scope.allapps[i].name == data[$scope.module.data.next.id].app)
                                doc = $scope.allapps[i].doc;
                        }

                        for (var key in doc.inputs) {
                            try {
                                if (!$scope.module.data.next.input[key])
                                    $scope.module.inputs.push({key: key, value: doc.inputs[key]});
                            } catch (e) {
                                $scope.module.inputs.push({key: key, value: doc.inputs[key]});
                            }
                        }
                    }
                } catch (e) {
                }

                $scope.$apply();
            });

            $('#module-app-select > option:eq(0)').attr('selected', 'true');
            $('#module-app-select').unbind('change');
            $('#module-app-select').change(function () {
                $scope.module.data.app = $('#module-app-select option:selected').val();
            });

            $scope.$apply();
        };
    }
]);