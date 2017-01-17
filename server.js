var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var dataRetriever = require('./js/database/getInfo.js');

app.use(bodyParser.json({}));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/templates', express.static(__dirname + '/templates'));

app.get('/', function(request, response) {
	response.sendFile(__dirname + "/")
});

app.post('/parkingSpot', function(request, response) {
	var data = request.body;
	var area = data.parkingArea;
	var viewDate = data.viewDate;

	dataRetriever.getInfo(area, viewDate, function success(thegoodstuff) {
		var sortedArray = thegoodstuff;
		//console.log(sortedArray);
		sortedArray.sort(function(a, b) {
    		return a.parkingSpot - b.parkingSpot;
		});
		response.send({theData: sortedArray});
	}, function fail() {
		response.send();
	});
});

app.post('/getDefault', function(request, response) {

	dataRetriever.getAllDefaults(function(defaultList) {
		var sortedArray = defaultList;
		sortedArray.sort(function(a, b) {
    		return parseFloat(a.parkingSpot) - parseFloat(b.parkingSpot);
		});
		response.send({theDefaultData: sortedArray});
	});
});

app.post('/createReservation', function(request, response) {
	var data = request.body;

	var info = {
		requestingUserId: data.requestingUserId,
		parkingSpotId: data.parkingSpotId,
		requestDate: data.requestDate,
		reason: data.reason,
		beginParkDate: data.beginParkDate,
		endParkDate: data.endParkDate,
		parkerName: data.parkerName,
		garageLoc: data.garageLoc
	}

	dataRetriever.createReservation(info, function() {
		// console.log('updated');
	});

	response.send();
});

app.post('/removeAddReservations', function(request, response) {
	var data = request.body;
	var viewDate = data.viewDate;

	dataRetriever.fixReservations(viewDate, function() {
		// console.log('reservations fixed');
	});

	response.send();
});

app.post('/cancelReservation', function(request, response){
	var data = request.body;
	var parkingSpot = data.parkingSpot;
	var beginParkDate = data.beginParkDate;
	var endParkDate = data.endParkDate;

	dataRetriever.cancelReservation(parkingSpot, beginParkDate, endParkDate, function() {
		// console.log('reservation canceled');
	});

	response.send();
});

app.listen(8000, function() {
	console.log("Listening on port 8000");
});
