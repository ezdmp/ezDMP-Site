angular.module('ezDmpApp')
  .factory('Account', ['$http','$auth','toastr','ModalService','$location','$route','ENV',function($http,$auth,toastr,ModalService,$location,$route,ENV) {
    var service = {
      user: {authorized: false},
      getProfile: function() {
        var promise = $http.get(ENV.api+'me');
        promise.then(function(response) {
          service.user = response.data;
        });
        return promise
      },
      init: function(callback) {
        if ($auth.isAuthenticated()) {
          service.getProfile().then(function(response) {
            service.user = response.data;
            if (! service.isRegistered()) {
              service.showRegisterDialog();
            }
            if (typeof callback == 'function') {
              callback();
            }
          })
          .catch(function(response) {
            $auth.logout().then(function(){
              $location.path('/');
            });
            toastr.error('A login error was encountered. You have been automatically logged out.');
          });
        }
      },
      authenticate: function(provider,path) {
        $auth.authenticate(provider)
        .then(function() {
          toastr.info('You have successfully signed in with ' + provider + '!');
          service.init();
          if (typeof path !== 'undefined')
            $location.path(path);
          else
            $route.reload();
          //$location.path('/');
        })
        .catch(function(error) {
            toastr.error('A login error was encountered');
        });
      },
      logOut: function() {
        $auth.logout()
          .then(function() {
              //$route.reload();
              $location.path('/');
              toastr.info('You have been logged out');
          });
      },
      isAuthenticated: function() {
          return $auth.isAuthenticated();
      },
      isAuthorized: function() {
          return service.user.authorized;
      },
      isAdmin: function() {
        return service.user.isAdmin;
      },
      isRegistered: function() {
          return service.user.policyAccepted;
      },
      showRegisterDialog: function() {
        ModalService.showModal({
          templateUrl: "/inc/modal_register.html",
          controller: "registerController",
          preClose: (modal) => {
              modal.element.modal('hide');
          },
          inputs: {
            title: "Register Your Account",
            user: service.user
          }
        }).then(function(modal) {
          modal.element.on('hidden.bs.modal', function () {
              if (!modal.closed) {
                modal.close.then(function(){});  
              }
          });
          modal.element.modal();
          modal.close.then(function(result) {
            if (result) {
                service.registerUser(result,function(){});
            } else {
                service.logOut();
            }
          });
        });

      },
      registerUser: function(result) {
          //registerUser logic
          $http({
              url: ENV.api+"register", 
              method: "POST",
              data: {
                  username: result.username,
                  providedName: result.providedName,
                  policyAccepted: result.policyAccepted,
                  optInEmail: result.optInEmail,
                  emailAddress: result.emailAddress
              }
            }).then(function(response){
              
            }).catch(function(response){

            });
      }
      /*,
      updateProfile: function(profileData) {
        return $http.put('/api/me', profileData);
      }*/
    };
    return service;
  }]);