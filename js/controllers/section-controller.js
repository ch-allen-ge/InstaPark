angular.module('InstaPark').controller('SectionController', ['$http', '$scope','$q', '$mdDialog', 'parkingFactory', function($http, $scope, $q, $mdDialog, parkingFactory) {

    var store = this;
    store.NESEObjectArray = null;
    $scope.NESECarArray = []; //16-29 NE, 30-46 SE
    $scope.NWSWCarArray = []; //1-15 NW, 47-63 SW

    store.getParkingData = function(section) {
        if (section === 'NESE') {
            $scope.NESECarArray = [];

            $http({
              method: 'POST',
              url: '/parkingSpot',
              data: {
                parkingArea: 'NESE',
                viewDate: parkingFactory.getDateSelected()
              }
            })
            .then(function transferData(response) {
              var neseArray = response.data.theData;

              console.log(neseArray);

              store.NESEObjectArray = neseArray;
              parkingFactory.setNESECars(store.NESEObjectArray); 
            })
            .then(function showCars() {
              var theArray = [];
              for (var i=0; i<store.NESEObjectArray.length; i++) {
                if (store.NESEObjectArray[i].type === 'default') {
                  theArray.push('/images/redCarFacingUp.png');
                } else if (store.NESEObjectArray[i].type === 'reservation') {
                  theArray.push('/images/yellowCarFacingUp.png');
                }
              }

              $scope.NESECarArray = theArray;
            })
        } else if (section === 'NWSW') {

            $scope.NWSWCarArray = [];

            $http({
              method: 'POST',
              url: '/parkingSpot',
              data: {
                parkingArea: 'NWSW',
                viewDate: parkingFactory.getDateSelected()
              }
            })
            .then(function transferData(response) {
              var nwswArray = response.data.theData;

              console.log(nwswArray);

              store.NWSWObjectArray = nwswArray;
              parkingFactory.setNWSWCars(store.NWSWObjectArray);
              //console.log(store.NWSWObjectArray);  
            })
            .then(function showCars() {
              var theArray = [];
              for (var i=0; i<store.NWSWObjectArray.length; i++) {
                if (store.NWSWObjectArray[i].type === 'default') {
                  theArray.push('/images/redCarFacingUp.png');
                } else if (store.NWSWObjectArray[i].type === 'reservation') {
                  theArray.push('/images/yellowCarFacingUp.png');
                } else {
                  theArray.push('/images/emptyCarFacingUp.png');
                }
              }

              $scope.NWSWCarArray = theArray;
              //console.log($scope.NWSWCarArray);
            })
        }
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
            store.getParkingData('NESE');
            store.getParkingData('NWSW');
        }).then(function getdefault(response) {
            store.getDefaultData();
        })
    }

    store.changeDate = function() {
        store.removeAddReservations(parkingFactory.getDateSelected());
    }

    store.createReservation = function(data) {
        var todaysDate = new Date();
        var parkingSpot = parkingFactory.getCarSelected();
        $http({
            method: 'POST',
            url: '/createReservation',
            data: {
                requestingUserId: 1,
                parkingSpotId: parkingSpot,
                requestDate: todaysDate.getFullYear() + '-' + twoDigitMonth(todaysDate.getMonth()) + '-' + twoDigitDay(todaysDate.getDate()),
                reason: data.reason,
                beginParkDate: data.beginParkDate.getFullYear() + '-' + twoDigitMonth(data.beginParkDate.getMonth()) + '-' + twoDigitDay(data.beginParkDate.getDate()),
                endParkDate: data.endParkDate.getFullYear() + '-' + twoDigitMonth(data.endParkDate.getMonth()) + '-' + twoDigitDay(data.endParkDate.getDate()),
                parkerName: data.parkerName,
                garageLoc:  'AT'
            }
        })
        .then(function sucessfulAdd(response) {
            console.log('success');
            store.getParkingData('NESE');
            store.getParkingData('NWSW');
        }, function failedAdd() {
          console.log('error')
        });
    }

    store.showAdvanced = function(ev) {
      $mdDialog.show({
        controller: ReservationController,
        templateUrl: '/templates/reservation.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true
      })
      .then(function(result) {        
        store.createReservation({
            parkerName: result.parkerName,
            beginParkDate: result.beginParkDate,
            endParkDate: result.endParkDate,
            reason: result.reason
        });
      }, function() {
        console.log('You cancelled the reservation')
      });
    }

    function ReservationController($scope, $mdDialog) {
      $scope.parkerName = "";
      $scope.beginParkDate = parkingFactory.getDateSelected();
      $scope.endParkDate = parkingFactory.getDateSelected();
      $scope.reason = "";

      $scope.changeDate = function() {
        $scope.endParkDate = $scope.beginParkDate;
      }

      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.submit = function() {
        var info = {
            parkerName: $scope.parkerName,
            beginParkDate: $scope.beginParkDate,
            endParkDate: $scope.endParkDate,
            reason: $scope.reason
        }
        $mdDialog.hide(info);
      };
    }

    var twoDigitMonth = function(month) {
        var theMonth = month+1; 
        if (theMonth < 10) {
            return "0" + theMonth;
        }

        return theMonth;
    };

    var twoDigitDay = function(day) {
        if (day < 10) {
            return "0" + day;
        }

        return day;
    };

    store.deleteReservation = function() {
      //16-29 NE, 30-46 SE
      //1-15 NW, 47-63 SW
      var parkingSpot = parkingFactory.getCarSelected();
      var carObject;
      var beginParkDate;
      var endParkDate;

      if (parkingSpot>=16 && parkingSpot<=46) {
        carObject = parkingFactory.getNESECars(parkingSpot-16);
      } else if (parkingSpot>=1 && parkingSpot<=15) {
        carObject = parkingFactory.getNWSWCars(parkingSpot-1);
      } else {
        carObject = parkingFactory.getNWSWCars(parkingSpot-32);
      }

      theBeginParkDate = carObject.beginParkDateYear+''+twoDigitMonth(carObject.beginParkDateMonth-1)+''+twoDigitDay(carObject.beginParkDateDay);
      theEndParkDate = carObject.endParkDateYear+''+twoDigitMonth(carObject.endParkDateMonth-1)+''+twoDigitDay(carObject.endParkDateDay);
      console.log(theBeginParkDate + " " + theEndParkDate);

      $http({
            method: 'POST',
            url: '/cancelReservation',
            data: {
              parkingSpot: parkingSpot,
              beginParkDate: theBeginParkDate,
              endParkDate: theEndParkDate
            }
        })
        .then(function successfulDelete(response) {
            console.log(response);
            store.changeDate();
        }, function failed() {
            console.log('error');
        })
    }

    store.showConfirm = function(ev) {
      var confirm = $mdDialog.confirm()
            .title('Would you like to delete this reservation?')
            //.textContent('Reservsation for spot #' + store.currentSpot + ' for ' + formattedBeginDate + ' - ' + formattedEndDate + ' will be deleted')
            .targetEvent(ev)
            .ok('Delete Reservation')
            .clickOutsideToClose(true)
            .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        store.deleteReservation();
      });
    };

    store.changeDate();
}]);

angular.module('InstaPark').directive("neseView", function() {
    return {
        restrict: "E",
        templateUrl: "../templates/sections/nese.html"
    };
});

angular.module('InstaPark').directive("nwswView", function() {
    return {
        restrict: "E",
        templateUrl: "../templates/sections/nwsw.html"
    };
});

