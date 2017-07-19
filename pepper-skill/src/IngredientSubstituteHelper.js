'use strict';
module.change_code = 1;

if (!global.rspRandomPrompt){
    var RspHelper = require('./ResponsePromptHelper');
    global.rspRandomPrompt = new RspHelper();
}


var Fuse = require('./fuse');  // library from Fuse.org for fuzzy search of records

var SubstituteDbObj = require('../DatabaseInFiles/IngredientsSubstitutesDatabase.json'); // create an empty array

function IngredientsSubstitutesHelper() {
    // console.log('in the constructor : GlossaryHelper, and the first element is \n' + JSON.stringify(SubstituteDbObj.record[0], null, 4));
}

IngredientsSubstitutesHelper.prototype.findItem = function (itemString) {

    // console.log('GlossaryHelper: findItem function for the query string : ' + itemString);

    var options = {
        caseSensitive: false,
        include: ["score"],
        shouldSort: true,
        tokenize: false,
        threshold: 0.1,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        keys: ["item"]
    };
    var fuse = new Fuse(SubstituteDbObj.list, options); // "list" is the item array
    var result = fuse.search(itemString);

    // console.log('GlossaryHelper: A search hit with following result obj \n' + JSON.stringify(result, null, 4));

    var promptstsmt = global.rspRandomPrompt.getPrompt('Resp_GlossaryLookup_Discovery_C');
    // check if there are any records in the result
    // typically we'd just suggest the first match
    if (result.length !== 0) {
        var nameItem = result[0].item.item;
        // var descItem = result[0].item.substitute;
        var numOfSubs = result[0].item.substitute.length;

        var descItem = '\n <break time=\"0.2s\" /> I can suggest ' + numOfSubs ;

        var itemnum = 0;
        while (itemnum < numOfSubs) {
            descItem += '\n <break time=\"0.1s\" /> ' + ((itemnum > 0)? 'or, ' : '' ) + result[0].item.substitute[itemnum] ;
            itemnum++;
        }

        descItem += '\n <break time=\"0.2s\" /> \n';

        console.log('\n\n score found ' + result[0].score);
        var prefixStmt = ( parseFloat(result[0].score) < parseFloat('0.1') ) ?
            global.rspRandomPrompt.getPrompt('Resp_SubstituteLookup_Ingredients'):
            global.rspRandomPrompt.getPrompt('Resp_GlossaryLookup_Discovery_B');

        promptstsmt = prefixStmt  + nameItem + descItem;
    }

    return promptstsmt;

};


module.exports = IngredientsSubstitutesHelper;





