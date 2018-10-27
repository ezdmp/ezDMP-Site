angular.module('ezDmpApp')
.controller('NavbarCtrl', ['$scope','Account','ModalService', function($scope, Account, ModalService) {
    $scope.acct = Account;
    Account.init();
}]);