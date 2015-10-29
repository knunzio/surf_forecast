var http = require('http');

//#YY  MM DD hh mm WVHT  SwH  SwP  WWH  WWP SwD WWD  STEEPNESS  APD MWD
//#yr  mo dy hr mn    m    m  sec    m  sec  -  degT     -      sec degT
function BouyData(YY,MM,DD,hh,mm,WVHT,SwH,SwP,WWH,WWP,SwD,WWD,STEEPNESS,APD,MWD)
{
    //year
    this.YY=YY;
    //month
    this.MM=MM;
    //day
    this.DD=DD;
    //hour
    this.hh=hh;
    //minute
    this.mm=mm;
    //WaveHeight (meters)
    this.WVHT=WVHT;
    //Swell Height (meters)
    this.SwH=SwH;
    //Swell Period(sec)
    this.SwP=SwP;
    //Wind Wave Height(meters)
    this.WWH=WWH;
    //Wind Wave Period(sec)
    this.WWP=WWP;
    //Swell Direction
    this.SwD=SwD;
    //Wind Wave Direction
    this.WWD=WWD;
    //Steepness
    this.STEEPNESS=STEEPNESS;
    //Average Period
    this.APD=APD;
    //Mean Wave Direction
    this.MWD=MWD;

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

function buildBouyDataFromResponse(data){

    var responseData = data.join('');
    var lines = responseData.split("\n");

    for (var ii = 0; ii < lines.length; ii++)
    {
        if(typeof lines[ii] === 'undefined')
           continue;

        //console.log('Line: ' + lines[ii]);
        if(lines[ii].match(/^#/g))
            continue;

        var splitLine = lines[ii].split(/\s+/);

        var bouyData = new BouyData(splitLine[0],
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
        //console.log('BouyData: ' + bouyData.getInfo());
        fortyFiveDayData.push(bouyData);
    }

    //console.log("logging array " + JSON.stringify(fortyFiveDayData));
    status = new DataStatus('true'); 
}

function getDataForStation()
{
         var iterator = 0;
         //http.get({host: host, path:'/data/realtime2/'+bouyNumber+'.spec'}, function(res){
         http.get(host+ '/data/realtime2/'+bouyNumber+'.spec', function(res){

             var responseParts = [];
             res.setEncoding('utf8');

             res.on("data", function(chunk){
                 responseParts.push(chunk.trim());
             });
             res.on("end", function(){
                 clearBouyData();
                 buildBouyDataFromResponse(responseParts);
             });
         });
}

function getBouyDataArray()
{
    //return JSON.stringify(fortyFiveDayData);
    return fortyFiveDayData;
}

//var host='www.ndbc.noaa.gov';
var host='http://www.ndbc.noaa.gov';
var bouyNumber = '46229';
var fortyFiveDayData = [];
var status = new DataStatus('false');

module.exports = {
     initBouyData: function()
     {
         getDataForStation();
     },
     getBouyData: function()
     {
         return getBouyDataArray();
     },
     getBouyDataStatus: function()
     {
         return status;
     }
};

