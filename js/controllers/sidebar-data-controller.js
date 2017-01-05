angular.module('InstaPark').controller('sidebarDataController', ['$http', '$scope','parkingFactory', function($http, $scope, parkingFactory) {
	$scope.parkingSpot = null;
	$scope.garageLoc = null;
	$scope.currentCar = null;
	$scope.currentDefaulter = null;
	$scope.statusList = allStatus;
	$scope.selectedStatus = null;

	//RESERVATION DATA
	var currentDate = new Date();
	$scope.newBeginParkDate = (currentDate.getMonth()+1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();  
	$scope.newEndParkDate = (currentDate.getMonth()+1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
	$scope.reason = "";
	$scope.reservationParkerName = "";

	//DEFAULT DATA
	$scope.defaultParkerName = "";

	var store = this;

	store.updateData = function() {
		$scope.garageLoc = parkingFactory.getGarageLoc();
		var carIndex = parkingFactory.getCarSelected();
		$scope.currentDefaulter = null;

		if ($scope.garageLoc === 'NE') {
			$scope.parkingSpot = carIndex +16;
			$scope.currentDefaulter = parkingFactory.getDefaultCars($scope.parkingSpot);
			$scope.currentCar = parkingFactory.getNortheastCars(carIndex+1);
		} else if ($scope.garageLoc === 'SE') {
			$scope.parkingSpot = carIndex+30;
			$scope.currentDefaulter = parkingFactory.getDefaultCars($scope.parkingSpot);
			$scope.currentCar = parkingFactory.getSoutheastCars(carIndex+1);
		} else if ($scope.garageLoc === 'SW') {
			$scope.parkingSpot = carIndex+47;
			$scope.currentDefaulter = parkingFactory.getDefaultCars($scope.parkingSpot);
			$scope.currentCar = parkingFactory.getSouthwestCars(carIndex+1);
		} else if ($scope.garageLoc === 'NW') {
			$scope.parkingSpot = carIndex+1;
			$scope.currentDefaulter = parkingFactory.getDefaultCars($scope.parkingSpot);
			$scope.currentCar = parkingFactory.getNorthwestCars(carIndex+1);
		}

		if ($scope.currentCar.type === 'reservation') {
			$scope.selectedStatus = 'reserved';
			$scope.newBeginParkDate = $scope.currentCar.beginParkDateMonth + '/' + $scope.currentCar.beginParkDateDay + '/' + $scope.currentCar.beginParkDateYear;
			$scope.newEndParkDate = $scope.currentCar.endParkDateMonth + '/' + $scope.currentCar.endParkDateDay + '/' + $scope.currentCar.endParkDateYear;
			$scope.reason = $scope.currentCar.reason;
			$scope.reservationParkerName = $scope.currentCar.parkerName;

			$scope.defaultParkerName = "";
		} else if ($scope.currentCar.type === 'default') {
			$scope.selectedStatus = 'default';
			$scope.defaultParkerName = $scope.currentCar.parkerName;

			$scope.newBeginParkDate = (currentDate.getMonth()+1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
			$scope.newEndParkDate = (currentDate.getMonth()+1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
			$scope.reason = "";
			$scope.reservationParkerName = "";
		} else if ($scope.currentCar.type === 'empty') {
			$scope.selectedStatus = 'empty';

			$scope.newBeginParkDate = "";
			$scope.newEndParkDate = "";
			$scope.reason = "";
			$scope.reservationParkerName = "";

			$scope.newBeginParkDate = (currentDate.getMonth()+1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
			$scope.newEndParkDate = (currentDate.getMonth()+1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
			
			$scope.defaultParkerName = "";
		}
	}

	$scope.ifDefault = function() {
		if ($scope.selectedStatus === 'default') {
			$scope.defaultParkerName = $scope.currentDefaulter.last_name;
		}
	}

	store.closeNav = function() {
	    document.getElementById("mySidenav").style.width = "0";
	    document.getElementById("main").style.marginLeft = "0";
	    document.body.style.backgroundColor = "white";
	}

	store.updateDatabase = function() {
		if ($scope.selectedStatus === 'reserved') { //MAKING A NEW RESERVATION
			var todaysDate = new Date();
			 $http({
                    method: 'POST',
                    url: '/updateReservation',
                    data: {
                    	requestingUserId: 1,
                        parkingSpotId: $scope.parkingSpot,
                        requestDate: todaysDate.getFullYear() + '-' + twoDigitMonth(todaysDate.getMonth()) + '-' + twoDigitDay(todaysDate.getDate()),
                        reason: $scope.reason,
                        beginParkDate: $scope.newBeginParkDate.getFullYear() + '-' + twoDigitMonth($scope.newBeginParkDate.getMonth()) + '-' + twoDigitDay($scope.newBeginParkDate.getDate()),
                        endParkDate: $scope.newEndParkDate.getFullYear() + '-' + twoDigitMonth($scope.newEndParkDate.getMonth()) + '-' + twoDigitDay($scope.newEndParkDate.getDate()),
                        parkerName: $scope.reservationParkerName,
                        garageLoc: 	$scope.garageLoc
                    }
                });
		} else if ($scope.selectedStatus === 'default') { //SETTING SPOT TO DEFAULT
			$http({
                    method: 'POST',
                    url: '/updateDefault',
                    data: {
                        parkingSpotId: $scope.parkingSpot                   
                    }
                });
		} else if ($scope.selectedStatus === 'empty') { //SETTING SPOT TO EMPTY
			$http({ 
                    method: 'POST',
                    url: '/updateEmpty',
                    data: {
                        parkingSpotId: $scope.parkingSpot                   
                    }
                });
		} else {
			console.log('ERROR UPDATING');
		}
	}

}]);

var allStatus = ['reserved', 'default', 'empty'];

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

angular.module('InstaPark').directive("sidebarEdit", function() {
    return {
        restrict: "E",
        templateUrl: "../templates/sidebar/index.html"
    };
});

angular.module('InstaPark').directive("reservationData", function() {
    return {
        restrict: "E",
        templateUrl: "../templates/sidebarData/reservationData.html"
    };
});

angular.module('InstaPark').directive("defaultData", function() {
    return {
        restrict: "E",
        templateUrl: "../templates/sidebarData/defaultData.html"
    };
});

angular.module('InstaPark').directive("emptyData", function() {
    return {
        restrict: "E",
        templateUrl: "../templates/sidebarData/emptyData.html"
    };
});