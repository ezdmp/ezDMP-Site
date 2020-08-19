ezDmpControllers.factory('ezDmpModel',['$http','$rootScope','vocabControl','ENV',function($http,$rootScope,vocabControl,ENV){
    var service = {
      dmp : null,
      dmp_id : null,
      productPointer: null,
      metadataPointer: null,
      getDmp : function(id,callback){
        $http.post(ENV.api+'dmp',{id:id})
          .then(function(response) {
            service.dmp = response.data.dmp;
            service.dmp_id = id;
            service.productPointer = service.metadataPointer = null;
            service.modified = response.data.modified;
            if (typeof callback === 'function')
              callback(response);
          })
          .catch(function(response) {
            //console.log("Request failed " + response.status);
          });
      },
      newDmp : function(callback){
        $http.post(ENV.api+'newDmp',{})
          .then(function(response) {
            service.dmp = response.data.dmp;
            service.dmp_id = response.data.id;
            service.productPointer = service.metadataPointer = null;
            if (typeof callback === 'function')
              callback(response);
          })
          .catch(function(response) {
            //console.log("Request failed " + response.status);
          });
      },
      copyDmp : function(dmp_id,callback){
        $http.post(ENV.api+'copyDmp',{dmp_id:dmp_id})
          .then(function(response) {
            if (typeof callback === 'function')
              callback(response);
          })
          .catch(function(response) {
            //console.log("Request failed " + response.status);
          });
      },
      saveDmp : function(callback){
        $http.post(ENV.api+'updateDmp',{dmp_id:service.dmp_id,dmp:angular.toJson(service.dmp)})
          .then(function(response) {
            if (typeof callback === 'function')
              callback(response);
          })
          .catch(function(response) {
            //console.log("Request failed " + response.status);
          });
      },
      newProduct: function(type,callback){
        $http.post(ENV.api+'newProduct',{product_type:type,dmp_id:service.dmp_id}).then(function(response){
          service.dmp = response.data.dmp;
          service.productFromId(response.data.product_id);
          callback(response.data);
        });
      },
      productIndex: function(product_id) {
        for (var i=0;i<service.dmp.products.length;i++) {
          if (service.dmp.products[i].id===product_id) {
            return i;
          }
        }
        return false;
      },
      metadataIndex: function(idx) {
        if (service.dmp.products[idx].relationships.length) {
          for (var j=0;j<service.dmp.products[idx].relationships.length;j++) {
            if (service.dmp.products[idx].relationships[j].relationship==='specimenMetadata') {
              return service.productIndex(service.dmp.products[idx].relationships[j].id);
            }
          }
        }
        return false;
      },
      addRelationship: function(id,relationship) {
        service.productPointer.relationships.push({
          id: id,
          relationship: relationship
        });
        var reciprocalProductIdx = service.productIndex(id);
        var reciprocalRelationship = vocabControl.getFieldById(vocabControl.relationships,relationship,'reciprocal');
        service.dmp.products[reciprocalProductIdx].relationships.push({
          id: service.productPointer.id,
          relationship:reciprocalRelationship
        });
      },
      getRelationshipIndex: function(id,idx){
        if (typeof idx === 'undefined') {
          idx = service.productIndex(service.productPointer.id);
        }
        for(var i = 0;service.dmp.products[idx].relationships.length;i++){
          if (service.dmp.products[idx].relationships[i].id === id)
            return i;
        }
        return false;
      },
      removeRelationship: function(id,pIdx) {
        if (typeof pIdx === 'undefined') {
          pIdx = service.productIndex(service.productPointer.id);
        }
        var idx = service.getRelationshipIndex(id,pIdx);
        var reciprocalProductIdx = service.productIndex(id);
        var reciprocalIdx = false;
        if (reciprocalProductIdx !== false)
          reciprocalIdx = service.getRelationshipIndex(service.dmp.products[pIdx].id,reciprocalProductIdx);
        if (idx !== false)
          service.dmp.products[pIdx].relationships.splice(idx,1);
        if (reciprocalIdx !== false) {
          service.dmp.products[reciprocalProductIdx].relationships.splice(reciprocalIdx,1);
        }
      },
      /*editRelationshipType: function(id,relationship) {
        var idx = service.getRelationshipIndex(id);
        if (idx!==false)
          service.productPointer.relationships[idx].relationship = relationship;
      },*/
      productFromId: function(product_id){
        service.productPointer = service.metadataPointer = null;
        var idx = service.productIndex(product_id);
        service.productPointer = service.dmp.products[idx];
        var midx = service.metadataIndex(idx);
        if (midx !== false)
          service.metadataPointer = service.dmp.products[midx];
         
      },
      deleteProduct: function(product_id){
        service.productPointer = service.metadataPointer = null;
        var idx = service.productIndex(product_id);
        var midx = service.metadataIndex(idx);
        if (typeof service.dmp.deletedProducts === 'undefined') {
          service.dmp.deletedProducts = [];
        }
        if (service.dmp.products[idx].relationships.length) {
          for (var i = 0; i<service.dmp.products[idx].relationships.length; i++) {
            console.log(service.dmp.products[idx].relationships[i]);
            if (service.dmp.products[idx].relationships[i].relationship === 'specimenMetadata')
              continue;
            service.removeRelationship(service.dmp.products[idx].relationships[i].id,idx);
          }
        }
        service.dmp.deletedProducts.push(service.dmp.products[idx]);
        service.dmp.products.splice(idx, 1);
        if (midx !== false) {
          //Spliced array will be one shorter which may have affected metadata index
          if (idx<midx)
            midx -= 1;
          service.dmp.deletedProducts.push(service.dmp.products[midx]);
          service.dmp.products.splice(midx, 1);
        }
      },
      reorderProduct: function(product_id,moveBy){
        service.productPointer = service.metadataPointer = null;
        var idx = service.productIndex(product_id);
        //If new index is greater than length of array, change moveBy so new index is length - 1
        if (idx+moveBy>=service.dmp.products.length) moveBy = service.dmp.products.length - idx - 1;
        //If new index is less than 0, change moveBy so new index = 0
        if (idx+moveBy<0) moveBy = 0 - idx;
        //Splice out value at old index then splice it in at new index
        service.dmp.products.splice(idx+moveBy, 0, service.dmp.products.splice(idx, 1)[0]);
        //Set index to new index
        idx = idx+moveBy;
        //Grab the metadata index
        var midx = service.metadataIndex(idx);
        if (midx !== false) {
          //Splice the metadata index directly after the original index
          service.dmp.products.splice(idx+((midx<idx)?0:1), 0, service.dmp.products.splice(midx, 1)[0]);
        }
        //Set product index
        service.productFromId(product_id);
      }
    };
    return (service);
}]);
