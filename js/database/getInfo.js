var exports = module.exports = {};
var mysql = require('mysql');
var conversion = require('conversionExports.js');

var connection = mysql.createConnection({
	  	host     : 'SAppD',
	  	user     : 'instapark',
	  	password : 'Park4u2',
	  	database : 'parking'
});

connection.connect();

var queryDate;

exports.getInfo = function(parkingArea, viewDate, callback) {
	
	var parkingList = [];
	var dummyDate = new Date(viewDate);
	queryDate = dummyDate.getFullYear()+ "-" + twoDigitMonth(dummyDate.getMonth()) + "-" + twoDigitDay(dummyDate.getDate());

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

	function getReservations(callbackOne) {
		//check reservation
		connection.query('SELECT a.parking_spot, a.handicap, a.small, a.garage_loc, b.request_date, b.reason, b.begin_park_date, b.end_park_date, b.parker_last_name FROM parkingspot a, reservations b WHERE a.parking_spot=b.parking_spot_id and a.garage_loc="'+parkingArea+'" and b.begin_park_date <="' + queryDate + '" and b.end_park_date >= "' + queryDate + '"',  function(err, rows, fields) {		
			if (err) {
				console.log(err);
			} else if (rows.length != 0) { //found some reservations
				for (var i=0; i<rows.length; i++) { //add all reservations to array
					parkingList.push({
						type: 'reservation',
					 	parkingSpot : rows[i].parking_spot,
					 	handicap: rows[i].handicap,
					 	small: rows[i].small,
					 	garage_loc: rows[i].garage_loc,
					 	request_date: rows[i].request_date,
					 	reason: rows[i].reason,
					 	begin_park_date: rows[i].begin_park_date,
					 	end_park_date: rows[i].end_park_date,
					 	parkerName: rows[i].parker_last_name					
					});	
				}
			} else { //no reservations

			}

			callbackOne();
		});	
	}

	function getDefaults(callbackTwo) {
		connection.query('SELECT a.parking_spot, a.handicap, a.small, a.garage_loc, b.last_name FROM parkingspot a, parker b WHERE b.last_name != "Visiting" and a.reservation_parker=0 and a.parking_spot=b.default_park_spot_id and a.garage_loc="'+parkingArea+'"',  function(err, rows, fields) {			
			if (err) {
				console.log(err);
			} else if (rows.length != 0) {
				for (var i=0; i<rows.length; i++) { //add all defaults to array
					parkingList.push({
						type: 'default',
					 	parkingSpot : rows[i].parking_spot,
					 	handicap: rows[i].handicap,
					 	small: rows[i].small,
					 	garage_loc: rows[i].garage_loc,
					 	parkerName: rows[i].last_name					
					});	
				}
			}

			callbackTwo();
		});
	}

	function getEmptys(callbackThree) {
		connection.query('SELECT a.parking_spot, a.garage_loc, a.description, b.last_name FROM parkingspot a, parker b WHERE b.last_name = "Visiting" and a.parking_spot=b.default_park_spot_id and a.garage_loc="'+parkingArea+ '" and a.reservation_parker=0 and a.default_parker = 0',  function(err, rows, fields) {			
			if (err) {
				console.log(err);
			} else if (rows.length != 0) {
				for (var i=0; i<rows.length; i++) { //add all emptys to array
					parkingList.push({
						type: 'empty',
					 	parkingSpot : rows[i].parking_spot,
					 	garage_loc: rows[i].garage_loc,
					 	description: rows[i].description,
					 	parkerName: rows[i].last_name					
					});	
				}
			}

			callbackThree();
		});
	}
	
	getReservations(function() {
		getDefaults(function() {
			getEmptys(function() {
				return callback(parkingList);
			});
		});
	});
}

exports.createReservation = function(info, callback) {
	var data = {
		requesting_userid: info.requestingUserId,
		parking_spot_id: info.parkingSpotId,
		request_date: info.requestDate,
		reason: info.reason,
		begin_park_date: info.beginParkDate,
		end_park_date: info.endParkDate,
		parker_last_name: info.parkerName,
		garage_loc: info.garageLoc
	}

	var addReservation = function(callbackOne) {
		connection.query('INSERT INTO reservations SET ?', data, function(err, result) {
			if (err) {
				console.log(err);
			}

			if (data.begin_park_date <= queryDate && data.end_park_date >= queryDate) {
				connection.query('UPDATE parkingspot SET reservation_parker = "1" WHERE id="'+info.parkingSpotId+'"', function(err, result) {
					if (err) {
					console.log(err);
					}
					callbackOne();
				});
			}
		});
	}

	addReservation(function() {
		callback();
	});
}

exports.updateDefault = function(info, callback) {

	var parkingSpot = info.parkingSpotId;

	var setDefault = function(callbackTwo) {
		connection.query('UPDATE parkingspot SET reservation_parker = "0", default_parker="1" WHERE id="'+parkingSpot.toString()+'"', function(err, result) {		
			if (err) {  
				console.log(err);
			} else {
				// console.log(result); 
				callbackTwo();	
			}
		});
	}

	setDefault(function() {
		callback();
	});
}

exports.getAllDefaults = function(callback) {
	var defaultList = [];

	function isEmptyObject(obj) {
	  for (var key in obj) {
	  	if (Object.prototype.hasOwnProperty.call(obj, key)) {
	      return false;
	    }
	  }
	  return true;
	}

	function getDefaults(callbackTwo) {
		connection.query('SELECT * from parker',  function(err, rows, fields) {			
			if (err) {
				console.log(err);
			} else if (!isEmptyObject(rows)) {
				for (var i=0; i<rows.length; i++) { 
					defaultList.push({
					 	parkingSpot : rows[i].default_park_spot_id,
					 	last_name: rows[i].last_name					
					});	
				}
			} else {
				console.log('SOME ERROR HAS OCCURED');
			}

			callbackTwo();
		});
	}

	getDefaults(function() {
		callback(defaultList);
	});
}

exports.fixReservations = function(viewDate, callback) {
	var reservationsList = [];
	var currentReservations = [];
	var endedReservations = [];

	var getAllReservations = function(callbackOne) {
		connection.query('SELECT * FROM reservations', function(err, rows, fields) {		
			if (err) {
				console.log(err);
			} else {
				for (var i=0; i<rows.length; i++) { 
					reservationsList.push({
					 	parkingSpot : rows[i].parking_spot_id,				 	
					 	beginParkDate: rows[i].begin_park_date,
					 	endParkDate: rows[i].end_park_date					
					});	
				}
				callbackOne();
			}
		});
	}

	var editReservations = function(callbackTwo) {
		var tempDate = new Date(viewDate);
		var todaysDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), 0, 0, 0, 0);

		for (var j=0; j<reservationsList.length; j++) {
			var beginReservationDate = new Date(reservationsList[j].beginParkDate);
			var endReservationDate = new Date(reservationsList[j].endParkDate);

			if (beginReservationDate <= todaysDate && endReservationDate >= todaysDate) { //CURRENT RESERVATION
				currentReservations.push(reservationsList[j].parkingSpot);
			} else {
				endedReservations.push(reservationsList[j].parkingSpot);
			}
		}

		for (var m=0; m<endedReservations.length; m++) {
			connection.query('UPDATE parkingspot SET reservation_parker = "0" WHERE id="'+endedReservations[m].toString()+'"', function(err, result) {		
				if (err) {
					console.log(err);
				}
			});
		}

		for (var k=0; k<currentReservations.length; k++) {
			connection.query('UPDATE parkingspot SET reservation_parker = "1" WHERE id="'+currentReservations[k].toString()+'"', function(err, result) {		
				if (err) {
					console.log(err);
				}
			});
		}

		callbackTwo();
	}

	getAllReservations(function() {
		editReservations(function() {
			// console.log('reservations updated');
		});
	});
}

exports.cancelReservation = function(parkingSpot, beginParkDate, endParkDate, callback) {
	connection.query('DELETE FROM reservations WHERE id>-1 AND parking_spot_id="' + parkingSpot + '" AND begin_park_date="' + beginParkDate + '" AND end_park_date="' + endParkDate + '"', function(err, result) {		
		if (err) {
			console.log(err);
		}

		connection.query('UPDATE parkingspot SET reservation_parker = "0" WHERE id="'+parkingSpot+'"', function(err, result) {		
			if (err) {
				console.log(err);
			}
		});
	});

}
