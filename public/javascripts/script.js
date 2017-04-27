var manageControlApp = angular.module('manageControlApp', ['ngAnimate']);

manageControlApp.controller('manageControl', ['$scope', function($scope) {
    $scope.showForm = "work";
    $scope.curWorkList = [];
    
    $scope.changeForm = function(formKind){
        $scope.showForm = formKind;
    }
    $scope.changeAction = function(actionKind){

    }
    $scope.addWorkToList = function(){
        $scope.curWorkList.push($scope.workList);
    }

    $scope.submitPlacemark = function(){
        $.post("/manage/submitPlacemark", {
            name: $scope.placemarkName,
            latitude: $scope.latNum,
			longitude: $scope.lngNum,
			description: $scope.placemarkDesc,
		    work: $scope.curWorkList
        }, function(data, status){
            if(status=="success"){
                alert("success!");
            }
        });
    }
    
    /*
    $scope.master = {};
    $scope.update = function(user) {
        $scope.master = angular.copy(user);
  };
    $scope.reset = function(form) {
        if (form) {
            form.$setPristine();
            form.$setUntouched();
        }
        $scope.user = angular.copy($scope.master);
    };
    $scope.reset();
    */
}]);