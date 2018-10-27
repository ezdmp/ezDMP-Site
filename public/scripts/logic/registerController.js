ezDmpControllers.controller('registerController', [
  '$scope', '$element', 'title', 'close','toastr','$http',
function($scope, $element, title, close,toastr,$http) {

  $scope.title = title;
  $scope.provided_name = null;
  $scope.policyAccepted = false;
  $scope.optInEmail = true;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
 	    close({
          providedName: $scope.provided_name,
          policyAccepted: $scope.policyAccepted,
          optInEmail: $scope.optInEmail
        }, 500);
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function(ev) {
    if (typeof ev === 'undefined' || (typeof ev.target.attributes.data !== 'undefined' && ev.target.attributes.data.value=='modalBackground')) {
        $element.modal('hide');
        close(false, 500);
    }
  };

}]);