'use strict';
module.change_code = 1;

if (!global.rspRandomPrompt){
    var RspHelper = require('./ResponsePromptHelper');
    global.rspRandomPrompt = new RspHelper();
}


var Fuse = require('./fuse');  // library from Fuse.org for fuzzy search of records

var SimpleGlossaryObj = require('../DatabaseInFiles/cleanGlossary.json'); // create an empty array

function GlossaryHelper() {
    // console.log('in the constructor : GlossaryHelper, and the first element is \n' + JSON.stringify(SimpleGlossaryObj.record[0], null, 4));
    this.init();
}

GlossaryHelper.prototype.findItem = function () {

    // console.log('GlossaryHelper: findItem function for the query string : ' + itemString);
    if (typeof this.LookupTerm === 'undefined') {
        return 'undefined';
    }

    var options = {
        caseSensitive: false,
        include: ["score"],
        shouldSort: true,
        tokenize: false,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        keys: ["name"]
    };
    var fuse = new Fuse(SimpleGlossaryObj.record, options); // "list" is the item array
    var result = fuse.search(this.LookupTerm);

    // console.log('GlossaryHelper: A search hit with following result obj \n' + JSON.stringify(result, null, 4));

    var promptstsmt = global.rspRandomPrompt.getPrompt('Resp_GlossaryLookup_Discovery_C');
    // check if there are any records in the result
    // typically we'd just suggest the first match
    if (result.length !== 0) {promptstsmt = result[0].item.desc;}

    return promptstsmt;

};

GlossaryHelper.prototype.init = function () {
    this.LookupTerm = '';
};



GlossaryHelper.prototype.setLookupTerm = function (itemString) {
    this.LookupTerm = itemString;
};


GlossaryHelper.prototype.getLookupTerm = function () {
    return this.LookupTerm;
};



module.exports = GlossaryHelper;





