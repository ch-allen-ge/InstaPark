angular.module('InstaPark').controller('NorthEastController', ['$http', '$scope', 'parkingFactory', function($http, $scope, parkingFactory) {

    var store = this;
    store.displayInfo = null; 
    store.length = 0;
    $scope.northeastCarArray = [];

    store.getParkingData = function() {
        $http({
            method: 'POST',
            url: '/parkingSpot',
            data: {
              parkingArea: 'NE',
              viewDate: parkingFactory.getDateSelected()
            }
        })
        .then(function transferData(response) {
            store.displayInfo = response.data.theData; 
            store.length = store.displayInfo.length;
            parkingFactory.setNortheastCars(store.displayInfo);
            // console.log(store.displayInfo);       
        }).then(function showCars() {
            var theArray = [];
            for (var i=0; i<store.length; i++) {
              if (store.displayInfo[i].type === 'default') {
                  theArray.push('/images/redCarFacingUp.png');
              } else if (store.displayInfo[i].type === 'reservation') {
                  theArray.push('/images/yellowCarFacingUp.png');
              } else {
                  theArray.push('/images/emptyCarFacingUp.png');
              }
            }

            $scope.northeastCarArray = theArray;
        })
    }

    store.getDefaultData = function() {
        $http({
            method: 'POST',
            url: '/getDefault'
        })
        .then(function transferData(response) {
            var array = response.data.theDefaultData
            parkingFactory.setDefaultCars(array);
        })
    }

    store.removeAddReservations = function(viewDate) {
        var tempDate = new Date(viewDate);
        var todaysDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0, 0);

        $http({
            method: 'POST',
            url: '/removeAddReservations',
            data: {
                viewDate: todaysDate
            }
        }).then(function getparking(response) {
            store.getParkingData();
        }).then(function getdefault(response) {
            store.getDefaultData();
        })
    }

    store.changeDate = function() {
        // console.log(parkingFactory.getDateSelected());
        store.removeAddReservations(parkingFactory.getDateSelected());
    }

    store.changeDate();
}]);

angular.module('InstaPark').directive("northeastView", function() {
    return {
        restrict: "E",
        templateUrl: "../templates/northeast/index.html"
    };
});
