var express = require('express');
var app = express();
var bouyData = require('./bdata.js');
var cron = require('cron');

var cronJob = cron.job("0 */1 * * * *", function(){
    // perform operation e.g. GET request http.get() etc.
    console.log("acquiring BouyData...");
    bouyData.initBouyData();
}); 

app.get('/bouyData', function (req, res) {
  res.send(bouyData.getBouyData());
});

app.get('/bouyDataStatus', function (req, res) {
  res.send(bouyData.getBouyDataStatus());
});

var server = app.listen(3000, function () {

  bouyData.initBouyData('46229');
  
  var host = server.address().address;
  var port = server.address().port;

  cronJob.start();

  console.log('Example app listening at http://%s:%s', host, port);
});
