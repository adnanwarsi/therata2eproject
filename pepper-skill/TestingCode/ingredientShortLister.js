'use strict';

var fs = require('fs');

var RecipeDbObj = require('../DatabaseInFiles/RecipeDatabaseFile.json').recipe;

var DbObj = require('../src/RecipeDbHelper'); // create an empty array
var RecipeDbHelperObj = new DbObj();


// go through all the recipes
for(var recipeNum in RecipeDbObj) {
    console.log('\n\n\n#####################################################################');

    RecipeDbHelperObj.findRecipe(RecipeDbObj[recipeNum].recipename);

    if (RecipeDbHelperObj.ResultsFound) {

        RecipeDbHelperObj.chooseListItem(1);
        var recipeShortIngredientList = RecipeDbHelperObj.shortListofIngredients();

        console.log('\n' + RecipeDbObj[recipeNum].recipename);
        console.log(JSON.stringify(RecipeDbObj[recipeNum].ingredients,null,4));
        console.log(JSON.stringify(recipeShortIngredientList,null,4));

        // console.log(recipeShortIngredientList.join(' <break time=\"0.1s\" /> '));

        var outputstr = RecipeDbHelperObj.shortListofIngredients(RecipeDbObj[recipeNum]).join(', ');
        outputstr = outputstr.replace(/\,(?=[^,]*$)/, ", and,");

        console.log(outputstr);
        // console.log(recipeShortIngredientList.join(', '));
    }

}
