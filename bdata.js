var http = require('http');

var host='http://www.ndbc.noaa.gov';
var bouyNumber = '46229';
var fortyFiveDayData = [];
var status = new DataStatus('false');

//#YY  MM DD hh mm WVHT  SwH  SwP  WWH  WWP SwD WWD  STEEPNESS  APD MWD
//#yr  mo dy hr mn    m    m  sec    m  sec  -  degT     -      sec degT
function BouyData(SID,YY,MM,DD,hh,mm,WVHT,SwH,SwP,WWH,WWP,SwD,WWD,STEEPNESS,APD,MWD)
{
    //Station or Buoy Identifier
    this.stationid = SID;
    //Timestamp of data collection
    this.timeStamp = new Date(YY,MM,DD,hh,mm).getTime()
    //year
    this.year=YY;
    //month
    this.month=MM;
    //day
    this.day=DD;
    //hour
    this.hour=hh;
    //minute
    this.minute=mm;
    //WaveHeight (meters)
    this.WaveHeightMeters=WVHT;
    //Swell Height (meters)
    this.SwellHeightMeters=SwH;
    //Swell Period(sec)
    this.SwellPeriodSeconds=SwP;
    //Wind Wave Height(meters)
    this.WindWaveHeightMeters=WWH;
    //Wind Wave Period(sec)
    this.WindWavePeriodMeters=WWP;
    //Swell Direction
    this.SwellDirection=SwD;
    //Wind Wave Direction
    this.WindWaveDirection=WWD;
    //Steepness
    this.WaveSteepness=STEEPNESS;
    //Average Period
    this.AveragePeriodSeconds=APD;
    //Mean Wave Direction
    this.MeanWaveDirection=MWD;

    BouyData.prototype.getInfo = function () {
        return JSON.stringify(this);
    }
}

function DataStatus(status)
{
    this.status=status;

    DataStatus.prototype.getInfo = function() {
        return JSON.stringify(this);
    }
}


function clearBouyData()
{
    fortyFiveDayData = [];
}

function buildBouyDataFromResponse(stationId, data ){

    var responseData = data.join('');
    var lines = responseData.split("\n");

    for (var ii = 0; ii < lines.length; ii++)
    {
        if(typeof lines[ii] === 'undefined')
           continue;

        if(lines[ii].match(/^#/g))
            continue;

        var splitLine = lines[ii].split(/\s+/);

        var bouyData = new BouyData(stationId,
            splitLine[0],
            splitLine[1],
            splitLine[2],
            splitLine[3],
            splitLine[4],
            splitLine[5],
            splitLine[6],
            splitLine[7],
            splitLine[8],
            splitLine[9],
            splitLine[10],
            splitLine[11],
            splitLine[12],
            splitLine[13],
            splitLine[14]);
        fortyFiveDayData.push(bouyData);
    }

    status = new DataStatus('true'); 
}

function getDataForStation(stationId)
{
   console.log("stationid: " + stationId);
   http.get(host+ '/data/realtime2/'+stationId+'.spec', function(res){

       var responseParts = [];
       res.setEncoding('utf8');

       res.on("data", function(chunk){
           responseParts.push(chunk.trim());
       });
       res.on("end", function(){
           clearBouyData();
           buildBouyDataFromResponse(stationId, responseParts);
       });
   });
}

function getBouyDataArray()
{
    return fortyFiveDayData;
}

function getStationDataForTimeInterval(stationid, timeInterval)
{

}


module.exports = {
     initBouyData: function(stationid)
     {
         getDataForStation(stationid);
     },
     getBouyData: function()
     {
         return getBouyDataArray();
     },
     getBouyDataStatus: function()
     {
         return status;
     },
     getStationData: function(stationId, timeInterval)
     {
         return getStationDataForTimeInterval(stationId, timeInterval)
     }
};

