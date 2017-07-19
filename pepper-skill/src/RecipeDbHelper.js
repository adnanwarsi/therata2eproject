'use strict';
module.change_code = 1;


if (!global.rspRandomPrompt) {
    var RspHelper = require('./ResponsePromptHelper');
    global.rspRandomPrompt = new RspHelper();
}


var commonItems = [
    'black pepper',
    'butter',
    'chili powder',
    'cinnamon',
    'cloves',
    'cream',
    'cumin',
    'garlic',
    'ginger',
    'lemon',
    'lemons',
    'lime',
    'milk',
    'olive oil',
    'oil',
    'onion',
    'onions',
    'pepper',
    'salt',
    'spices',
    'sugar',
    'tomato',
    'vegetable oil',
    'water',
    'yoghurt',
    'yogurt',
    'cheese',
    'tomatoes',
    'vegetables'
];


function RecipeDbHelper() {
    this.SearchFoundResults = false;
    this.SearchRecipeList = [];
    this.currentSearchListItemNumber = 0;
    this.currentRecipeChosen = {};
}

RecipeDbHelper.prototype.findRecipe = function (kitchen_board) {

    console.log('RecipeDbHelper: findRecipe function for the query string ');
    this.SearchFoundResults  = false;

    if (Object.keys(kitchen_board).length > 0){
        this.SearchFoundResults  = true;
        // create an array of recipe objects sorted on the time
        var recipe_list = [];
        for (var itemNum in kitchen_board) {
            recipe_list.push(kitchen_board[itemNum])
        }

        this.SearchRecipeList =  recipe_list.sort(function(a, b) {
            var x = b['timestamp']; var y = a['timestamp'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    return this.SearchFoundResults;
};

RecipeDbHelper.prototype.chooseListItem = function (choiceString) {

    if (this.SearchRecipeList.length !== 0) {
        if ( parseInt(choiceString) && (parseInt(choiceString) > 0) ) {

            // choice string starts from 1, 2, 3 ... arg to array is one less, starting at 0
            this.currentRecipeChosen = this.SearchRecipeList[parseInt(choiceString) - 1].recipe;
            return this.currentRecipeChosen;
        }
    }
};


RecipeDbHelper.prototype.ResultsFound = function () {
    // console.log('in RecipeDbHelper ResultsFound : num of results found : ' + this.SearchRecipeList.length);
    return this.SearchRecipeList.length;
};

RecipeDbHelper.prototype.introRecipe = function () {
    if (undefined !== this.currentRecipeChosen) {
        // check if there is rating
        var returnStr = ' ';
        if (undefined !== this.currentRecipeChosen.aggregateRating) {
            returnStr += 'The recipe has an aggregate rating of ' + this.currentRecipeChosen.aggregateRating + '. '
        }
        if (undefined !== this.currentRecipeChosen.reviewCount) {
            returnStr += 'There are ' + this.currentRecipeChosen.reviewCount + ' user reviews.';
        }
        return returnStr;
    }
};

RecipeDbHelper.prototype.describeRecipe = function () {
    var retVal = '';
    if (undefined !== this.currentRecipeChosen) {
        if (this.currentRecipeChosen.hasOwnProperty('description')) {
            retVal = this.currentRecipeChosen.description;
        }
    }
    return retVal;
};

RecipeDbHelper.prototype.historicalFactsRecipe = function () {
    var retVal = '';
    if (undefined !== this.currentRecipeChosen) {
        if (this.currentRecipeChosen.hasOwnProperty('historical facts')) {
            retVal = this.currentRecipeChosen['historical facts'];
        }
    }
    return retVal;
};

RecipeDbHelper.prototype.nameRecipe = function () {
    if (undefined !== this.currentRecipeChosen) {
        return this.currentRecipeChosen.name;
    }
};

RecipeDbHelper.prototype.currentRecipeListOfIngredients = function () {
    var returnPromptStr = '';
    if (undefined !== this.currentRecipeChosen) {
        for (var itemnum in this.currentRecipeChosen.ingredients) {
            returnPromptStr += '\n#' + (itemnum - 0 + 1) + ' ) ' + this.currentRecipeChosen.ingredients[itemnum].prompt;
        }
    }
    return returnPromptStr;
};


RecipeDbHelper.prototype.currentRecipeNumberOfIngredients = function () {
    var numberOfIngredients = undefined;
    if (Object.keys(this.currentRecipeChosen).length !== 0) {
        numberOfIngredients = this.currentRecipeChosen.ingredients.length - 0;
    }
    return numberOfIngredients;
};

RecipeDbHelper.prototype.currentRecipeListOfCookingSteps = function () {
    var returnPromptStr = '';
    if (undefined !== this.currentRecipeChosen) {
        for (var itemnum in this.currentRecipeChosen.cookingsteps) {
            returnPromptStr += '\n\nstep ' + (itemnum - 0 + 1) + ') '+ this.currentRecipeChosen.cookingsteps[itemnum].prompt;
        }
    }
    return returnPromptStr;
};

RecipeDbHelper.prototype.currentRecipeSmallImageUrl = function () {
    var returnUrl = '';
    if (undefined !== this.currentRecipeChosen) {
        returnUrl = this.currentRecipeChosen.image;
    }
    return returnUrl;
};


RecipeDbHelper.prototype.currentRecipeLargeImageUrl = function () {
    var returnUrl = '';
    if (undefined !== this.currentRecipeChosen) {
        returnUrl = this.currentRecipeChosen.image;
    }
    return returnUrl;
};


RecipeDbHelper.prototype.getNextPageOfItems = function (PAGINATION_SIZE ) {

    var returnPromptStr = '';

    if ( this.SearchRecipeList.length !== 0) {

        if (this.currentSearchListItemNumber === 0) {
            returnPromptStr += '\nfound '
                + this.ResultsFound()
                + ( (this.ResultsFound() > 1) ? ' recipes. ' : ' recipe. ');

        }

        // traverse the next set of items determined by PAGINATION_SIZE
        for (var i=0; i < PAGINATION_SIZE; i++) {
            if (this.currentSearchListItemNumber < this.SearchRecipeList.length) {

                returnPromptStr += '\n <break time=\"0.1s\" /> '
                    + 'recipe '
                    + (this.currentSearchListItemNumber - 0 + 1)
                    + ' <break time=\"0.1s\" /> '
                    + this.SearchRecipeList[this.currentSearchListItemNumber].recipe.name;

                this.currentSearchListItemNumber++;

            }
        }

        returnPromptStr += '\n<break time=\"0.1s\" />  choose an item number';
        if (this.areThereMoreItems()) {
            returnPromptStr += ', or say more.';
        } else {
            returnPromptStr += ', or say start over.';
        }

    } else {
        returnPromptStr = 'There are no recipe suggestions found';
    }

    return returnPromptStr;
};

RecipeDbHelper.prototype.areThereMoreItems = function () {
    var returnVal = false;
    if (this.currentSearchListItemNumber < this.SearchRecipeList.length) {
        returnVal = true;
    }
    return returnVal;
};

RecipeDbHelper.prototype.resetListCurrent = function () {
    this.currentSearchListItemNumber = 0;
};

RecipeDbHelper.prototype.backtrackListCurrent = function (PAGINATION_SIZE) {

    if ( (this.currentSearchListItemNumber - PAGINATION_SIZE) >= 0) {
        this.currentSearchListItemNumber = this.currentSearchListItemNumber - PAGINATION_SIZE;
    } else {
        this.currentSearchListItemNumber = 0;
    }
};

RecipeDbHelper.prototype.cleanupAndReset = function () {
    this.SearchFoundResults = false;
    this.SearchRecipeList = [];
    this.currentSearchListItemNumber = 0;
    this.currentRecipeChosen = {};
};

RecipeDbHelper.prototype.shortListofIngredients = function () {
    var ingredientsShortListObj = [];

    // console.log(JSON.stringify(this.currentRecipeChosen,null,4));
    if ( this.currentRecipeChosen.length < 1) {
        return ingredientsShortListObj;
    }

    // for each recipe, go through all the ingredients
    for (var ingredNum in this.currentRecipeChosen.ingredients) {

        // console.log('\n' + recipeObj.ingredients[ingredNum]);
        var essenceIngredient = extractMainIngredient(this.currentRecipeChosen.ingredients[ingredNum].prompt) ;
        var printstr = essenceIngredient;

        // iterate over the commonItems list to see if there is a match with the ingredients, and we'd ignore this ingredient
        for (var item in commonItems) {
            // if (essenceIngredient.indexOf(commonItems[item]) > -1)  {
            if (commonItems[item].indexOf(essenceIngredient) > -1)  {
                printstr = '';
                break;
            }
        }

        // do not include ingredient item that is too verbose, poorly written.  some of them slip through. ignore those.
        if ( (printstr.length > 0)  && (printstr.split(' ').length < 7 ) ) ingredientsShortListObj.push(printstr);
    }

    var uniqueArray = ingredientsShortListObj.filter(function(elem, pos) {
        return ingredientsShortListObj.indexOf(elem) == pos;
    });

    return uniqueArray;
};

function extractMainIngredient (ingredientDetailedString) {
    var ingredientExtracted = '';

    var lowercsaeDetailedString = ingredientDetailedString.toLowerCase();
    lowercsaeDetailedString = lowercsaeDetailedString.replace(/\(([^)]+)\)/g, ''); // replace the text within braces with the %%% code
    //var arr = lowercsaeDetailedString.split(theSplitArgs);
    var arr = lowercsaeDetailedString.split(/\&|^a |^an | of | and |\-|\+|\.|:|,|\/|[0-9]+| as |to taste|boiled|unsalted|salted|kosher|required|peeled|peel|melted|minced|fresh|frozen|dried| dry|halved|half|whole|cut|packet|fienly|thinly|chopped|drained| drops| drop| tsps| tsp|teaspoons|teaspoon| tbsps| tbsp| tablespoons| tablespoon| ml| grams| kgs| kg|ounce| cms| cm| cups| cup| ozs| oz| lbs| lb| cans| can|handfuls|handful|pinch|bunch|slices|sliced|slice|finely|small|medium|large|seeded|crushed|softened|cubed|shredded|grated|water/g);

    arr = arr.map(function (s) {return s.trim()}); // trim the individual strings in the array
    arr = arr.filter(function(n){ return n != '' });
    ingredientExtracted = arr.join(' ').trim();

    return ingredientExtracted;
};




module.exports = RecipeDbHelper;





