'use strict';

var fs = require('fs');

var UtilsObj = require('../src/UtilityHelper');
var utilsHelper = new UtilsObj();



// this would be replaced by databse field
var startTime = fs.readFileSync('./durations_examples.txt','utf8');
var durationsArray = startTime.split('\n');

for(var lineItem in durationsArray){
    // console.log('\n\n' + durationsArray[lineItem]);

    var regExp = /"(.*?)"/g;
    var matches = regExp.exec(durationsArray[lineItem].split(':')[1]);
    if (Array.isArray(matches)) {
        var stringtolookfor = matches[1];
        console.log('\n' + stringtolookfor);
        var secondsElapse = utilsHelper.timeDurationInSeconds(stringtolookfor);
        console.log('minimum time elaped ' + utilsHelper.timeInSpeechFormat(secondsElapse) );
    }

}
