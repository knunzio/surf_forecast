var express = require('express');
var app = express();
var bouyData = require('./bdata.js');
var cron = require('cron');

var cronStation;

function setCronStationId(stationId)
{
    cronStation = stationId;
}

var cronJob = cron.job("0 */1 * * * *", function(){
    // perform operation e.g. GET request http.get() etc.
    console.log("acquiring BouyData for station: " + cronStation);
    bouyData.initBouyData(cronStation);
}); 

app.get('/bouyData', function (req, res) {
  res.send(bouyData.getBouyData());
});

app.get('/bouyDataStatus', function (req, res) {
  res.send(bouyData.getBouyDataStatus());
});

var server = app.listen(3000, function () 
{
  var stationId = '46229';

  bouyData.initBouyData(stationId);
  
  var host = server.address().address;
  var port = server.address().port;

  setCronStationId(stationId);
  cronJob.start();

  console.log('Example app listening at http://%s:%s', host, port);
});
