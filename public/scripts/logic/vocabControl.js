ezDmpControllers.factory('vocabControl',['$http','$rootScope','$q','ENV',function($http,$rootScope,$q,ENV){
    var service = {
      products: null,
      shared_instrumentation: null,
      subdisciplines: null,
      licenses: null,
      repositories: null,
      directorates: null,
      relationships: null,
      divisions: null,
      product_types: null,
      initiatied: false,
      
      init: function(callback) {
        //Pull all vocabs if needed or skip if already done
        if (!service.initiated) {
          service.initiated = true;
          var promises = {
            products : $http.get(ENV.api+'products',{}),
            shared_instrumentation : $http.get(ENV.api+'shared_instrumentation',{}),
            subdisciplines : $http.get(ENV.api+'subdisciplines',{}),
            licenses : $http.get(ENV.api+'licenses',{}),
            repositories : $http.get(ENV.api+'repositories',{}),
            directorates : $http.get(ENV.api+'directorates',{}),
            divisions : $http.get(ENV.api+'divisions',{}),
            product_types : $http.get(ENV.api+'product_types',{}),
            relationships : $http.get(ENV.api+'relation_types',{}) 
          };

          $q.all(promises).then(function(r){
            service.products = r.products.data.data;
            service.shared_instrumentation = r.shared_instrumentation.data.data;
            service.subdisciplines = r.subdisciplines.data.data;
            service.licenses = r.licenses.data.data;
            service.repositories = r.repositories.data.data;
            service.directorates = r.directorates.data.data;
            service.divisions = r.divisions.data.data;
            service.product_types = r.product_types.data.data;
            service.relationships = r.relationships.data.data;
            if (typeof callback ==='function') {
              callback(false);
            }
          });
        } else {
          if (typeof callback ==='function') {
            callback(true);
          }
        }
      },
      
      getDirectorate: function(division){
        for (var i=0;i<service.divisions.length;i++) {
          if (service.divisions[i].id===division) {
            return service.divisions[i].directorate;
          }
        }
        return false;
      },
      dataIncludes: function(haystack,needle){
        for (var i=0;i<haystack.length;i++) {
          if (haystack[i].id===needle){
            return true;
          }
        }
        return false;
      },
      label: function(haystack,needle) {
        var label = service.getFieldById(haystack,needle,'label');
        return (label!==false)?label:needle;
      },
      getFieldById: function(haystack,needle,fieldName) {
        if (!haystack)
          return false;
        for (var i=0;i<haystack.length;i++) {
          if (haystack[i].id===needle){
            return haystack[i][fieldName];
          }
        }
        return false;
      },
      repositoryOptions: function(directorate,subdiscipline,product_type){
        var rows = service.repositories.filter(function(row){
          var status = (!directorate || service.dataIncludes(row.directorates,directorate))
          && (!subdiscipline || service.dataIncludes(row.subdisciplines,subdiscipline) || service.dataIncludes(row.subdisciplines,'general'))
          && (!product_type || service.dataIncludes(row.product_types,product_type));
          return status;
        });
        rows.push({id:'other',label:'Other'});
        return rows;
      },
      subdisciplineOptions: function(directorate,product_type){
        var rows = service.subdisciplines.filter(function(row){
          var status = (!directorate || service.dataIncludes(row.directorates,directorate))
          && (!product_type || service.dataIncludes(row.product_types,product_type));
          return status;
        });
        rows.push({id:'other',label:'Other'});
        return rows;
      }
      
    };
    return (service);
}]);
  