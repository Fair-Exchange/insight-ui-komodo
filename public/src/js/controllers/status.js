'use strict';

angular.module('insight.status').controller('StatusController',
  function ($scope, $routeParams, $location, Global, Status, Sync, Peers, SafeNodes, getSocket) {
    $scope.global = Global;
    $scope.loading = false;
    $scope.getStatus = function (q) {
      Status.get({
        q: 'get' + q
      },
        function (d) {
          $scope.loaded = 1;
          angular.extend($scope, d);
        },
        function (e) {
          $scope.error = 'API ERROR: ' + e.data;
        });
    };

    $scope.humanSince = function (time) {
      var m = moment.unix(time / 1000);
      return m.max().fromNow();
    };

    var _onSyncUpdate = function (sync) {
      $scope.sync = sync;
    };

    var _startSocket = function () {
      socket.emit('subscribe', 'sync');
      socket.on('status', function (sync) {
        _onSyncUpdate(sync);
      });
    };

    var socket = getSocket($scope);
    socket.on('connect', function () {
      _startSocket();
    });


    $scope.getSync = function () {
      _startSocket();
      Sync.get({},
        function (sync) {
          _onSyncUpdate(sync);
        },
        function (e) {
          var err = 'Could not get sync information' + e.toString();
          $scope.sync = {
            error: err
          };
        });
    };
    $scope.getPeers = function () {
      $scope.loading = true;

      Peers.get({},
        function (res) {
          $scope.loading = false;
          $scope.peers = res.peerInfo;
        });
    };
    $scope.getActiveNodes = function () {
      $scope.loading = true;

      SafeNodes.get({},
        function (res) {
          $scope.loading = false;
          $scope.safenodes = res.SafeNodes;
        });
      SafeNodes.get(
		function (res) {
          $scope.loading = false;
          $scope.node_count = res.node_count;
          $scope.tier_0_count = res.tier_0_count;
          $scope.tier_1_count = res.tier_1_count;
          $scope.tier_2_count = res.tier_2_count;
          $scope.tier_3_count = res.tier_3_count;
          $scope.collateral_total = res.collateral_total;
        });
    };
  });
