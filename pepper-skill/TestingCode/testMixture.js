'use strict';

var fs = require('fs');

var RecipeDbHelperObj = require('../src/RecipeDbHelper');
var rcpHelper = new RecipeDbHelperObj();

var RspHelper = require('../src/ResponsePromptHelper');
var rsp = new RspHelper();

var GlossaryHelper = require('../src/GlossaryHelper');
var gsHelper = new GlossaryHelper();

var SubstituteHelper = require('../src/IngredientSubstituteHelper');
var subsHelper = new SubstituteHelper();

var CuisineNuggetsHelper = require('../src/CuisineNuggetsHelper');
var cuisineNuggetsHelper = new CuisineNuggetsHelper();

//////// glossary search test


var printStmt = gsHelper.findItem("Varnish");
console.log('\n\nGlossary Help Search :: \n\n' + printStmt + '\n\n');


//////// recipe search test
// var cmdlineargument = process.argv[2];
var cmdlineargument = process.argv.slice(2).join(' ');

var RecipeSearchTerm = 'thai';

if (cmdlineargument !== null) {
    RecipeSearchTerm = cmdlineargument;
}


console.log('\n\nRecipe Search for :: ' + RecipeSearchTerm + '\n\n');


rcpHelper.findRecipe(RecipeSearchTerm);

var bob = function () {

    if (rcpHelper.ResultsFound() > 0) {

        do {
            var promptstr = rcpHelper.getNextPageOfItems(3);
            console.log(promptstr) ;
        } while (rcpHelper.areThereMoreItems());

    } else {
        // prompt for negative search
        console.log('No recipes found for the search term : ' + RecipeSearchTerm);
    }
};

bob();
// rcpHelper.resetListCurrent();


// pick choice
var recipeObjChosen = rcpHelper.chooseListItem(1);
var cardTitle = 'Recipe for ' + rcpHelper.nameRecipe();
var cardContent = rcpHelper.describeRecipe();
cardContent += '\n\nIngredients List:\n' + rcpHelper.currentRecipeListOfIngredients();
cardContent += '\n\nPreparation Steps:'  + rcpHelper.currentRecipeListOfCookingSteps();
var imageObj = {
    smallImageUrl: rcpHelper.currentRecipeSmallImageUrl(),
    largeImageUrl: rcpHelper.currentRecipeLargeImageUrl()
};

console.log(cardTitle + cardContent + JSON.stringify(imageObj, null, 4));

console.log('number of ingredients is ' + rcpHelper.currentRecipeNumberOfIngredients());
// start again



//////// glossary search test


var printStmt = subsHelper.findItem("chile pepper");
console.log('\n\nSubstitute Help Search :: \n\n' + printStmt + '\n\n');



// this would be replaced by databse field
var startTime = fs.readFileSync('./datestampfile.txt','utf8');

function timedElapsedSpeechFormat (content) {

    var stamp = Math.floor(Date.now() / 1000);
    var totalSec = stamp - content;

    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    var result = ( (hours>0) ? hours + " hrs " : '') + minutes  + "\'" + seconds + '\"';

    return result;
}

console.log('\n\n elapsed duration from last run = ' + timedElapsedSpeechFormat(startTime) + '\n\n');

var stamp = Math.floor(Date.now() / 1000);
fs.writeFile('./datestampfile.txt', stamp, function (err) {
    if (err) {
        console.log(err);
    }
});


// var cuisineName = 'italian';
var cuisineName = 'blah';
console.log('\n\nfun fact for ' + cuisineName + '\n\n' + cuisineNuggetsHelper.randomFact(cuisineName) + '\n\n');

