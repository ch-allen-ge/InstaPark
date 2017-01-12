angular.module('InstaPark').factory('parkingFactory', function() {
	
	var EastCars = [];
	var WestCars = [];
	var defaultCars = [];
	var currentCarSelected = null;
	var currentGarageLoc = '';
	var currentDate = null;

	var setDateSelected = function(date) {
		currentDate = date;
	}

	var getDateSelected = function() {
		return currentDate;
	}

	var setCarSelected = function(num) {
		currentCarSelected = num;
	}

	var getCarSelected = function() {
		return currentCarSelected;
	}

	var setGarageLoc = function(area) {
		currentGarageLoc = area;
	} 

	var getGarageLoc = function() {
		return currentGarageLoc;
	}

	var setEastCars = function(array) {
		EastCars = array;
	}

	var setWestCars = function(array) {
		WestCars = array;
	}


	var setDefaultCars = function(array) {
		defaultCars = array;
	}

	var getEastCars = function(num) {
		var spot = EastCars[num];
		return getCars(spot);
	}

	var getWestCars = function(num) {
		var spot = WestCars[num];
		return getCars(spot);
	}

	var getDefaultCars = function(num) {
		return defaultCars[num-1];
	}

	var getCars = function(spot, area) {
		if (spot.type === 'reservation') {
			var requestDate = new Date(spot.request_date);
			var beginParkDate = new Date(spot.begin_park_date);
			var endParkDate = new Date(spot.end_park_date);

			return {
				type: 'reservation',
				parkingSpot: spot.parkingSpot,
				garageLoc: spot.garage_loc, 
				requestDateMonth: requestDate.getMonth() + 1,
				requestDateDay: requestDate.getDate(),			
				requestDateYear: requestDate.getFullYear(),
				reason: spot.reason,
				beginParkDateMonth: beginParkDate.getMonth() + 1,
				beginParkDateDay: beginParkDate.getDate(),
				beginParkDateYear: beginParkDate.getFullYear(),
				endParkDateMonth: endParkDate.getMonth() + 1,
				endParkDateDay: endParkDate.getDate(),
				endParkDateYear: endParkDate.getFullYear(),
				parkerName: spot.parkerName
			}
		} else if (spot.type === 'default') {
			return {
				type: 'default',
				parkingSpot: spot.parkingSpot,
				garageLoc: spot.garage_loc,
				parkerName: spot.parkerName
			}
		} else if (spot.type === 'empty') {
			return {
				type: 'empty',
				parkingSpot: spot.parkingSpot,
				garageLoc: spot.garage_loc,
				description: spot.description
			}
		} else {
			return 'error';
		}
	}

	return {
		setDateSelected: setDateSelected,
		getDateSelected: getDateSelected,
		setCarSelected: setCarSelected,
		getCarSelected: getCarSelected,
		setGarageLoc: setGarageLoc,
		getGarageLoc: getGarageLoc,
		setEastCars: setEastCars,
		getEastCars: getEastCars,
		setWestCars: setWestCars,
		getWestCars: getWestCars,
		setDefaultCars: setDefaultCars,
		getDefaultCars: getDefaultCars,
		defaultCars: defaultCars,
		EastCars: EastCars,
		NWSWCards: WestCars
	};
});