var spa = angular.module('spa', ['ngRoute', 'ngResource', 'ui.bootstrap']);

spa.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/home.html',
            controller: 'homeController'
        })
        .when('/main', {
            templateUrl: '/main.html',
            controller: 'mainController'
        })
        .when('/about', {
            templateUrl: '/about.html',
            controller: 'aboutController'
        });

    $routeProvider.otherwise('/');
});

spa.controller('homeController', ['$scope', function ($scope) {
    $scope.title = 'Home';
}]);

spa.controller('mainController', ['$scope', '$http', '$log', function ($scope, $http, $log) {
    $scope.data = {};
    $scope.itables = [0];

    $scope.addTable = function () {
        $log.log('addTable');
        $scope.itables.push(1);
    };

    $http.get('/json/small.json').then(function (response) {
        $scope.data.small = response.data;
    }, function () {
        $log.error('Error getting data.');
    });

    $http.get('/json/large.json').then(function (response) {
        $scope.data.large = response.data;
    }, function () {
        $log.error('Error getting data.');
    });
}]);

spa.controller('aboutController', ['$scope', function ($scope) {
    $scope.title = 'About page';
}]);

spa.controller('tableDataCtrl', ['$scope', '$log', function ($scope, $log) {
    $scope.sorting = {
        asc: [1, -1],
        desc: [-1, 1],
        lastSorted: '',
        sort: false
    };
    $scope.search = '';
    $scope.forRender = {setName: null};
    $scope.iScope = { // for object ref
        data: null,
        dataTableHead: null,
        dataTableBody: null
    };
    $scope.preview = null;
    $scope.keys = [];

    $scope.itemsPerPageValues = [10, 25, 50];
    $scope.itemsPerPage = 50;
    $scope.currentPage = 1;

    $scope.$watch('iScope.data', function (newValue, oldValue, scope) {
        if (newValue && typeof newValue !== 'object') {
            try {
                $scope.iScope.data = JSON.parse(newValue);
                $scope.useData();
            } catch (err) {
                $scope.iScope.data = null;
                alert('Wrong data\'s format! Use *.json.');
                $log.error(err);
            }
        }
    });

    $scope.sort = function (key) {
        var index = $scope.keys.indexOf(key);

        if (index === -1) {
            return;
        }

        var sort = ($scope.sorting.lastSorted === key && $scope.sorting.sort) ? 'desc' : 'asc';
        $scope.sorting.sort = !$scope.sorting.sort;
        $scope.sorting.lastSorted = key;

        $scope.iScope.dataTableBody.sort(function (a, b) {
            if (a[index] > b[index]) {
                return $scope.sorting[sort][0];
            }
            if (a[index] < b[index]) {
                return $scope.sorting[sort][1];
            }
            return 0;
        });

        $log.log($scope.iScope.dataTableBody[0]);
    };

    $scope.showPreview = function (data) {
        $scope.preview = data;
    };

    $scope.useData = function (key) {
        if (key) {
            $scope.iScope.data = $scope.data[key];
        }

        if ($scope.iScope.data) {
            try {
                $scope.iScope.dataTableHead = $scope.iScope.data[0];
                $scope.iScope.dataTableBody = $scope.iScope.data.slice(1);
                $scope.keys = Object.keys($scope.iScope.dataTableHead);
                $scope.preview = null;

                $log.warn($scope.iScope.dataTableBody.length);
                $scope.currentPage = 1;
            } catch (err) {
                alert('Wrong json\'s format!');
                $log.error(err);
                $scope.iScope.data = $scope.iScope.dataTableHead = $scope.iScope.dataTableBody = null;
            }
        }
    };

    $scope.pageChanged = function () {
        $log.log('Page changed to: ' + $scope.currentPage);
    };
}]);

spa.directive('tableData', function () {
    return {
        controller: 'tableDataCtrl',
        replace: true,
        restrict: 'AE',
        templateUrl: '/tmpls/tableData.html'
    };
});

spa.directive('fileread', [function () {
    return {
        scope: {
            fileread: '='
        },
        link: function (scope, element, attributes) {
            element.bind('change', function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                };
                reader.readAsText(changeEvent.target.files[0]);
            });
        }
    }
}]);

spa.filter('startFrom', function () {
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});
