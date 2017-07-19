'use strict';
module.change_code = 1;

function UtilityHelper() {
    // console.log('in the constructor : GlossaryHelper, and the first element is \n' + JSON.stringify(SimpleGlossaryObj.record[0], null, 4));
}


/*
 Extracts the number of seconds elapsed in a string represented by expressions as follows:
 2 to 3 minutes     :    assumes the lower limit of a range; shall pick 2 minutes
 one minute
 couple of minutes
 1 hour
 10 minutes
 five minutes
 30 to 45 minutes   :    assumes the lower limit of a range; shall pick 30 minutes
 */
UtilityHelper.prototype.timeDurationInSeconds = function (string){
    var secondsElapsed;

    var extract = /(about|for)?(([a-zA-Z]*\s+)|([0-9]+(\.)?([0-9]+)?))(.*?)(minute(s)?|hour(s)?)/g;
    var elems = extract.exec(string);

    var secondsLookup = {
        hours   : 3600,
        hour    : 3600,
        minute  : 60,
        minutes : 60
    };

    var digitsLookup = {
        another : 1,
        couple  : 2,
        few     : 3,
        half    : 0.5,
        one     : 1,
        two     : 2,
        three   : 3,
        four    : 4,
        five    : 5,
        six     : 6,
        seven   : 7,
        eight   : 8,
        nine    : 9,
        ten     : 10,
        eleven      : 11,
        tweleve     : 12,
        thirteen    : 13,
        fourteen    : 14,
        fifteen     : 15,
        twenty  : 20,
        thirty  : 30,
        forty   : 40,
        fifty   : 50
    };

    if (Array.isArray(elems)) {
        var quantity = elems[2].toLowerCase().trim();
        var quantum = elems[8].toLowerCase().trim();
        if (isNaN(quantity)) {quantity = digitsLookup[quantity];}
        secondsElapsed = quantity * secondsLookup[quantum].valueOf();
    }

    return secondsElapsed;
}


/*
 time elapsed from argument passed to current time.
 */
UtilityHelper.prototype.timedElapsedSpeechFormat = function (content){

    var stamp = Math.floor(Date.now() / 1000);
    var totalSec = stamp - content;

    return this.timeInSpeechFormat(totalSec);

}


/*
 time in seconds converted in minutes and hours appropriate for
 Alexa speech
 */
UtilityHelper.prototype.timeInSpeechFormat = function (totalSec){
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    // var result = ( (hours>0) ? hours + " hours " : '') + (minutes>0 ? minutes + ' minutes ' : '' )   + (seconds>0 ? seconds  + ' seconds ' : '');
    var result = ( (hours>0) ? hours + " hours " : '') + (minutes>0 ? minutes + ' minutes ' : '' ) ;

    return result;
}


module.exports = UtilityHelper;





