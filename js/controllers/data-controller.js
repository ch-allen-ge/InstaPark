angular.module('InstaPark').controller('DataController', ['$http', '$scope','$mdDialog','parkingFactory', function($http, $scope, $mdDialog, parkingFactory) {

    var store = this;
    store.data = "";
    store.displayNewReservationButton = false;
    store.displayDeleteButton = false;
    store.beginParkDate = "";
    store.endParkDate = "";

    store.clearText = function() {
      store.data = "";
      store.displayNewReservationButton = false;
      store.displayDeleteButton = false;
    };

    store.showNESEData = function(num) {     
      var data = parkingFactory.getNESECars(num-16);

      displayData(data);
      parkingFactory.setCarSelected(num);
    }

    store.showNWSWData = function(num, area) {
      var spotNum;

      if (area === 'SW') {
        spotNum = num-32;
      } else {
        spotNum = num-1;
      }

      var data = parkingFactory.getNWSWCars(spotNum);
      displayData(data);
      parkingFactory.setCarSelected(num);
    }  

    function twoDigitMonth(month) {
      var theMonth = month+1; 
      if (theMonth < 10) {
        return "0" + theMonth;
      }

      return theMonth;
    };

    function twoDigitDay(day) {
        if (day < 10) {
          return "0" + day;
        }

        return day;
    };

    function displayData(data) {
      if (data.type === 'reservation') {
        store.data = 'Parking Spot #' + data.parkingSpot + '\n' + 
                   'Garage Location: ' + data.garageLoc + '\n' + 
                   'Status: Reserved' + '\n' +
                   'Request Date: ' + data.requestDateMonth + '/' + data.requestDateDay + '/' + data.requestDateYear + '\n' +
                   'Begin Park Date: ' + data.beginParkDateMonth + '/' + data.beginParkDateDay + '/' + data.beginParkDateYear + '\n' + 
                   'End Park Date: ' + data.endParkDateMonth + '/' + data.endParkDateDay + '/' + data.endParkDateYear + '\n' +
                   'Parker: ' + data.parkerName + '\n' +
                   'Reason: ' + data.reason;

        store.beginParkDate = data.beginParkDateYear + twoDigitMonth(data.beginParkDateMonth-1) + twoDigitDay(data.beginParkDateDay);
        store.endParkDate = data.endParkDateYear + twoDigitMonth(data.endParkDateMonth-1) + twoDigitDay(data.endParkDateDay);
        store.displayDeleteButton = true;
        store.displayNewReservationButton = false;
      } else if (data.type === 'default') {
        store.data = 'Parking Spot #' + data.parkingSpot + '\n' + 
                   'Garage Location: ' + data.garageLoc + '\n' +
                   'Status: Default' + '\n' +
                   'Parker: ' + data.parkerName;

        store.displayDeleteButton = false;
        store.displayNewReservationButton = true;
      } else if (data.type === 'empty') {
        store.data = 'Parking Spot #' + data.parkingSpot + '\n' +
                   'Garage Location: ' + data.garageLoc + '\n' +
                   'Status: Empty';

      } else {
        store.data = 'error';
      }
    }
}]);