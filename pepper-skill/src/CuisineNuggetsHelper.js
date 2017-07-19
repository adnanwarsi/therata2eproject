'use strict';
module.change_code = 1;


var CuisineNuggetsObj = require('../DatabaseInFiles/CuisineNuggets.json'); // create an empty array

function CuisineNuggetsHelper() {
    // console.log('in the constructor : CuisineNuggetsHelper, and the first element is \n' + JSON.stringify(CuisineNuggetsObj.record[0], null, 4));
}

CuisineNuggetsHelper.prototype.randomFact = function (cuisineName) {
    var promptstmt = '';
    var dbIndexName = cuisineName.toLowerCase();

    if (! CuisineNuggetsObj.recipenuggets.hasOwnProperty(dbIndexName)) {
        dbIndexName = 'general fun facts';
    }

    var item_pick = Math.floor(Math.random() * CuisineNuggetsObj.recipenuggets[dbIndexName].length);
    promptstmt =  CuisineNuggetsObj.recipenuggets[dbIndexName][item_pick];

    return promptstmt;
};


module.exports = CuisineNuggetsHelper;





