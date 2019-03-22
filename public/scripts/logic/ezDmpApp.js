'use strict';
console.log('a')
var ezDmpApp = angular.module('ezDmpApp', [
  'ngRoute',
  'ezDmpControllers',
  'ngAnimate',
  'satellizer',
  'toastr',
  'angularModalService',
  'config'
]);
console.log('b');
ezDmpApp.config(function(toastrConfig) {
  angular.extend(toastrConfig, {
    timeOut: 3000
  });
});
console.log('c');
ezDmpApp.config([
  '$routeProvider','$authProvider','$locationProvider','ENV',
  function($routeProvider,$authProvider,$locationProvider,ENV) {
      console.log(ENV);
    var skipIfLoggedIn = ['$q', '$auth', function($q, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.reject();
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }];

    var loginRequired = ['$q', '$location', '$auth', function($q, $location, $auth) {
      var deferred = $q.defer();
      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
      }
      return deferred.promise;
    }];
    
    $routeProvider.
      when('/index', {
        templateUrl: 'inc/index_inc.html',
        controller: 'indexView'
      }).
      when('/about', {
        templateUrl: 'inc/about_inc.html',
        controller: 'indexView'
      }).
      when('/privacy', {
        templateUrl: 'inc/privacy_inc.html',
        controller: 'indexView'
      }).
      when('/profile', {
        templateUrl: 'inc/profile_inc.html',
        controller: 'profileView'
      }).
      when('/dmp/:id', {
        templateUrl: 'inc/proposal_inc.html',
        controller: 'dmpView'
      }).
      when('/dmp/:dmpId/curriculum/:productId', {
          templateUrl: 'inc/curriculum_inc.html',
          controller: 'productView',
          resolve: { productType: function ($route) { $route.current.params.productType = 'curriculum'; } }
      }).
      when('/dmp/:dmpId/specimen/:productId', {
          templateUrl: 'inc/specimen_inc.html',
          controller: 'productView',
          resolve: { productType: function ($route) { $route.current.params.productType = 'specimen'; } }
      }).
      when('/dmp/:dmpId/software/:productId', {
          templateUrl: 'inc/software_inc.html',
          controller: 'productView',
          resolve: { productType: function ($route) { $route.current.params.productType = 'software'; } }
      }).
      when('/dmp/:dmpId/data/:productId', {
          templateUrl: 'inc/data_inc.html',
          controller: 'productView',
          resolve: { productType: function ($route) { $route.current.params.productType = 'data'; } }
      }).
      when('/dmp/:dmpId/workflow/:productId', {
          templateUrl: 'inc/workflow_inc.html',
          controller: 'productView',
          resolve: { productType: function ($route) { $route.current.params.productType = 'workflow'; } }
      }).
      otherwise({
        redirectTo: '/index'
      });
      $authProvider.google({
        clientId: ENV.clientIdGoogle,
        redirectUri: window.location.protocol+'//'+window.location.host+ENV.redirectUriGoogle
      });
      
      $authProvider.oauth2({
        name: 'orcid',
        url: '/auth/orcid',
        clientId: ENV.clientIdOrcid,
        redirectUri: window.location.protocol+'//'+window.location.host+ENV.redirectUriOrcid,
        authorizationEndpoint: 'https://orcid.org/oauth/authorize',
        scope: ['/authenticate'],
        requiredUrlParams: ['scope']
      });
      
      // use the HTML5 History API
      $locationProvider.html5Mode(true);
      
  }]);
console.log('d');