var express = require('express');
var app = express();
var bouyData = require('./bdata.js');

app.get('/bouyData', function (req, res) {
  res.send(bouyData.getBouyData());
});

app.get('/bouyDataStatus', function (req, res) {
  res.send(bouyData.getBouyDataStatus());
});

var server = app.listen(3000, function () {
        bouyData.initBouyData();
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
