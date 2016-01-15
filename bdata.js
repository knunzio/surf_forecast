var http = require('http');

var host='http://www.ndbc.noaa.gov';
var buoyNumber = '46229';
var fortyFiveDayData = [];
var stationData = [];
var status = new BuoyDataStatus('false');
var rp = require('request-promise');

/**
 * Points on a compass mapped to 
 * their degrees.
 */
var compassPoints [
        {'N':'0'},
        {'NNE':'23'},
        {'NE':'45'},
        {'ENE':'68'},
        {'E':'90'},
        {'ESE':'113'},
        {'SE':'135'},
        {'SSE':'158'},
        {'S':'180'},
        {'SSW':'203'},
        {'SW':'225'},
        {'WSW':'248'},
        {'W':'270'},
        {'WNW':'292'},
        {'NW':'315'},
        {'NNW':'326'}
    ];

/**
 * Forecasted surf breaks.
 */
var  surfBreaks [
        {
            name            : 'SeaSide, OR',
            description     : 'The Coave.',
            workingTideLevel: '',
            facingDirection : 'WNW',
            latitude        : { 
                                  loc:'N', 
                                  deg: '45.99'
                              },
            longitude       : {
                                  loc: 'W',
                                  deg: '123.92'
                              }
        }
    ];

/**
 * Buoy stations.
 */
var nearShoreOregonStations = [
        {
            stationNumber : '46211',
            stationName   : 'Grays Harbor'
        },
        {
            stationNumber : '46029',
            stationName   : 'Columbia River Bar'
        },
        {
            stationNumber : '46248',
            stationName   : 'Astoria Canyon'
        },
        {
            stationNumber : '46050',
            stationName   : 'Stonewall Bank'
        },
        {
            stationNumber : '46229',
            stationName   : 'Umpqua Offshore'
        },
        {
            stationNumber : '46015',
            stationName   : 'Stonewall Bank'
        },
        {
            stationNumber : '46027',
            stationName   : 'St Georges'
        }
    ];


/**
 * Pacific stations used for long term forecasting.
 */
var offShorePacificStations = [
        {
            stationNumber : '46036',
            stationName   : 'South Nomad',
            latitude     : { 
                               loc:'N', 
                               deg: '48.355'
                           },
            longitude    : {
                               loc: 'W',
                               deg: '133.938'
                           }
        },
        {
            stationNumber : '46005',
            stationName   : 'West Washington',
            latitude     : { 
                               loc:'N', 
                               deg: '45.958'
                           },
            longitude    : {
                               loc: 'W',
                               deg: '131'
                           }
        },
        {
            stationNumber : '46002',
            stationName   : 'West Oregon',
            latitude     : { 
                               loc:'N', 
                               deg: '42.614'
                           },
            longitude    : {
                               loc: 'W',
                               deg: '130.49'
                           }
        },
        {
            stationNumber : '46059',
            stationName   : 'West California',
            latitude     : { 
                               loc:'N', 
                               deg: '38.050'
                           },
            longitude    : {
                               loc: 'W',
                               deg: '129.898'
                           }
        }

    ];

//Ignore N vs S lat and E vs W long
var haversin = function(lat1,lon1, lat2, lon2){
    var radiusEarth = 6371000; // metres
    var latitudeRadians1 = lat1.toRadians();
    var latitudeRadians2 = lat2.toRadians();
    var latitudeDelta = (lat2-lat1).toRadians();
    var longitudeDelta = (lon2-lon1).toRadians();

    var a = Math.sin(latitudeDelta/2) * Math.sin(latitudeDelta/2) +
        Math.cos(latitudeRadians1) * Math.cos(latitudeRadians2) *
        Math.sin(longitudeDelta/2) * Math.sin(longitudeDelta/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return (radiusEarth * c);
}

function getMilesFromMeters(meters)
{
    var metersPerMile = 1609.34; 
    return (meters / metersPerMile);
}

//#YY  MM DD hh mm WVHT  SwH  SwP  WWH  WWP SwD WWD  STEEPNESS  APD MWD
//#yr  mo dy hr mn    m    m  sec    m  sec  -  degT     -      sec degT
function BuoyData(SID,YY,MM,DD,hh,mm,WVHT,SwH,SwP,WWH,WWP,SwD,WWD,STEEPNESS,APD,MWD)
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

    BuoyData.prototype.getInfo = function () {
        return JSON.stringify(this);
    }
}

function BuoyDataStatus(status)
{
    this.status=status;

    BuoyDataStatus.prototype.getInfo = function() {
        return JSON.stringify(this);
    }
}


function clearBuoyData()
{
    fortyFiveDayData = [];
}

function buildBuoyDataFromResponse(stationId, data ){

    var responseData = data.join('');
    var lines = responseData.split("\n");

    for (var ii = 0; ii < lines.length; ii++)
    {
        if(typeof lines[ii] === 'undefined')
           continue;

        if(lines[ii].match(/^#/g))
            continue;

        var splitLine = lines[ii].split(/\s+/);

        var buoyData = new BuoyData(stationId,
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
        fortyFiveDayData.push(buoyData);
    }

    status = new BuoyDataStatus('true'); 
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
           clearBuoyData();
           buildBuoyDataFromResponse(stationId, responseParts);
       });
   });
}

function getBuoyDataArray()
{
    return fortyFiveDayData;
}

function getStationDataForTimeInterval(stationid, timeInterval)
{

}

rp('')
    .then(function(htmlString){
        // Process html... 
    })
    .catch(function (err) {
        // Crawling failed... 
    });


module.exports = {
     initBuoyData: function(stationid)
     {
         getDataForStation(stationid);
     },
     getBuoyData: function()
     {
         return getBuoyDataArray();
     },
     getBuoyDataStatus: function()
     {
         return status;
     },
     getStationData: function(stationId, timeInterval)
     {
         return getStationDataForTimeInterval(stationId, timeInterval)
     }
};

