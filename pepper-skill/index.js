// These handlers are not bound to a state
'use strict';

var AWS = require('aws-sdk');
// var COGNITO = require('amazon-cognito');

var Alexa = require("alexa-sdk");
var RecipeDbHelperObj = require('./src/RecipeDbHelper');

var UtilsObj = require('./src/UtilityHelper');
var utilsHelper = new UtilsObj();

var rcpHelper = new RecipeDbHelperObj();
var RspHelper = require('./src/ResponsePromptHelper');
global.rspRandomPrompt = new RspHelper();

var GlossaryHelper = require('./src/GlossaryHelper');
var gsHelper = new GlossaryHelper();

var SubsHelper = require('./src/IngredientSubstituteHelper');
var substituteHelper = new SubsHelper();

var CuisineNuggetsHelper = require('./src/CuisineNuggetsHelper');
var cuisineNuggetsHelper = new CuisineNuggetsHelper();

var appId = 'amzn1.ask.skill.cb0eccf8-1d8c-4775-ba43-4b6771bce806';



var _COGNITO_IDENTITY_POOL_ID = 'us-west-2:7b674d12-bff0-4fbb-ae3d-02de013a3c29';

/**
 * The number of items read for each pagination request,
 * until we reach the MAX_ITEMS
 */
var PAGINATION_SIZE = 3;

/*
 percentage times (value between 0 - 1.0 ) historical fact about recipe featured
 at the end of ingredients list
 */
var FEATURE_PROB_HISTORICAL_FACT = 1.0;

/*
 percentage times (value between 0 - 1.0 ) the step number is spoken for the list of ingredients
 or cooking steps
 */
var FEATURE_PROB_STEPNUMBER_UTTER = 0.33;

/*
 Add to a description of the recipe, the shortlist of key ingredients, when user asks
 for a recipe description. The constant here shall be upper cieling to avoid listing
 very large sets in recipes, that would make the description too verbose.
 */
var ALLOW_SIZE_INGREDIENTS_IN_DESCRIPTION = 10;






exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.dynamoDBTableName = 'recipeSpeak';

    alexa.registerHandlers(
        newSessionHandlers,
        glossaryHandlers,
        searchrecipesHandlers,
        traversesearchHandlers,
        recipeselectedHandlers,
        ingredientsHandlers,
        cookingHandlers,
        commonHandlers
    );

    alexa.execute();
};


var states = {
    SEARCHRECIPES: '_SEARCHRECIPES',     // user looking to find a recipe.
    TRAVERSESEARCHLIST: '_TRAVERSESEARCHLIST',
    RECIPESELECTED: '_RECIPESELECTED',
    ORDERING: '_ORDERING',
    INGREDIENTS: '_INGREDIENTS',       // user to go through the ingredients and prepare to start.
    COOKING: '_COOKING',           // cycle through the instruction set.
    CLOSEOUT: '_CLOSEOUT',
    GLOSSARY: '_GLOSSARY'
};


var newSessionHandlers = {
    'NewSession': function () {

        console.log('new session without state!' + JSON.stringify(this.event, null, 4));
        var COGNITO_IDENTITY_POOL_ID = _COGNITO_IDENTITY_POOL_ID;
        var USERID = this.event.session.user.userId;
        var context = this;

        //if no amazon token, return a LinkAccount card
        if (this.event.session.user.accessToken === undefined) {

            this.emit(':tellWithLinkAccountCard',
                'to start using this skill, please use the Alexa app to authenticate');
            return;
        }

        AWS.config.region = 'us-west-2';

        var cognitoidentity = new AWS.CognitoIdentity({apiVersion: '2014-06-30'});

        var params = {
            IdentityPoolId: _COGNITO_IDENTITY_POOL_ID, /* required */
            Logins: {
                'graph.facebook.com': this.event.session.user.accessToken
            }
        };
        cognitoidentity.getId(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log(data);           // successful response

                var COGNITO_IDENTITY = data.IdentityId;

                var cognitosync = new AWS.CognitoSync();
                cognitosync.listRecords({
                    DatasetName: "AlexaData",
                    IdentityId: COGNITO_IDENTITY,
                    IdentityPoolId: COGNITO_IDENTITY_POOL_ID
                }, function (err, data) {

                    console.log('cognito err, if any: ' + err);

                    var params = {
                        DatasetName: "AlexaData",
                        IdentityId: COGNITO_IDENTITY,
                        IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
                        SyncSessionToken: data.SyncSessionToken,
                        RecordPatches: [{
                            Key: "AlexaUserID",
                            Op: 'replace',
                            SyncCount: data.DatasetSyncCount,
                            Value: USERID
                        }]
                    };

                    cognitosync.updateRecords(params, function (err, data) {
                        if (err) {
                            console.log('cognito update record error : ' + err);
                        } // an error occurred
                        else {
                            var dataRecords = JSON.stringify(data);
                            console.log(dataRecords);
                        }

                        AWS.config.region = 'us-east-1';

                        context.handler.state = states.SEARCHRECIPES;

                        // this is the fall back state memory for digress states like
                        // glossary lookup , substitutes lookup states etc.
                        context.attributes.goBackToState = states.SEARCHRECIPES;
                        context.attributes.cognitoId = COGNITO_IDENTITY;

                        var kitchen_board = {};
                        var docClient = new AWS.DynamoDB.DocumentClient();
                        var recipeDepotQeuryParams = {
                            TableName : "recipeDepot",
                            KeyConditionExpression: "#id = :uid",
                            ExpressionAttributeNames:{
                                "#id": "cognitoID"
                            },
                            ExpressionAttributeValues: {
                                ":uid":context.attributes.cognitoId
                            }
                        };
                        docClient.query(recipeDepotQeuryParams, function(err, data) {
                            if (err) {
                                console.log("Unable to query. Error:", JSON.stringify(err, null, 2));
                            } else {
                                console.log("Query succeeded. data retrieved \n\n" + JSON.stringify(data,null,4));
                                data.Items.forEach(function(item) {
                                    kitchen_board = item.kitchenBoard;
                                    // check here if there exists recipes in teh kitchenboard, if not prompt for it
                                    if (kitchen_board.length === 0) {
                                        // let the user know to download redpepper app and setup recipes
                                        var prompt_str = 'there are no recipes on your kitchen board.';
                                        prompt_str += ' please download the red pepper app from the app store, and setup your favorite recipes.';
                                        context.emit(':tell', prompt_str);
                                    } else {
                                        context.attributes.kitchenBoard = kitchen_board;
                                        var recipe_num =  Object.keys(kitchen_board).length;
                                        var prompt_str = 'there are ' + recipe_num + ' recipes on your kitchen board.';
                                        prompt_str += ' do you want me to list em ?';
                                        context.emit(':ask', prompt_str, rspRandomPrompt.getPrompt('Resp_Continue_AudioOnly'));
                                    }

                                });
                            }
                        });

                    });
                });
            }
        });

        //finish cognito sync
    },

    'Intent_GlossaryLookup': function () {

        var helpText = this.event.request.intent.slots.helptext.value;
        console.log('Intent_GlossaryLookup Handler Generic ::: for help text :: ' + helpText);

        if (this.handler.state !== states.GLOSSARY) {
            this.attributes.goBackToState = this.handler.state;
            this.handler.state = states.GLOSSARY;
        }

        gsHelper.setLookupTerm(helpText);

        // ask the user if this is the word intended
        var printStmt = 'did you ask for  <break time=\"0.1s\" /> ' + helpText + ' ?';

        this.emit(':ask', printStmt, rspRandomPrompt.getPrompt('Resp_Continue_Generic'));

    }

};

/*
 The state Glossary is a temporary state that is set upon invocation of the
 Intent_GlossaryLookup from any of the other states, typically from the INGREDIENTS state.
 The handlers shall keep a note of the previous or go-back-to state, after servicing the
 request and corresponding user dialogue.
 */
var glossaryHandlers = Alexa.CreateStateHandler(states.GLOSSARY, {

    // if ever the skill finds itself here (i.e. in NewSession with state Glossary),
    // fall back to the previous / go-back-to state
    'NewSession': function () {
        console.log('new session in GLOSSARY state!');
        this.handler.state = this.attributes.goBackToState;
        gsHelper.init();
        this.emit(':ask',
            rspRandomPrompt.getPrompt('Resp_Continue_Generic'),
            rspRandomPrompt.getPrompt('Resp_Continue_Generic'));
    },

    'AMAZON.YesIntent': function () {
        console.log('AMAZON.YesIntent Handler in state GLOSSARY:::');

        // go back to the orginal state
        this.handler.state = this.attributes.goBackToState;

        var printStmt = gsHelper.findItem();
        gsHelper.init();

        this.emit(':ask', printStmt, rspRandomPrompt.getPrompt('Resp_Continue_Generic'));
    },

    'AMAZON.NoIntent': function () {
        console.log('AMAZON.NoIntent Handler in state GLOSSARY:::');

        var promptstr = 'sorry about that. appears I did not hear you right. ';
        var repeatpromptstr = 'Ask for the term again ';
        promptstr += repeatpromptstr;

        this.emit(':ask', promptstr, repeatpromptstr);

    },

    'Intent_GlossaryLookup': function () {
        var helpText = this.event.request.intent.slots.helptext.value;
        console.log('Intent_GlossaryLookup Handler in state GLOSSARY::: for help text :: ' + helpText);
        this.emit('Intent_GlossaryLookup'); // Uses the handler in newSessionHandlers
    },


    'AMAZON.HelpIntent': function () {
        console.log('AMAZON.HelpIntent Handler in state GLOSSARY:::');

        var promptstr = 'Ask for the term by saying <break time=\"0.2s\" /> what is <break time=\"0.2s\" /> and then the term. ';
        promptstr += rspRandomPrompt.getPrompt('Resp_Continue_Generic');

        var repromptstr = 'Ask for the term again ';
        repromptstr += rspRandomPrompt.getPrompt('Resp_Continue_Generic');

        this.emit(':ask', promptstr, repeatpromptstr);

    },

    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent Handler in state GLOSSARY:::');

        // go back to the orginal state
        this.handler.state = this.attributes.goBackToState;
        gsHelper.init();

        this.emit(':ask', rspRandomPrompt.getPrompt('Resp_Continue_Generic'));
    },

    'Unhandled': function () {
        console.log('Unhandled Handler in state GLOSSARY:::');
        // ask user if he is looking for the term, if captured already. else cancel.
        if (!gsHelper.getLookupTerm()) {
            this.handler.state = this.attributes.goBackToState;
            gsHelper.init();
            this.emit(':ask', rspRandomPrompt.getPrompt('Resp_Continue_Generic'));
        } else {
            var promptstr = 'did you ask for  <break time=\"0.1s\" /> ' +
                gsHelper.getLookupTerm() + ' ?' +
                rspRandomPrompt.getPrompt('Resp_Continue_Generic');

            this.emit(':ask', promptstr);
        }
    }

});


var searchrecipesHandlers = Alexa.CreateStateHandler(states.SEARCHRECIPES, {

    'NewSession': function () {
        console.log('new session in SEARCHRECIPES state!');
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },

    'AMAZON.YesIntent': function () {
        console.log('AMAZON.YesIntent Handler in state SEARCHRECIPES:::');

        rcpHelper.findRecipe(this.attributes.kitchenBoard);
        this.handler.state = states.TRAVERSESEARCHLIST;

        // var promptstr = rspRandomPrompt.getPrompt('Resp_RecipeSearch_Discovery_C');
        var promptstr = rcpHelper.getNextPageOfItems(PAGINATION_SIZE);
        var repeatpromptstr = 'would you like to repeat the items, or start over ?';

        console.log('AMAZON.YesIntent Handler in state SEARCHRECIPES::: NextPage items text recieved \n' + promptstr);
        // ask teh user to pick one of the choices

        this.emit(':ask', promptstr, repeatpromptstr);
    },

    'AMAZON.NoIntent': function () {
        console.log('AMAZON.NoIntent Handler in state SEARCHRECIPES:::');
        var promptstr = rspRandomPrompt.getPrompt('Resp_Resume_SearchRecipes_F');

        var repeatpromptstr = rspRandomPrompt.getPrompt('Resp_Resume_SearchRecipes_E');

        this.emit(':ask', promptstr, repeatpromptstr);
    },

    'AMAZON.HelpIntent': function () {
        console.log('AMAZON.HelpIntent Handler in state SEARCHRECIPES:::');
    },

    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent Handler in state TRAVERSESEARCHLIST:::');
        this.handler.state = states.SEARCHRECIPES;

        this.emit(':tell', 'see you next time.');

    },

    'Intent_GlossaryLookup': function () {
        var helpText = this.event.request.intent.slots.helptext.value;
        console.log('Intent_GlossaryLookup Handler in state SEARCHRECIPES::: for help text :: ' + helpText);
        this.emit('Intent_GlossaryLookup'); // Uses the handler in newSessionHandlers
    },


    'Unhandled': function () {
        console.log('Unhandled Handler in state SEARCHRECIPES:::');

        var say_stmt = rspRandomPrompt.getPrompt('Resp_Unhandled_Discovery_A');
        var repeat_stmt = rspRandomPrompt.getPrompt('Resp_Repeat_SearchRecipes');

        if (Object.keys(this.attributes).length !== 0) {
            // we don't have a recipe yet
            repeat_stmt = rspRandomPrompt.getPrompt('Resp_Continue_Discovery');
        } else {
            say_stmt = rspRandomPrompt.getPrompt('Resp_Unhandled_Discovery_B');
        }

        this.emit(':ask', say_stmt, repeat_stmt);

    }

});

var traversesearchHandlers = Alexa.CreateStateHandler(states.TRAVERSESEARCHLIST, {

    'NewSession': function () {
        console.log('new session in TRAVERSESEARCHLIST state!');
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },

    'Intent_ListChoice': function () {
        console.log('Intent_ListChoice Handler in state TRAVERSESEARCHLIST:::');

        var choiceNum = this.event.request.intent.slots.choicenumber.value;

        // verify that the number given as choice is a valid once
        this.attributes.currentrecipe = rcpHelper.chooseListItem(choiceNum);

        if (undefined !== this.attributes.currentrecipe) {
            this.attributes.recipename = this.attributes.currentrecipe.recipename;
            this.attributes.stepnumber = 0;

            this.handler.state = states.RECIPESELECTED;

            // prompt the
            var promptstr = rcpHelper.introRecipe();

            promptstr += ' Say describe for a description, or ';
            var promptstr2 = 'say proceed to go through the ingredients.';

            promptstr += promptstr2;

            // var cardTitle = 'Recipe for ' + rcpHelper.nameRecipe();
            var cardTitle = rcpHelper.nameRecipe();
            var cardContent = rcpHelper.describeRecipe();
            cardContent += '\n\nIngredients List:\n' + rcpHelper.currentRecipeListOfIngredients();
            // cardContent += '\n\nPreparation Steps:'  + rcpHelper.currentRecipeListOfCookingSteps();
            /*
            do not add the images to teh card, as they are not converted to the required image specs
            var imageObj = {
                smallImageUrl: rcpHelper.currentRecipeSmallImageUrl(),
                largeImageUrl: rcpHelper.currentRecipeLargeImageUrl()
            };
            */
            console.log('picked the recipe with following details ' + cardContent);
            // this.emit(':askWithCard', promptstr, promptstr2, cardTitle, cardContent, imageObj);
            this.emit(':askWithCard', promptstr, promptstr2, cardTitle, cardContent);

        } else {

            this.emit(':ask',
                'choice not successful. please select again.',
                rspRandomPrompt.getPrompt('Resp_Repeat_SearchRecipes'));
        }

    },

    'AMAZON.NextIntent': function () {
        console.log('AMAZON.NextIntent Handler in state TRAVERSESEARCHLIST:::');

        // advance the list and present the choices again
        if (rcpHelper.ResultsFound() > 0) {
            var promptstr = rcpHelper.getNextPageOfItems(PAGINATION_SIZE);
            var repeatpromptstr = 'would you like to repeat the items, or start over ?';

            console.log(promptstr);
            // ask teh user to pick one of the choices
            this.emit(':ask', promptstr, repeatpromptstr);

        } else {
            // prompt for negative search
            var promptstr = 'No recipes found for the search term : ' + RecipeSearchTerm;
            var repeatpromptstr = 'would you like to cancel?';
            promptstr += repeatpromptstr;

            console.log(promptstr);
            this.emit(':ask', promptstr, repeatpromptstr);
        }
    },

    'AMAZON.RepeatIntent': function () {
        console.log('AMAZON.RepeatIntent Handler in state TRAVERSESEARCHLIST:::');
        rcpHelper.backtrackListCurrent(PAGINATION_SIZE);
        if (rcpHelper.ResultsFound() > 0) {
            var promptstr = rcpHelper.getNextPageOfItems(PAGINATION_SIZE);
            var repeatpromptstr = 'would you like to repeat the items, or start over ?';

            console.log(promptstr);
            // ask teh user to pick one of the choices
            this.emit(':ask', promptstr, repeatpromptstr);

        } else {
            // prompt for negative search
            var promptstr = 'No recipes found for the search term : ' + RecipeSearchTerm;
            var repeatpromptstr = 'would you like to cancel?';
            promptstr += repeatpromptstr;

            console.log(promptstr);
            this.emit(':ask', promptstr, repeatpromptstr);
        }
    },

    'AMAZON.StartOverIntent': function () {
        console.log('AMAZON.StartOverIntent Handler in state TRAVERSESEARCHLIST:::');
        rcpHelper.resetListCurrent();
        // advance the list and present the choices again
        if (rcpHelper.ResultsFound() > 0) {
            var promptstr = rcpHelper.getNextPageOfItems(PAGINATION_SIZE);
            var repeatpromptstr = 'would you like to repeat the items, or start over ?';

            console.log(promptstr);
            // ask teh user to pick one of the choices
            this.emit(':ask', promptstr, repeatpromptstr);

        } else {
            // prompt for negative search
            var promptstr = 'No recipes found for the search term : ' + RecipeSearchTerm;
            var repeatpromptstr = 'would you like to cancel?';
            promptstr += repeatpromptstr;

            console.log(promptstr);
            this.emit(':ask', promptstr, repeatpromptstr);
        }
    },

    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent Handler in state TRAVERSESEARCHLIST:::');
        this.handler.state = states.SEARCHRECIPES;

        var promptstr = rspRandomPrompt.getPrompt('Resp_Resume_SearchRecipes_C');
        var repeatpromptstr = rspRandomPrompt.getPrompt('Resp_Resume_SearchRecipes_C');

        this.emit(':ask', promptstr, repeatpromptstr);

    },

    'AMAZON.HelpIntent': function () {
        console.log('AMAZON.HelpIntent Handler in state TRAVERSESEARCHLIST:::');
    },

    'Unhandled': function () {
        console.log('Unhandled Handler in state TRAVERSESEARCHLIST:::');
        this.emit(':ask'
            , rspRandomPrompt.getPrompt('Resp_Unhandled_Generic')
            , rspRandomPrompt.getPrompt('Resp_Continue_Generic')
        );

    }

});

var recipeselectedHandlers = Alexa.CreateStateHandler(states.RECIPESELECTED, {

    'NewSession': function () {
        console.log('new session in RECIPESELECTED state!');
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },

    'AMAZON.StartOverIntent': function () {
        console.log('AMAZON.StartOverIntent Handler in state RECIPESELECTED:::');

        var promptstr = rcpHelper.introRecipe();

        promptstr += 'Say, describe for a description, or ';
        var promptstr2 = rspRandomPrompt.getPrompt('Resp_RecipeSelected_Discovery_A');

        promptstr += promptstr2;

        this.emit(':ask', promptstr, promptstr2);

    },

    // handle a request for new recipe
    'Intent_RecipeDescribe': function () {
        console.log('Intent_RecipeDescribe Handler in state RECIPESELECTED:::');

        var promptstr = rcpHelper.describeRecipe();

        promptstr += ' <break time=\"0.2s\" /> ';
        promptstr += 'there are ' + rcpHelper.currentRecipeNumberOfIngredients() + 'ingredients in this recipe. '

        var abridgedIngredientList = rcpHelper.shortListofIngredients();
        // if the number of ingredients is
        if (abridgedIngredientList.length < ALLOW_SIZE_INGREDIENTS_IN_DESCRIPTION) {
            promptstr += 'Notably <break time=\"0.2s\" /> ';
            var retstr = abridgedIngredientList.join(', '); // put in , seperating elements in the string
            promptstr += retstr.replace(/\,(?=[^,]*$)/, ", and,"); // put in an and instead of a , for the last seperator
            promptstr += ' <break time=\"0.2s\" /> ';
        }

        var promptstr2 = rspRandomPrompt.getPrompt('Resp_RecipeSelected_Discovery_A');

        promptstr += ' <break time=\"0.2s\" /> ' + promptstr2;

        this.emit(':ask', promptstr, promptstr2);

    },

    'AMAZON.RepeatIntent': function () {
        console.log('AMAZON.RepeatIntent Handler in state RECIPESELECTED:::');

        var promptstr = rcpHelper.describeRecipe();

        var promptstr2 = rspRandomPrompt.getPrompt('Resp_RecipeSelected_Discovery_A');

        promptstr += ' <break time=\"0.2s\" /> ' + promptstr2;

        this.emit(':ask', promptstr, promptstr2);
    },

    'AMAZON.NextIntent': function () {
        console.log('AMAZON.NextIntent Handler in state RECIPESELECTED:::');

        this.handler.state = states.INGREDIENTS;

        var repromptstr = rspRandomPrompt.getPrompt('Resp_Continue_Discovery_B');

        // tell the user , how many ingredients there are in this recipe at the beginning.
        var promptstr = '';
        // promptstr += rspRandomPrompt.getPrompt('Resp_Resume_Ingredients_INTRO');
        promptstr += 'There are ' + rcpHelper.currentRecipeNumberOfIngredients() + ' ingredients. ';
        promptstr += repromptstr;

        this.emit(':ask', promptstr, repromptstr);

    },

    'AMAZON.PreviousIntent': function () {
        console.log('AMAZON.PreviousIntent Handler in state RECIPESELECTED:::');

        this.handler.state = states.TRAVERSESEARCHLIST;
        rcpHelper.resetListCurrent();
        // advance the list and present the choices again
        if (rcpHelper.ResultsFound() > 0) {
            var promptstr = rcpHelper.getNextPageOfItems(PAGINATION_SIZE);
            var repeatpromptstr = 'would you like to repeat the items, or start over ?';

            console.log(promptstr);
            // ask teh user to pick one of the choices
            this.emit(':ask', promptstr, repeatpromptstr);

        } else {
            // prompt for negative search
            var promptstr = 'No recipes found for the search term : ' + RecipeSearchTerm;
            var repeatpromptstr = 'would you like to cancel?';
            promptstr += repeatpromptstr;

            console.log(promptstr);
            this.emit(':ask', promptstr, repeatpromptstr);
        }

    },


    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent Handler in state RECIPESELECTED:::');

        // this.attributes.goBackToState = states.SEARCHRECIPES;
        this.handler.state = states.TRAVERSESEARCHLIST;
        // this.emit('NewSession'); // Uses the handler in newSessionHandlers

        // go back to the traversal of the list
        rcpHelper.resetListCurrent();
        // advance the list and present the choices again
        if (rcpHelper.ResultsFound() > 0) {
            var promptstr = rcpHelper.getNextPageOfItems(PAGINATION_SIZE);
            var repeatpromptstr = 'would you like to repeat the items, or start over ?';

            console.log(promptstr);
            // ask teh user to pick one of the choices
            this.emit(':ask', promptstr, repeatpromptstr);

        } else {
            // prompt for negative search
            var promptstr = 'No recipes found for the search term : ' + RecipeSearchTerm;
            var repeatpromptstr = 'would you like to cancel?';
            promptstr += repeatpromptstr;

            console.log(promptstr);
            this.emit(':ask', promptstr, repeatpromptstr);
        }

    },

    'AMAZON.HelpIntent': function () {
        console.log('AMAZON.HelpIntent Handler in state RECIPESELECTED:::');
    },

    'Unhandled': function () {
        console.log('Unhandled Handler in state RECIPESELECTED:::');
        this.emit(':ask'
            , rspRandomPrompt.getPrompt('Resp_Resume_Ingredients')
            + rspRandomPrompt.getPrompt('Resp_Continue_Discovery_B')
            , rspRandomPrompt.getPrompt('Resp_Continue_Discovery_B')
        );

    }

});


var ingredientsHandlers = Alexa.CreateStateHandler(states.INGREDIENTS, {


    // handle a new session
    'NewSession': function () {
        console.log('NewSession Handler in state INGREDIENTS::: \n\n' + JSON.stringify(this.attributes, null, 4));

        // we got here after teh last action sequence was prompted, and the counter incremented
        if (this.attributes.stepnumber > 0) {
            // in order to get the last statement to be repeated, need to decrement hte counter adn
            // prompt the statement. Then increment back again.
            this.attributes['stepnumber'] -= 1;

            /*
             In xyz, the <say-as interpret-as="ordinal">11</say-as> ingredient is,
             <break time=\"0.4s\" /> blah blah <break time=\"0.4s\" />
             <audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/Continue.mp3\" />
             */
            var promptstmt = 'In ' + this.attributes.currentrecipe.recipename +
                ', the <say-as interpret-as="ordinal">' +
                rcpHelper.currentRecipeNumberOfIngredients() +
                '</say-as> ingredient is, <break time=\"0.4s\" />' +
                this.attributes.currentrecipe.ingredients[this.attributes['stepnumber']].prompt +
                '<break time=\"0.4s\" />' +
                rspRandomPrompt.getPrompt('Resp_Continue_Ingredients');

            this.attributes['stepnumber'] += 1;

            this.emit(':ask'
                , promptstmt
                , rspRandomPrompt.getPrompt('Resp_Continue_Ingredients')
            );

        } else {
            this.emit(':ask'
                , rspRandomPrompt.getPrompt('Resp_Resume_Ingredients')
                + rspRandomPrompt.getPrompt('Resp_Resume_Ingredients_A2')
                , rspRandomPrompt.getPrompt('Resp_Continue_Ingredients')
            );
        }
    },


    // handle the request to proceed with the next ingredient description
    'AMAZON.NextIntent': function () {
        console.log('AMAZON.NextIntent Handler in state INGREDIENTS:::');

        // check if there is ingredients list present.
        if (this.attributes.currentrecipe.hasOwnProperty('ingredients')) {

            // cycle through this list
            var stepnum = this.attributes.stepnumber;
            if (stepnum < this.attributes.currentrecipe.ingredients.length) {

                // increment the step counter for the next cycle of this handler
                // this.attributes.stepnumber = stepnum + 1;
                this.attributes['stepnumber'] += 1;

                // echo the current step to the user
                var promptstmt = '';
                // prefix the ingredient number to the ingredient only 30% of the times.
                if (Math.random() < FEATURE_PROB_STEPNUMBER_UTTER) {
                    promptstmt += '<say-as interpret-as="ordinal">' + (stepnum - 0 + 1) + '</say-as> ingredient <break time=\"0.4s\" /> ';
                }
                promptstmt += this.attributes.currentrecipe.ingredients[stepnum].prompt;
                promptstmt += '<break time=\"0.4s\" />' + rspRandomPrompt.getPrompt('Resp_Continue_AudioOnly');
                this.emit(':ask', promptstmt, rspRandomPrompt.getPrompt('Resp_Continue_Ingredients'));

            } else {

                // all steps completed. exit to the next state
                this.handler.state = states.COOKING;

                // intialize the step counter again, as it is reused for the preparation steps
                this.attributes.stepnumber = 0;

                var promptstmt = rspRandomPrompt.getPrompt('Resp_Resume_Ingredients_B');
                if (Math.floor(Math.random() < FEATURE_PROB_HISTORICAL_FACT)) {
                    promptstmt += ' <break time=\"0.2s\" /> ';
                    // promptstmt += rspRandomPrompt.getPrompt('Resp_HistoricalFacts_AudioOnly');
                    promptstmt += rcpHelper.historicalFactsRecipe();
                    promptstmt += ' <break time=\"0.2s\" /> ';
                }
                promptstmt += rspRandomPrompt.getPrompt('Resp_Resume_Cooking_B');

                console.log('AMAZON.NextIntent Handler in state INGREDIENTS:::' + promptstmt);

                this.emit(':ask'
                    , promptstmt
                    , rspRandomPrompt.getPrompt('Resp_Continue_Ingredients')
                );
            }

        } else {
            // ingredients list does not exist

            // all steps completed. exit to the next state
            this.handler.state = states.COOKING;

            // intialize the step counter again, as it is reused for the preparation steps
            this.attributes.stepnumber = 0;

            this.emit(':ask'
                , rspRandomPrompt.getPrompt('Resp_Resume_Ingredients_B')
                + rspRandomPrompt.getPrompt('Resp_Resume_Cooking_B')
                , rspRandomPrompt.getPrompt('Resp_Continue_Ingredients')
            );
        }

    },

    'AMAZON.ResumeIntent': function () {
        console.log('AMAZON.ResumeIntent Handler in state INGREDIENTS:::');

        this.emit('AMAZON.NextIntent');
    },

    // handle a request to repeat the last instruction in the list
    'AMAZON.RepeatIntent': function () {
        console.log('AMAZON.RepeatIntent Handler in state INGREDIENTS:::');

        // decrement the stepnumber by one, in case its not the first one already
        if (this.attributes['stepnumber'] > 0) {
            this.attributes['stepnumber'] -= 1;
        }
        var promptstmt = this.attributes.currentrecipe.ingredients[this.attributes['stepnumber']].prompt;
        // increment it back again , after we've made the prompt statement
        this.attributes['stepnumber'] += 1;
        this.emit(':ask'
            , rspRandomPrompt.getPrompt('Resp_Repeat_Ingredients')
            + promptstmt + rspRandomPrompt.getPrompt('Resp_Continue_AudioOnly')
            , rspRandomPrompt.getPrompt('Resp_Continue_Ingredients')
        );
    },

    'AMAZON.PreviousIntent': function () {
        console.log('AMAZON.PreviousIntent Handler in state INGREDIENTS:::');

        // decrement the stepnumber by one, in case its not the first one already
        if (this.attributes['stepnumber'] > 1) {
            this.attributes['stepnumber'] -= 2;
        }
        var promptstmt = this.attributes.currentrecipe.ingredients[this.attributes['stepnumber']].prompt;
        // increment it back again , after we've made the prompt statement
        this.attributes['stepnumber'] += 1;
        this.emit(':ask'
            , rspRandomPrompt.getPrompt('Resp_Repeat_Ingredients')
            + promptstmt + rspRandomPrompt.getPrompt('Resp_Continue_AudioOnly')
            , rspRandomPrompt.getPrompt('Resp_Continue_Ingredients')
        )
    },


    // handle request to start over the list again
    'AMAZON.StartOverIntent': function () {
        console.log('AMAZON.StartOverIntent Handler in state INGREDIENTS:::');

        // intialize the step counter again, as it is reused for the preparation steps
        this.attributes.stepnumber = 0;

        this.emit(':ask'
            , rspRandomPrompt.getPrompt('Resp_JumpToSectionStart_Ingredients')
            , rspRandomPrompt.getPrompt('Resp_Continue_Ingredients')
        );

    },

    // handle a request to skip and jump over to the cooking directions
    'Intent_JumpToDirections': function () {
        console.log('Intent_JumpToDirections Handler in state INGREDIENTS:::');

        this.handler.state = states.COOKING;

        // intialize the step counter again, as it is reused for the preparation steps
        this.attributes.stepnumber = 0;

        this.emit(':ask'
            , rspRandomPrompt.getPrompt('Resp_JumpToDirections_Ingredients')
            , rspRandomPrompt.getPrompt('Resp_Continue_Ingredients')
        );

    },

    'Intent_GlossaryLookup': function () {

        var helpText = this.event.request.intent.slots.helptext.value;
        console.log('Intent_GlossaryLookup Handler in state INGREDIENTS::: for help text :: ' + helpText);
        this.emit('Intent_GlossaryLookup'); // Uses the handler in newSessionHandlers
    },


    'Intent_SubstitutesLookup': function () {

        var substitutelookuptext = this.event.request.intent.slots.substitutelookuptext.value;
        console.log('Intent_SubstitutesLookup Handler in state INGREDIENTS::: for help text :: ' + substitutelookuptext);

        var printStmt = substituteHelper.findItem(substitutelookuptext);
        printStmt += ' <break time=\"0.2s\" /> ' + rspRandomPrompt.getPrompt('Resp_Continue_Ingredients_C');
        this.emit(':ask', printStmt, rspRandomPrompt.getPrompt('Resp_Continue_Ingredients_C'));

    },


    'Intent_OrderingIngredients': function () {
        console.log('Intent_OrderingIngredients Handler in state INGREDIENTS:::');

        this.emit(':ask'
            , rspRandomPrompt.getPrompt('Resp_OrderingIngredients_Ingredients')
            , rspRandomPrompt.getPrompt('Resp_Continue_Ingredients')
        );
    },

    'AMAZON.StopIntent': function () {
        console.log('AMAZON.StopIntent Handler in state INGREDIENTS:::');
        // this.attributes.goBackToState = states.SEARCHRECIPES;

        rcpHelper.cleanupAndReset();

        this.handler.state = states.SEARCHRECIPES;
        console.log('AMAZON.StopIntent Handler in state INGREDIENTS::: saving state ' + JSON.stringify(this.attributes, null, 4));

        this.emit(':tell', rspRandomPrompt.getPrompt('Resp_Cancel_Ingredients'));
    },

    'AMAZON.PauseIntent': function () {
        console.log('AMAZON.StopIntent Handler in state INGREDIENTS:::');
        this.emit(':tell', 'OK.');
    },

    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent Handler in state INGREDIENTS:::');
        // this.attributes.goBackToState = states.SEARCHRECIPES;

        rcpHelper.cleanupAndReset();

        this.handler.state = states.SEARCHRECIPES;
        console.log('AMAZON.CancelIntent Handler in state INGREDIENTS::: saving state ' + JSON.stringify(this.attributes, null, 4));

        this.emit(':tell', rspRandomPrompt.getPrompt('Resp_Cancel_Ingredients'));
    },


    'ExitAndErasePersistence': function () {
        console.log('ExitToResumeIntent Handler! in state INGREDIENTS:::');

        // clean up recipe from the persistence too
        this.handler.state = states.SEARCHRECIPES;
        this.emit(':tell', 'see you next time.');
    },

    'Unhandled': function () {
        console.log('Unhandled Handler in state INGREDIENTS:::');

        var say_stmt = rspRandomPrompt.getPrompt('Resp_Unhandled_Ingredients');

        var repeat_stmt = rspRandomPrompt.getPrompt('Resp_Continue_Ingredients');

        this.emit(':ask', say_stmt, repeat_stmt);
    }


});


var cookingHandlers = Alexa.CreateStateHandler(states.COOKING, {


    // handle a new session
    'NewSession': function () {
        console.log('NewSession Handler in state COOKING::: \n\n' + JSON.stringify(this.attributes, null, 4));
        this.attributes.ignoreUnhandled = false;

        // we got here after teh last action sequence was prompted, and the counter incremented
        if (this.attributes.stepnumber > 0) {
            // in order to get the last statement to be repeated, need to decrement hte counter adn
            // prompt the statement. Then increment back again.
            this.attributes['stepnumber'] -= 1;

            /*
             In recipe xyz. Assuming you've completed the 4th step. Say next to continue.
             */
            var promptstmt = '';
            var repromptstmt = '';

            // detect if there is an early wake up detected.
            if (this.attributes.currentrecipe.cookingsteps[this.attributes['stepnumber']].hasOwnProperty('starttime')) {
                // check against the starttime
                var timeNow = Math.floor(Date.now() / 1000);
                var timeElapsedSecs = timeNow - this.attributes.currentrecipe.cookingsteps[this.attributes['stepnumber']].starttime;
                var stepDurationSecs = utilsHelper.timeDurationInSeconds(this.attributes.currentrecipe.cookingsteps[this.attributes['stepnumber']].duration);
                if ((  stepDurationSecs - timeElapsedSecs ) > 120) {

                    promptstmt += rspRandomPrompt.getPrompt('Resp_Resume_Cooking_D1');
                    promptstmt += utilsHelper.timeInSpeechFormat(stepDurationSecs - timeElapsedSecs);
                    promptstmt += rspRandomPrompt.getPrompt('Resp_Resume_Cooking_D2');
                    promptstmt += '<say-as interpret-as="ordinal">' + (this.attributes['stepnumber'] - 0 + 1) + '</say-as> step. ';
                    promptstmt += rspRandomPrompt.getPrompt('Resp_Resume_Cooking_D3');

                    // ignore the unhandled, if there is some ambient chatter picked up
                    this.attributes.ignoreUnhandled = true;
                    console.log('setting hte ignoreUnhandled as TRUE');
                } else {
                    promptstmt += 'Assuming you\'ve completed the <say-as interpret-as="ordinal">' +
                        (this.attributes['stepnumber'] - 0 + 1) +
                        '</say-as> step. Say next to continue.';
                    promptstmt += rspRandomPrompt.getPrompt('Resp_Resume_Cooking_A');
                    repromptstmt = rspRandomPrompt.getPrompt('Resp_Continue_Cooking');
                }
            } else {
                promptstmt += 'Assuming you\'ve completed the <say-as interpret-as="ordinal">' +
                    (this.attributes['stepnumber'] - 0 + 1) +
                    '</say-as> step. Say next to continue.';
                promptstmt += rspRandomPrompt.getPrompt('Resp_Resume_Cooking_A');
                repromptstmt = rspRandomPrompt.getPrompt('Resp_Continue_Cooking');
            }


            this.attributes['stepnumber'] += 1;

            this.emit(':ask', promptstmt, repromptstmt);

        } else {

            this.emit(':ask'
                , rspRandomPrompt.getPrompt('Resp_Resume_Cooking_C')
                , rspRandomPrompt.getPrompt('Resp_Continue_Cooking')
            );
        }

    },


    // handle the request to proceed with the next ingredient description
    'AMAZON.NextIntent': function () {
        console.log('AMAZON.NextIntent Handler in state COOKING:::');
        this.attributes.ignoreUnhandled = false;

        // check if there is ingredients list present.
        if (this.attributes.currentrecipe.hasOwnProperty('cookingsteps')) {

            // cycle through this list
            var stepnum = this.attributes.stepnumber;
            console.log('Intent_Continue Handler COOKING::: step number = ' + stepnum);

            if (stepnum < this.attributes.currentrecipe.cookingsteps.length) {
                console.log('Intent_Continue Handler COOKING::: about to extract promt for step number = ' + stepnum);

                // echo the current step to the user
                var promptstmt = '';
                // prefix the ingredient number to the ingredient only 30% of the times.
                if (Math.random() < FEATURE_PROB_STEPNUMBER_UTTER) {
                    promptstmt += '<say-as interpret-as="ordinal">' + (stepnum - 0 + 1) + '</say-as> step <break time=\"0.4s\" /> ';
                }
                promptstmt += this.attributes.currentrecipe.cookingsteps[stepnum].prompt;

                // increment the step counter for the next cycle of this handler
                this.attributes['stepnumber'] += 1;

                if (this.attributes.currentrecipe.cookingsteps[stepnum].hasOwnProperty('duration')) {
                    // if there is a duration associated, add the mention of time, start the timer and sleep

                    promptstmt += ' <break time=\"0.2s\" /> '
                        + 'wake me up after '
                        + this.attributes.currentrecipe.cookingsteps[stepnum].duration
                        + ', when you\'re ready'
                        + rspRandomPrompt.getPrompt('Resp_ClockTick_AudioOnly');

                    // record the start time stamp on this step to compare the return time elapsed
                    this.attributes.currentrecipe.cookingsteps[stepnum].starttime = Math.floor(Date.now() / 1000);

                    console.log('AMAZON.NextIntent Handler in state COOKING:::' + promptstmt);

                    this.attributes.ignoreUnhandled = true; // so that the unhandled is ignored now.
                    this.emit(':ask', promptstmt);

                } else {

                    promptstmt += rspRandomPrompt.getPrompt('Resp_Continue_AudioOnly');
                    var repromptstmt = rspRandomPrompt.getPrompt('Resp_Continue_Cooking');

                    this.emit(':ask', promptstmt, repromptstmt);

                }

            } else {

                // done with the last preparation step
                console.log('Intent_Continue Handler in state COOKING::: preparation steps complete.');

                this.attributes['stepnumber'] = 0;
                this.handler.state = states.SEARCHRECIPES;

                var promptstmt = '<break time=\"0.2s\" /> Well, <break time=\"0.4s\" />  that is all for this recipe. ' +
                    'By the way, <break time=\"0.4s\" />  what rating would you give this recipe? <break time=\"0.4s\" /> ' +
                    'Awesome?, <break time=\"0.4s\" />   Alright? <break time=\"0.4s\" />  or horrible <break time=\"2.0s\" />Got it. ' +
                    '<break time=\"0.4s\" /> We hope to see you soon for your next cooking adventure. ' +
                    '<break time=\"0.4s\" /> Till then, stay healthy! <break time=\"0.4s\" />  I will leave you with a fun fact <break time=\"0.8s\" />';
                promptstmt += cuisineNuggetsHelper.randomFact(this.attributes.currentrecipe.cuisine);
                promptstmt += rspRandomPrompt.getPrompt('Resp_Resume_CloseOut');

                console.log('Intent_Continue Handler in state COOKING::: preparation steps complete.' + promptstmt);
                this.emit(':tell', promptstmt);

            }

        } else {

            console.log('Intent_Continue Handler in state COOKING::: recipe does not have preparation steps.');

            this.attributes['stepnumber'] = 0;
            this.handler.state = states.SEARCHRECIPES;
            this.emit(':tell', rspRandomPrompt.getPrompt('Resp_Resume_CloseOut'));

        }

    },

    'AMAZON.ResumeIntent': function () {
        console.log('AMAZON.ResumeIntent Handler in state COOKING:::');
        this.attributes.ignoreUnhandled = false;
        this.emit('AMAZON.NextIntent');
    },

    // handle a request to repeat the last instruction in the list
    'AMAZON.RepeatIntent': function () {
        console.log('AMAZON.RepeatIntent Handler in state COOKING:::');
        this.attributes.ignoreUnhandled = false;

        // decrement the stepnumber by one, in case its not the first one already
        if (this.attributes['stepnumber'] > 0) {
            this.attributes['stepnumber'] -= 1;
        }

        var stepnum = this.attributes.stepnumber;
        // increment the step counter for the next cycle of this handler
        // this.attributes.stepnumber = stepnum + 1;
        this.attributes['stepnumber'] += 1;

        var promptstmt = rspRandomPrompt.getPrompt('Resp_Repeat_Cooking')
            + this.attributes.currentrecipe.cookingsteps[stepnum].prompt;

        promptstmt += rspRandomPrompt.getPrompt('Resp_Continue_AudioOnly');
        var repromptstmt = rspRandomPrompt.getPrompt('Resp_Continue_Cooking');

        this.emit(':ask', promptstmt, repromptstmt);

    },


    // handle request to start over the list again
    'AMAZON.StartOverIntent': function () {
        console.log('AMAZON.StartOverIntent Handler in state COOKING:::');
        this.attributes.ignoreUnhandled = false;
        this.attributes.stepnumber = 0;

        this.emit(':ask'
            , rspRandomPrompt.getPrompt('Resp_JumpToSectionStart_Cooking')
            , rspRandomPrompt.getPrompt('Resp_Continue_Cooking')
        );

    },


    'Intent_GlossaryLookup': function () {
        this.attributes.ignoreUnhandled = false;
        var helpText = this.event.request.intent.slots.helptext.value;
        console.log('Intent_GlossaryLookup Handler in state COOKING::: for help text :: ' + helpText);
        this.emit('Intent_GlossaryLookup'); // Uses the handler in newSessionHandlers
    },


    'AMAZON.CancelIntent': function () {
        console.log('AMAZON.CancelIntent Handler in state COOKING:::');
        this.attributes.ignoreUnhandled = false;

        rcpHelper.cleanupAndReset();

        // this.attributes['stepnumber'] = 0;

        console.log('AMAZON.CancelIntent Handler in state COOKING::: saving state ' + JSON.stringify(this.attributes, null, 4));

        // clean up recipe from the persistence too
        this.handler.state = states.SEARCHRECIPES;
        // this.emit(':tell', 'see you next time.');
        this.emit(':tell', rspRandomPrompt.getPrompt('Resp_Cancel_Ingredients'));
    },

    'AMAZON.StopIntent': function () {
        console.log('AMAZON.StopIntent Handler in state COOKING:::');
        this.attributes.ignoreUnhandled = false;

        // this.attributes['stepnumber'] = 0;

        // clean up recipe from the persistence too
        this.handler.state = states.SEARCHRECIPES;
        // this.emit(':tell', 'see you next time.');
        this.emit(':tell', rspRandomPrompt.getPrompt('Resp_Cancel_Ingredients'));

    },

    'AMAZON.PauseIntent': function () {
        console.log('AMAZON.StopIntent Handler in state COOKING:::');
        this.attributes.ignoreUnhandled = false;

        this.emit(':tell', 'OK.');
    },
    // SessionEndedEvent
    'SessionEndedRequest': function () {
        console.log('SessionEndedRequest Handler in state COOKING:::');
        this.attributes.ignoreUnhandled = false;
        this.emit(':saveState', true);
    },

    'Unhandled': function () {
        if (!this.attributes.ignoreUnhandled) {
            console.log('Unhandled Handler in state COOKING:::Discovered ignoreUnhandled as FALSE');
            this.emit(':ask', rspRandomPrompt.getPrompt('Resp_Unhandled_Cooking'));
        } else {
            console.log('Unhandled Handler in state COOKING:::Discovered ignoreUnhandled as TRUE. Setting it back to FALSE, after :tell and pause');
            this.attributes.ignoreUnhandled = false;
            // this is a case only for :ask disguised as :tell for the condition in
            // early wakeup for a duration step
            this.emit(':tell', rspRandomPrompt.getPrompt('Resp_ClockTick_AudioOnly'));
        }
    }

});


var commonHandlers = {

    'Unhandled': function () {
        console.log('Unhandled Handler :::');
        this.emit(':ask'
            , rspRandomPrompt.getPrompt('Resp_Unhandled_Generic')
            , rspRandomPrompt.getPrompt('Resp_Continue_Generic')
        );

    }

};
