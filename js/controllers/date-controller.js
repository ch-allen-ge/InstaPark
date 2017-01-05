angular.module('InstaPark').controller('DateController', ['$scope', 'parkingFactory', function($scope, parkingFactory) {
	var store = this;

	var tempDate = new Date();
    var todaysDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0, 0);
    store.viewDate = todaysDate;

    store.setDate = function() {
    	parkingFactory.setDateSelected(store.viewDate);
    }

    store.setDate();
}]);