google.load('visualization', '1.1', {
  packages: ['corechart','table','annotatedtimeline','bar']
});

var ezDmpControllers = angular.module('ezDmpControllers', ['ngSanitize']);

ezDmpControllers.filter("trust", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  };
}]);

ezDmpControllers.controller('indexView',['$scope','$timeout','Account','$location',function($scope,$timeout,Account,$location) {
    $scope.acct = Account
    $scope.loginOrProfile = function(service) {
      if ($scope.acct.isAuthenticated()) {
        $location.path("/profile");
      } else {
        $scope.acct.authenticate(service,"/profile");
      }
    };
    $timeout(function(){ $(".centralcontent").hide().fadeIn(500); }, 500);
}]);


ezDmpControllers.controller('repoView',['$scope','Account','$http','$q','$location','ezDmpModel','ModalService','vocabControl','$window','ENV',function($scope,Account,$http,$q,$location,ezDmpModel,ModalService,vocabControl,$window,ENV) {
  $scope.acct = Account;
  $scope.repos = null;
  $scope.vocab = vocabControl;

  $scope.getRepos = function () {
    $http.get(ENV.api+'repositories',{})
      .then(function(response) {
        $scope.repos = response.data.data;
      })
      .catch(function(response) {
        console.log("Request failed " + response.status);
      });
  };

  $scope.vocab.init(function(){
    $scope.getRepos();
    $(".ezDmpmask").fadeOut(2000);
  });
}]);

ezDmpControllers.controller('profileView',['$scope','Account','$http','$q','$location','ezDmpModel','ModalService','vocabControl','$window','ENV',function($scope,Account,$http,$q,$location,ezDmpModel,ModalService,vocabControl,$window,ENV) {
  $scope.acct = Account;
  
  $scope.dmps = null;
  $scope.dmpModel = ezDmpModel;
  
  $scope.download_url = null;
  $scope.displayAll = false;
  $scope.displayText = "Display hidden DMPs";


  $scope.getDmps = function () {
    $http.get(ENV.api+'dmps',{})
      .then(function(response) {
        $scope.dmps = response.data;
        for (var dmp of $scope.dmps) {
          if (dmp.dmp && dmp.dmp.proposal && dmp.dmp.proposal.dataManagementOverview) {
            dmp.dmp.proposal['teaser'] = dmp.dmp.proposal.dataManagementOverview.substring(0,300) + '...';
          }
        }
      })
      .catch(function(response) {
        //console.log("Request failed " + response.status);
      });
  };
  
        
  $scope.newDmp = function(){
    $scope.dmpModel.newDmp(function(response){
      console.log(response.data);
      $scope.goToDmp(response.data.id);
    });
  };
  
  $scope.copyDmp = function(id){
    $scope.dmpModel.copyDmp(id, function(response){
      $scope.goToDmp(response.data.id);
    });
  };

  $scope.goToDmp = function(id){
    $location.path( "/dmp/"+id );
  };
  
  $scope.downloadPdf = function(id){
    $http.get(ENV.api+'pageCount/'+id,{})
      .then(function(response) {
        if (response.data.data.pages>2) {
          ModalService.showModal({
            templateUrl: "/inc/modalAreYouSure.html",
            controller: "areYouSureController",
            preClose: (modal) => {
                modal.element.modal('hide');
            },
            inputs: {
              title: "PDF Is Longer Than NSF Requirements Permit",
              body: "This PDF is currently "+response.data.data.pages+" pages in length. The NSF requirement for data management plans is 2 pages. Would you like to download this data management plan anyway?"
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
                $window.location.href = ENV.api+'pdf/'+id;
              } else {

              }
            });
          });
        } else {
          $window.location.href = ENV.api+'pdf/'+id;
        }
      })
      .catch(function(response) {
        //console.log("Request failed " + response.status);
      });
  };
  
  vocabControl.init(function(){
    $scope.getDmps();
    $(".ezDmpmask").fadeOut(2000);
  });
  
  $scope.deleteDmp = function(dmp_id){
    ModalService.showModal({
      templateUrl: "/inc/modalAreYouSure.html",
      controller: "areYouSureController",
      preClose: (modal) => {
          modal.element.modal('hide');
      },
      inputs: {
        title: "Delete Data Management Plan",
        body: "Are you sure you want to delete this data management plan?"
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
          $http.post(ENV.api+'deleteDmp',{dmp_id:dmp_id})
            .then(function(response) {
              $scope.getDmps();
            })
            .catch(function(response) {
              //console.log("Request failed " + response.status);
            });
        } else {

        }
      });
    });
  };
  

  $scope.hideShowDmp = function(dmp_id, hideShow){
    ModalService.showModal({
      templateUrl: "/inc/modalAreYouSure.html",
      controller: "areYouSureController",
      preClose: (modal) => {
          modal.element.modal('hide');
      },
      inputs: {
        title: "Hide/Show Data Management Plan",
        body: "Are you sure you want to " + hideShow + " this data management plan?"
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
          var status = hideShow == 'hide' ? 'hidden' : 'current'
          $http.post(ENV.api+'updateDmpStatus',{dmp_id:dmp_id, status:status})
            .then(function(response) {
              $scope.getDmps();
            })
            .catch(function(response) {
              //console.log("Request failed " + response.status);
            });
        } else {

        }
      });
    });
  };

  $scope.orderBy = 'modified';
  $scope.reverse = true;
  $scope.orderByMe = function (x) {
    $scope.reverse = ($scope.orderBy === x) ? !$scope.reverse : false;
    $scope.orderBy = x;
  };

  $scope.toggleDisplay = function() {
    $scope.displayAll = !$scope.displayAll;
    $scope.displayText = $scope.displayAll ? "Hide hidden DMPs" : "Display hidden DMPs"
  }

}]);

ezDmpControllers.controller('dmpView',['$scope','Account','$http','$q','$location','ezDmpModel','ModalService','toastr','vocabControl','$routeParams','$sce',function($scope,Account,$http,$q,$location,ezDmpModel,ModalService,toastr,vocabControl,$routeParams,$sce) {
  $scope.acct = Account;
  $scope.dmpModel = ezDmpModel;
  $scope.vocab = vocabControl;
  $scope.directorate = '';
  
  $scope.vocab.init(function(){
    $scope.dmpModel.getDmp($routeParams.id,function(response){
      $scope.divisions = $scope.vocab.divisions;
      if ($scope.dmpModel.dmp.proposal.fundingDivision) {
        $scope.directorate = $scope.vocab.getFieldById($scope.vocab.divisions,$scope.dmpModel.dmp.proposal.fundingDivision,'directorate');
      }
      if (!$scope.dmpModel.dmp.proposal.leadPi) {
        $scope.dmpModel.dmp.proposal.leadPi = $scope.acct.user.providedName;
      }
      $('[data-toggle="tooltip"]').tooltip(); 
      $scope.getAwards();
    });
  });

  $scope.saveReturn = function(){
    $scope.dmpModel.saveDmp(function(){
      toastr.info('Your Data Management Plan has been saved','DMP Saved')
      $location.path("/profile");
    });
  };
  
  $scope.saveContinue = function(){
    $scope.dmpModel.saveDmp(function(){
      $scope.dmpModel.modified = (new Date());
      toastr.info('Your Data Management Plan has been saved','DMP Saved')
    });
  };
  
  $scope.getAwards = function() {
    var api_url = "https://api.nsf.gov/services/v1/awards.json?agency=NSF&pdPIName=" + $scope.dmpModel.dmp.proposal.leadPi;
    var trustedUrl = $sce.trustAsResourceUrl(api_url);
    var other = {label:'Other'};
    $scope.awards=[other];

    //get awards from NSF API
    $http.jsonp(trustedUrl, {jsonpCallbackParam: 'callback'})
        .then(function(response){
            $scope.awards = response.data.response.award;
            //if reloading, try and match existing award from database
            var found = false;
            for (var award of $scope.awards) {
              award.label = award.id + ": " + award.title;
              if (award.id == $scope.dmpModel.award_id) {
                $scope.award = award;
                found = true;
              }
            }
            $scope.awards.push(other);
            //if reloading with a manually entered award
            if (!found && $scope.dmpModel.award_id) {
              $scope.award = other;
            }
        })
        .catch(function(response) {
          console.log("Request failed " + response);
        });
  }

  $scope.awardSet = function(){
    // the award_id will be saved in the database
    if ($scope.award && $scope.award.label !== 'Other'){
      $scope.dmpModel.award_id = $scope.award.id;
    } else {
      $scope.dmpModel.award_id = '';
    }
  };

  $scope.dataPolicyUrl = function(id) {
    if (!$scope.divisions) return false;
    for (var i=0;i<$scope.divisions.length;i++) {
      if ($scope.divisions[i].id===id) {
        return $scope.divisions[i].data_policy_url
      }
    }
  };
  
  $scope.editProduct = function(type,id){
    $scope.dmpModel.productFromId(id);
    var types = ['curriculum','workflow','specimen','data','software'];
    if (types.indexOf(type)!==-1)
      $location.path(['','dmp',$routeParams.id,type,id].join('/'));
  };
  
  $scope.moveProductUp = function(product_id){
    $scope.dmpModel.reorderProduct(product_id,-1);
  };
  
  $scope.moveProductDown = function(product_id){
    $scope.dmpModel.reorderProduct(product_id,1);
  };
  
  $scope.deleteProduct = function(product_id){
    ModalService.showModal({
      templateUrl: "/inc/modalAreYouSure.html",
      controller: "areYouSureController",
      preClose: (modal) => {
          modal.element.modal('hide');
      },
      inputs: {
        title: "Delete Data Product",
        body: "Are you sure you want to delete this product?"
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
          $scope.dmpModel.deleteProduct(product_id);
        } else {

        }
      });
    });
  };
  
  $scope.addProduct = function(){
    ModalService.showModal({
      templateUrl: "/inc/modal_product.html",
      controller: "productController",
      preClose: (modal) => {
          modal.element.modal('hide');
      },
      inputs: {
        title: "Add a Product"
      }
    }).then(function(modal) {
      //Save DMP prior to adding a product to prevent issues
      $scope.dmpModel.saveDmp(function(){ });
      modal.element.on('hidden.bs.modal', function () {
          if (!modal.closed) {
            modal.close.then(function(){});  
          }
      });
      modal.element.modal();
      modal.close.then(function(result) {
        if (result) {
          $scope.dmpModel.saveDmp(function(){
            $scope.dmpModel.newProduct(result.productType,function(response){
              $scope.editProduct(result.productType,response.product_id);
            });
          });
        } else {

        }
      });
    });
  };
  //Break DMP out into its own factory. getDmp populates factory and then factory manipulates from there.
}])
  .directive("contenteditable", function() {
  return {
    restrict: "A",
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {

      function read() {
        ngModel.$setViewValue(element.html());
      }

      ngModel.$render = function() {
        element.html(ngModel.$viewValue || "");
      };

      element.bind("blur keyup change", function() {
        scope.$apply(read);
      });
    }
  };
});

ezDmpControllers.controller('productController', [
  '$scope', '$element', 'title', 'close','toastr','$http','ezDmpModel','vocabControl',
function($scope, $element, title, close,toastr,$http,ezDmpModel,vocabControl) {
  $scope.dmpModel = ezDmpModel;
  $scope.title = title;
  $scope.vocab = vocabControl;
  $scope.vocab.init(function(){
    $scope.productTypes = $scope.vocab.product_types;
  });
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function(type) {
    close({ productType: type }, 500);
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

ezDmpControllers.controller('areYouSureController', [
  '$scope', '$element', 'title', 'body', 'close','toastr','$http','ezDmpModel',
function($scope, $element, title, body, close,toastr,$http,ezDmpModel) {
  $scope.title = title;
  $scope.body = body;
  
  $scope.close = function() {
    close(false, 500);
  };
  
  $scope.yes = function() {
    close(true, 500);
  };

  $scope.cancel = function(ev) {
    if (typeof ev === 'undefined' || (typeof ev.target.attributes.data !== 'undefined' && ev.target.attributes.data.value=='modalBackground')) {
        $element.modal('hide');
        close(false, 500);
    }
  };

}]);

ezDmpControllers.controller('productView',['$scope','$http','$q','ezDmpModel','$location','toastr','$routeParams','vocabControl','$timeout','ModalService',function($scope,$http,$q,ezDmpModel,$location,toastr,$routeParams,vocabControl,$timeout,ModalService){
  $scope.vocab = vocabControl;
  $scope.dmpModel = ezDmpModel;
  $scope.product = ezDmpModel.productPointer;
  $scope.metadata = ezDmpModel.metadataPointer;
  
  $scope.license = null;
  $scope.repository = null;
  $scope.mrepository = null;
  $scope.subdiscipline = null;
  
  $scope.licenses = $scope.vocab.licenses;
  
  $scope.updateRepositories = function(){
    $scope.repositories = vocabControl.repositoryOptions(
      $scope.vocab.getDirectorate($scope.dmpModel.dmp.proposal.fundingDivision),
      $scope.product.productId,
      $scope.product.productType
    );
    console.log($scope.repositories,$scope.vocab.getDirectorate($scope.dmpModel.dmp.proposal.fundingDivision),
      $scope.product.productId,
      $scope.product.productType);
    if ($scope.metadata) {
      $scope.mrepositories = vocabControl.repositoryOptions(
        $scope.vocab.getDirectorate($scope.dmpModel.dmp.proposal.fundingDivision),
        $scope.product.productId,
        $scope.metadata.productType
      );
    }
    $scope.checkRepository();
    $scope.checkMRepository();
    $scope.repositoryDescription = $scope.getRepoDescription($scope.repositories,$scope.product.repository);
    if ($scope.metadata) {
      $scope.mRepositoryDescription = $scope.getRepoDescription($scope.mrepositories,$scope.metadata.repository);
    }
    $timeout(function(){$scope.$apply();},0,false);
  };
  $scope.updateSubdisciplines = function(){
    $scope.subdisciplines = vocabControl.subdisciplineOptions($scope.vocab.getDirectorate($scope.dmpModel.dmp.proposal.fundingDivision),$scope.product.productType);
    $scope.checkSubdiscipline();
    $timeout(function(){$scope.$apply();},0,false);
  };
  $scope.updateLicenses = function(){
    $scope.licenses = $scope.vocab.licenses;
    $scope.checkLicense();
    $scope.licenseDescription = $scope.getLicenseDescription($scope.licenses,$scope.product.license);
    $scope.licenseUrl = $scope.getLicenseUrl($scope.licenses,$scope.product.license);
    $timeout(function(){$scope.$apply();},0,false);
  };
  
  $scope.getRepoDescription = function(repos,repo) {
    console.log(repos,repo);
    return vocabControl.getFieldById(repos,repo,'description');
  };
  
  $scope.getLicenseDescription = function(licenses,license) {
    return vocabControl.getFieldById(licenses,license,'description');
  };
  
  $scope.getLicenseUrl = function(licenses,license) {
    return vocabControl.getFieldById(licenses,license,'url');
  };

  $scope.repositorySet = function(){
    if ($scope.repository!=='other'){
      $scope.product.repository=$scope.repository;
      $scope.repositoryDescription = $scope.getRepoDescription($scope.repositories,$scope.product.repository);
    } else {
      $scope.product.repository='';
      $scope.repositoryDescription = '';
    }
  };
  
  $scope.licenseSet = function(){
    if ($scope.license!=='other'){
      $scope.product.license=$scope.license;
      $scope.licenseDescription = $scope.getLicenseDescription($scope.licenses,$scope.product.license);
      $scope.licenseUrl = $scope.getLicenseUrl($scope.licenses,$scope.product.license);
    } else {
      $scope.product.license='';
      $scope.licenseDescription ='';
      $scope.licenseUrl = "";
    }
  };
  
  $scope.mrepositorySet = function(){
    if ($scope.repository!=='other'){
      $scope.metadata.repository=$scope.mrepository;
      $scope.mRepositoryDescription = $scope.getRepoDescription($scope.mrepositories,$scope.metadata.repository);
    } else {
      $scope.metadata.repository='';
      $scope.mRepositoryDescription='';
    }
  };
  
  $scope.subdisciplineSet = function(){
    if ($scope.subdiscipline!=='other'){
      $scope.product.productId=$scope.subdiscipline;
    } else {
      $scope.product.productId='';
    }
    $scope.updateRepositories();
    $scope.checkRepository();
  };
  
  $scope.checkLicense = function(){
    var sw = false;
    for (var i=0;i<$scope.licenses.length;i++) {
      if ($scope.licenses[i].id===$scope.product.license) {
        sw = true;
        $scope.license = $scope.product.license;
        break;
      }
    }
    if (!sw && $scope.product.license) {
      $scope.license = 'other';
    }
  };
  
  $scope.checkRepository = function(){
    var sw = false;
    for (var i=0;i<$scope.repositories.length;i++) {
      if ($scope.repositories[i].id===$scope.product.repository) {
        sw = true;
        $scope.repository = $scope.product.repository;
        break;
      }
    }
    if (!sw && $scope.product.repository) {
      $scope.repository = 'other';
    }
  };
  
  $scope.checkMRepository = function(){
    if (!$scope.metadata)
      return false;
    var sw = false;
    for (var i=0;i<$scope.mrepositories.length;i++) {
      if ($scope.mrepositories[i].id===$scope.metadata.repository) {
        sw = true;
        $scope.mrepository = $scope.metadata.repository;
        break;
      }
    }
    if (!sw && $scope.metadata && $scope.metadata.repository) {
      $scope.mrepository = 'other';
    }
  };
  
  $scope.checkSubdiscipline = function(){
    var sw = false;
    for (var i=0;i<$scope.subdisciplines.length;i++) {
      if ($scope.subdisciplines[i].id===$scope.product.productId) {
        sw = true;
        $scope.subdiscipline = $scope.product.productId;
        break;
      }
    }
    if (!sw && $scope.product.productId) {
      $scope.subdiscipline = 'other';
    }
  };
  
  $scope.init = function(){
    $scope.dmpModel.productFromId($routeParams.productId);
    //console.log($scope.product);
    $scope.product = ezDmpModel.productPointer;
    $scope.metadata = ezDmpModel.metadataPointer;
    $scope.updateRepositories();
    $scope.updateSubdisciplines();
    $scope.updateLicenses();
  };
  
  //INITIALIZE
  $scope.vocab.init(function(resp){
    if (resp===false) {
      $scope.dmpModel.getDmp($routeParams.dmpId,function(response){
        $scope.divisions = $scope.vocab.divisions;
        if ($scope.dmpModel.dmp.proposal.fundingDivision) {
          $scope.directorate = $scope.vocab.getFieldById($scope.vocab.divisions,$scope.dmpModel.dmp.proposal.fundingDivision,'directorate');
        }
        if (!$scope.dmpModel.dmp.proposal.leadPi) {
          $scope.dmpModel.dmp.proposal.leadPi = $scope.acct.user.providedName;
        }
        $('[data-toggle="tooltip"]').tooltip();
        $scope.init();
      });
    } else {
      $scope.init();
    }
  });
  
  $scope.goBack = function(){
    $scope.dmpModel.saveDmp(function(){
      toastr.info('Your Data Management Plan has been saved','DMP Saved')
      $location.path("/dmp/"+$scope.dmpModel.dmp_id);
    });
  };
    
  $scope.addProductRelationship = function(){
    ModalService.showModal({
      templateUrl: "/inc/modal_product_relationship.html",
      controller: "productRelationshipController",
      preClose: (modal) => {
          modal.element.modal('hide');
      },
      inputs: {
        title: "Add a Research Product Relationship"
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
          $scope.dmpModel.addRelationship(result.id,result.relationship);
        } else {

        }
      });
    });
  };
}]);


ezDmpControllers.controller('statsView',['$scope','$timeout','$http','ENV','vocabControl','$routeParams','$route',
  function($scope,$timeout,$http,ENV,vocabControl,$routeParams,$route) {

    $timeout(function(){ $(".centralcontent").hide().fadeIn(500); }, 500);
   
    $scope.path =  $route.current.$$route.originalPath.split(':')[0];

    $scope.plotHeight = 700;
    $scope.plotWidth = 1200;

    var today = new Date();
    $scope.min_year = 2012;
    $scope.max_year = today.getFullYear();
    $scope.start_year = parseInt($routeParams.start_year);
    if (!$scope.start_year) { $scope.start_year = $scope.min_year;}
    $scope.end_year = parseInt($routeParams.end_year); 
    if (!$scope.end_year) {$scope.end_year = $scope.max_year;}

    $scope.vocab = vocabControl;
    $scope.vocab.init(function(){
      var divisions = $scope.vocab.divisions;
      var div_list = ['Other'];
      for (var div of divisions) {
        div_list.push(div.id);
      }
      var repos = $scope.vocab.repositories;
      var repos_list = [];
      for (var repo of repos) {
        repos_list.push(repo.id);
      }
      generateCharts(repos_list, div_list);
    });

    function generateCharts(repos_list, div_list) {
      var api_url = ENV.api+'ezdmp_data'+'/?start=01/01/'+$scope.start_year+'&end=12/31/'+$scope.end_year;
      console.log(api_url);
      $http.get(api_url,{})
      .then(function(response) {
        var data = response.data.data;
        var dmp_stats = {}
        var repo_counts = {}
        for (repo of repos_list) {
          repo_counts[repo] = 0;
        }
        var min_year = 9999;
        var max_year = 0;
        for (var row of data) {
          var date = row.created.substring(0,4);
          min_year = Math.min(min_year, parseInt(date));
          max_year = Math.max(max_year, parseInt(date));
          if (!(date in dmp_stats)) {
            dmp_stats[date] = {'repo':{}, 'div':{'total':0}};
            for (repo of repos_list) {
              dmp_stats[date]['repo'][repo] = 0;
            }
          }
          // sum up repo submissions from products
          var products = row.products;
          for (var p of products) {
            var repo = p.repository;
            if (repo == 'PetDB') repo = 'EarthChem';
            if (repos_list.includes(repo)){
              dmp_stats[date]['repo'][repo] += 1;
              repo_counts[repo] += 1;
            }
          }

          // sum up DMPs created by NSF division
          var div = row.fundingDivision || 'Other';
          dmp_stats[date]['div']['total'] += 1;
          if (!(div in dmp_stats[date]['div'])) {
            dmp_stats[date]['div'][div] = 1;
          } else {
            dmp_stats[date]['div'][div] += 1;
          }

        }

        //build arrays to plot
        // first take the 10 most popular repos
        var items = Object.keys(repo_counts).map(function(key) {
          return [key, repo_counts[key]];
        });
        items.sort(function(first, second) {
          return second[1] - first[1];
        });
        top_repos = items.slice(0,10);

        var repo_array = [['Year']];
        for (var r of top_repos){
          repo_array[0].push(r[0]);
        }

        var div_array = [['Year','Total']];
        for (var d of div_list) {
          div_array[0].push(d);
        }

        for (var y=min_year; y<=max_year; y++) {
          var r_row = [y.toString()];
          for (var repo of top_repos) {
            r_row.push(dmp_stats[y]['repo'][repo[0]] === undefined ? 0 :dmp_stats[y]['repo'][repo[0]]); 
          }
          repo_array.push(r_row);
          
          var d_row = [y.toString(), dmp_stats[y]['div']['total']];
          for (var div_name of div_list){
            d_row.push(dmp_stats[y]['div'][div_name] === undefined ? 0 :dmp_stats[y]['div'][div_name]);
          }
          div_array.push(d_row);
        }

        drawLineChart(repo_array, "Target Repositories Identified in DMPs", "Year", "Submissions", "repo_chart_div");
        drawStackedColumnComboChart(div_array, "DMPs Created for Each Funding Division by Year", "Year", "DMPs", "", "div_chart_div",[0], null, true);
        $(".ezDmpmask").fadeOut(2000);
      })

    }

    $scope.reloadData = function() {
      var url = $scope.path + $scope.start_year + "/" + $scope.end_year;
      window.location.href = url;
    }
   
    function drawLineChart(d_array, title, x_title, y_title, target) {
      var d_data = google.visualization.arrayToDataTable(d_array);
      var d_options = {
          legend: {position: 'top', maxLines: 3},
          title: title,
          hAxis: {title: x_title},
          vAxis: {
              title: y_title,
              viewWindowMode:'explicit'
          },
          height: $scope.plotHeight,
          width: $scope.plotWidth,
          lineWidth: 4
      };
      var d_chart= new google.visualization.LineChart(document.getElementById(target));

      // make printable version
      google.visualization.events.addListener(d_chart, 'ready', function () {
          document.getElementById('png_'+target).outerHTML = '<a id="png_' + target +'" href="' + d_chart.getImageURI() + '">Printable version</a>';
      });

      d_chart.draw(d_data,d_options); 
    }
    
    

    function drawStackedColumnChart(d_array, title, x_title, y_title, target, colors, isStacked) {
      var d_data = google.visualization.arrayToDataTable(d_array);
      var d_options = {
          title: title,
          hAxis: {title: x_title},
          vAxis: {
              title: y_title,
              viewWindowMode:'explicit'
          },
          height: $scope.plotHeight,
          width: $scope.plotWidth,
          legend: {position: 'top', maxLines: 3},
          isStacked: isStacked,
          bar: {groupWidth: '75%'},  
      };
      if (colors) {
          d_options.colors = colors;
      }

      var d_chart= new google.visualization.ColumnChart(document.getElementById(target));

      // make printable version
      google.visualization.events.addListener(d_chart, 'ready', function () {
          document.getElementById('png_'+target).outerHTML = '<a id="png_' + target +'" href="' + d_chart.getImageURI() + '">Printable version</a>';
      });

      d_chart.draw(d_data,d_options);  
   }


    function drawStackedColumnComboChart(d_array, title, x_title, y_title_l, y_title_r, target, line_inds, colors, single_y_axis) {
      var d_data = google.visualization.arrayToDataTable(d_array);
      var series = {};
      for (var i=0; i<d_array[0].length-1; i++) {
          if (line_inds.includes(i)) {
              var targetAxis = single_y_axis ? 0 : 1
              series[i] = {type: 'line', targetAxisIndex: targetAxis};
          }
          else {
              series[i] = {targetAxisIndex: 0};
          }
      }

      var vAxes = {
          0: {title: y_title_l},
          1: {title: y_title_r, viewWindow: {min:0}}
      };

      var d_options = {
          isStacked: true,
          interpolateNulls: true,
          legend: {position: 'top', maxLines: 3},
          title: title,
          hAxis: {
              title: x_title, 
          },
          vAxes: vAxes,       
          height: $scope.plotHeight,
          width: $scope.plotWidth,
          lineWidth: 4,
          seriesType: 'bars',
          bar: {groupWidth: '75%'},
          series: series
      };
      if (colors) {
          d_options.colors = colors;
      }

      var d_chart= new google.visualization.ComboChart(document.getElementById(target));

      // make printable version
      google.visualization.events.addListener(d_chart, 'ready', function () {
          document.getElementById('png_'+target).outerHTML = '<a id="png_' + target +'" href="' + d_chart.getImageURI() + '">Printable version</a>';
      });

      d_chart.draw(d_data,d_options);  
    }



}]);


ezDmpControllers.controller('productRelationshipController', [
  '$scope', '$element', 'title', 'close','toastr','$http','ezDmpModel','vocabControl',
function($scope, $element, title, close,toastr,$http,ezDmpModel,vocabControl) {
  $scope.dmpModel = ezDmpModel;
  $scope.title = title;
  $scope.vocab = vocabControl;
  $scope.product = ezDmpModel.productPointer;
  $scope.relationship = 'derivedFrom';
  $scope.vocab.init(function(){
    $scope.relationships = $scope.vocab.relationships
  });
  $scope.filterProducts = function(product) {
    //{productId : '!specimenMetadata', current: true, id : '!'+product.id}
    if (product.productId !== 'specimenMetadata' && product.current===true && product.id !== $scope.product.id) {
      for (var i = 0;i<$scope.product.relationships.length;i++) {
        if ($scope.product.relationships[i].id===product.id) {
          return false;
        }
      }
      return true;
    }
    return false;
  };
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function(id,relationship) {
    close({ id: id, relationship: relationship }, 500);
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

ezDmpControllers.controller('adminView',['$scope','Account','$location','vocabControl','ModalService','toastr','$http','ENV',
 function($scope,Account,$location,vocabControl,ModalService,toastr,$http,ENV) {
  $scope.acct = Account
  $scope.loginOrAdmin = function(service) {
    if ($scope.acct.isAuthenticated() && $scope.acct.isAdmin()) {
      $location.path("/admin");
    } else {
      $scope.acct.authenticate(service,"/admin");
    }
  };

  $scope.vocab = vocabControl;
  $scope.vocab.init(function(){});

  $scope.addRepo = function(){
    var repo = {
      id:null,
      label:null,
      repository_type:null,
      description:null,
      url:null,
      directorates:[],
      product_types:[],
      subdisciplines:[]
    };
    ModalService.showModal({
      templateUrl: "/inc/editRepo.html",
      controller: "editRepoController",
      preClose: (modal) => {
          modal.element.modal('hide');
      },
      inputs: {
        title: "Add Repository",
        repo: repo,
        edit: false
      }
    }).then(function(modal) {
      modal.element.on('hidden.bs.modal', function () {
          if (!modal.closed) {
            modal.close.then(function(){});  
          }
      });
      modal.element.modal();
    });
  }

  $scope.editRepo = function(repo){
    console.log(repo)
    ModalService.showModal({
      templateUrl: "/inc/editRepo.html",
      controller: "editRepoController",
      preClose: (modal) => {
          modal.element.modal('hide');
      },
      inputs: {
        title: "Edit Repository",
        repo: repo,
        edit: true
      }
    }).then(function(modal) {
      modal.element.on('hidden.bs.modal', function () {
          if (!modal.closed) {
            modal.close.then(function(){});  
          }
      });
      modal.element.modal();
    });
  }

  $scope.deleteRepo = function(repo) {
    ModalService.showModal({
      templateUrl: "/inc/modalAreYouSure.html",
      controller: "areYouSureController",
      preClose: (modal) => {
          modal.element.modal('hide');
      },
      inputs: {
        title: "Delete Repository",
        body: "Are you sure you wish to delete the repository " + repo.id + "?"
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
          $http.post(ENV.api+'deleteRepository',{repo:repo})
            .then(function(response) {
              toastr.success('Repository successfully deleted')
              const index = $scope.vocab.repositories.indexOf(repo);
              if (index > -1) $scope.vocab.repositories.splice(index,1);
             
            })
            .catch(function(response) {
              toastr.error('Repository delete failed: ' + response.status)
            });
        } else {}
        
      });
    });
  }
}]);

ezDmpControllers.controller('editRepoController', [
  '$scope', 'title', 'repo', 'edit', 'close','$http','vocabControl','ENV','toastr',
function($scope,title,repo,edit,close,$http,vocabControl,ENV,toastr) {
  //make copy of original
  console.log(repo)
  var repo_orig = JSON.parse(JSON.stringify(repo));
  $scope.title = title;
  $scope.repo = repo;
  $scope.is_edit = edit;

  $scope.vocab = vocabControl;
  $scope.vocab.init(function(){
    $scope.repo_types = [];
    for (var type of $scope.vocab.repository_types) $scope.repo_types.push(type.id);
    
    $scope.directorates = ['Delete Me'];
    for (var dir of $scope.vocab.directorates) $scope.directorates.push(dir.id);
    $scope.product_types = ['Delete Me'];
    for (var type of $scope.vocab.product_types) $scope.product_types.push(type.id);
    $scope.subdisciplines = ['Delete Me'];
    for (var sub of $scope.vocab.subdisciplines) $scope.subdisciplines.push(sub.id);
  });

  $scope.enableDisable = function () {
    var dirGood = false;
    for (var d of $scope.repo.directorates) {
      if (d.id != '' && d.id != "Delete Me") dirGood = true;
    }
    var ptGood = false;
    for (var p of $scope.repo.product_types) {
      if (p.id != '' && p.id != "Delete Me") ptGood = true;
    }
    var subGood = false;
    for (var s of $scope.repo.subdisciplines) {
      if (s.id != '' && s.id != "Delete Me") subGood = true;
    }
    $scope.complete = $scope.repo.id && $scope.repo.description && dirGood && ptGood && subGood;
  }
  $scope.enableDisable();

  $scope.close = function() {
    //revert to original details
    for (const [key, value] of Object.entries(repo_orig)) {
      $scope.repo[key] = value;
    }
    close(false, 500);
  };
  
  $scope.edit = function() {
    //submit change to database
    $http.post(ENV.api+'updateRepository',{repo:repo})
    .then(function(response) {
      toastr.success('Repository successfully edited')
    })
    .catch(function(response) {
      console.log("Request failed " + response.status);
      toastr.error('Repository edit failed: ' + response.status)
    });
    close(true, 500);
  };

  $scope.add = function() {
    //submit change to database
    $http.post(ENV.api+'newRepository',{repo:repo})
    .then(function(response) {
      toastr.success('Repository successfully created')
      $scope.vocab.repositories.push(repo);
    })
    .catch(function(response) {
      console.log("Request failed " + response.status);
      toastr.error('Repository creation failed: ' + response.status)
    });
    close(true, 500);
  };

  $scope.addDirectorate = function() {
    $scope.repo.directorates.push({});
  }
  $scope.addProductType = function() {
    $scope.repo.product_types.push({});
  }
  $scope.addSubdiscipline = function() {
    $scope.repo.subdisciplines.push({});
  }
}]);
