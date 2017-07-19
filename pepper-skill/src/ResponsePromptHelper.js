'use strict';
module.change_code = 1;

//////////////////////////////////////////////////////////////////////////////////////
// audio files on AWS S3 bucket : Directory Path
var AUDIO_FILES_URL_PATH_BASE = 'https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/';

// audio files on AWS S3 bucket : Audio file URL
var AUDIO_FILE_URL_HelloP = AUDIO_FILES_URL_PATH_BASE + 'HelloP.mp3';
var AUDIO_FILE_URL_EndOfSession = AUDIO_FILES_URL_PATH_BASE + 'EndOfSession.mp3';
var AUDIO_FILE_URL_EndOfSection = AUDIO_FILES_URL_PATH_BASE + 'EndOfSection.mp3';
var AUDIO_FILE_URL_JumpingAround = AUDIO_FILES_URL_PATH_BASE + 'JumpingAround.mp3';
var AUDIO_FILE_URL_NegativeResponse = AUDIO_FILES_URL_PATH_BASE + 'NegativeResponse.mp3';
var AUDIO_FILE_URL_Unhandled = AUDIO_FILES_URL_PATH_BASE + 'Unhandled.mp3';
var AUDIO_FILE_URL_Glossary = AUDIO_FILES_URL_PATH_BASE + 'Glossary.mp3';
var AUDIO_FILE_URL_Continue = AUDIO_FILES_URL_PATH_BASE + 'Continue.mp3';
var AUDIO_FILE_URL_Search = AUDIO_FILES_URL_PATH_BASE + 'Search.mp3';
var AUDIO_FILE_URL_ClockTick = AUDIO_FILES_URL_PATH_BASE + 'ClockTick.mp3';

//////////////////////////////////////////////////////////////////////////////////////
var responseCode;
var responsePrompts;

function ResponsePromptStmtsHelper() {
    responseCode = '';
    responsePrompts = {
        Resp_HistoricalFacts_AudioOnly: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Glossary
        },
        Resp_ClockTick_AudioOnly: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_ClockTick
        },
        Resp_NegativeResponse_AudioOnly: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_NegativeResponse
        },
        Resp_Continue_AudioOnly: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_Generic: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_CloseOut: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_CloseOut_B: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_Cooking: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_Cooking_B: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_Discovery: {
            speechtxt: [
                {prompt: 'Say O.K. to proceed, describe to get some detail, or exit.'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_Discovery_B: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_Ingredients: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_Ingredients_B: {
            speechtxt: [
                {prompt: 'That is all for ingredients.'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Continue_Ingredients_C: {
            speechtxt: [
                {prompt: 'say next to proceed with ingredients.'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_JumpToSectionStart_Ingredients: {
            speechtxt: [
                {prompt: 'Sure. Let\'s go back to the top !'},
                {prompt: 'No problem. I\'ll start again !'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_JumpingAround,
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_JumpToDirections_Ingredients: {
            speechtxt: [
                {prompt: 'Sure. Let us begin with the preparation !'},
                {prompt: 'No problem. Let\'s begin with preparation steps !'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_JumpingAround,
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_GlossaryLookup_CloseOut: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_GlossaryLookup_CloseOut_B: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_GlossaryLookup_Cooking: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_GlossaryLookup_Cooking_B: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_JumpToSectionStart_Cooking: {
            speechtxt: [
                {prompt: 'Sure. I\'ll go back to the first step !'},
                {prompt: 'No problem. Let\'s start again !'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_JumpingAround,
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_GlossaryLookup_Discovery: {
            speechtxt: [
                {prompt: 'It appears, you enquired for '}
            ],
            audio_prefix_url : AUDIO_FILE_URL_Glossary
        },
        Resp_GlossaryLookup_Discovery_B: {
            speechtxt: [
                {prompt: 'I don\'t think I\'ve found exactly what you enquired for, but is this helpful ? '}
            ]
        },
        Resp_GlossaryLookup_Discovery_C: {
            speechtxt: [
                {prompt: 'I\'m not sure I know the answer to that.'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_NegativeResponse
        },
        Resp_GlossaryLookup_Ingredients: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_GlossaryLookup_Ingredients_B: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_SubstituteLookup_Ingredients: {
            speechtxt: [
                {prompt: 'It appears, you\'re looking for substitute for '}
            ]
        },
        Resp_RecipeDescribe_CloseOut: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_RecipeDescribe_CloseOut_B: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_RecipeDescribe_Cooking: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_RecipeDescribe_Cooking_B: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_RecipeDescribe_Discovery: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_RecipeDescribe_Discovery_B: {
            speechtxt: [
                {prompt: 'Did not find a description for '}
            ]
        },
        Resp_RecipeDescribe_Ingredients: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_RecipeDescribe_Ingredients_B: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_RecipeSearch_Discovery: {
            speechtxt: [
                {prompt: '<break time=\"0.2s\" /> Looking through the recipes that you have marked  as your favorite, <break time=\"0.2s\" /> and then augmenting it with some of my suggestions, I have the following list for you.'},
                {prompt: '<break time=\"0.2s\" /> Drilling down on your favorites list, <break time=\"0.2s\" /> and then sprinkling some of my suggestions, I have the following list for you. '}
            ],
            audio_prefix_url : AUDIO_FILE_URL_Search
        },
        Resp_RecipeSearch_Discovery_B: {
            speechtxt: [
                {prompt: 'Did not find the recipe for '}
            ]
        },
        Resp_RecipeSearch_Discovery_C: {
            speechtxt: [
                {prompt: 'The following are on your kitchen board.'}
            ]
        },
        Resp_RecipeSelected_Discovery_A: {
            speechtxt: [
                {prompt: 'say proceed to get going through the ingredients. '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Repeat_CloseOut: {
            speechtxt: [
                {prompt: 'Supercalifragilisticexpialidocious'}
            ]
        },
        Resp_Repeat_Cooking: {
            speechtxt: [
                {prompt: '<s>OK </s>'},
                {prompt: '<s>Sure </s>'}
            ]
        },
        Resp_Repeat_SearchRecipes: {
            speechtxt: [
                {prompt: 'or say something like, I feel like some Lasagna today.'},
                {prompt: 'or maybe, I feel like having Lasagna today.'},
                {prompt: 'talk to me, say something like, I am up for some Lasagna.'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_Search
        },
        Resp_Repeat_SearchRecipes_B: {
            speechtxt: [
                {prompt: 'Please try again. You can say, find me a recipe for tea. Or say exit !'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_Search
        },
        Resp_Repeat_Ingredients: {
            speechtxt: [
                {prompt: '<s>OK </s>'},
                {prompt: '<s>Sure </s>'}
            ]
        },
        Resp_Resume_CloseOut: {
            speechtxt: [
                {prompt: 'Hope you enjoyed making it.'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_EndOfSession
        },
        Resp_Resume_Cooking_A1: {
            speechtxt: [
                {prompt: 'Assuming that you have completed the step that says, '}
            ]
        },
        Resp_Resume_Cooking_A: {
            speechtxt: [
                {prompt: ' '}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Resume_Cooking_B: {
            speechtxt: [
                {prompt: 'Let us begin with the preparation !'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue,
            audio_prefix_url : AUDIO_FILE_URL_EndOfSection
        },
        Resp_Resume_Cooking_C: {
            speechtxt: [
                {prompt: 'We went through the ingredients list. Now, let us begin with the preparation !'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Resume_Cooking_D1: {
            speechtxt: [
                {prompt: '<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/ManHmmm.mp3\" /> <break time=\"0.2s\" /> Seems like we are '},
                {prompt: '<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/WomanClearThroat.mp3\" /> <break time=\"0.2s\" /> Seems like we are '},
                {prompt: '<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/Yawning.mp3\" /> <break time=\"0.2s\" /> Seems like we are '}
            ]
        },
        Resp_Resume_Cooking_D2: {
            speechtxt: [
                {prompt: ' before time, in the '}
            ]
        },
        Resp_Resume_Cooking_D3: {
            speechtxt: [
                {prompt: '<break time=\"0.3s\" /> Say \‘Next!\’, if you\’d rather we move along with the cooking, <break time=\"0.2s\" /> or, <break time=\"0.4s\" />  if this was a mistake, I can go back to sleep now. <break time=\"0.4s\" /> Wake me up when its time to go to the next step. '}
            ]
        },
        Resp_Resume_SearchRecipes: {
            speechtxt: [
                {prompt: 'Hello there. Your cooking assistant at your service. Lets find you something you might enjoy today. Just say something like, find me a recipe for tea !'},
                {prompt: 'Ciao. Today I feel a little passionate like an Italian. Lets find you something fun today. Just say something like, I feel like some tea !'},
                {prompt: 'Bonjour. I feel like some French sophistication in the air. Lets find you something fun today. Just say something like, find me a recipe for tea !'},
                {prompt: 'I thought you forgot about me. You never call anymore. Now that I have your attention, lets find you something you might enjoy today. Just say something like, find me a recipe for tea !'},
                {prompt: 'Ni Hao. Hmmmm, Do we feel like some Chinese today? Lets find you something fun today. Just say something like, find me a recipe for tea !'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_HelloP
        },
        Resp_Resume_SearchRecipes_B: {
            speechtxt: [
                {prompt: 'We do not have a recipe yet. You can say, find me a recipe for tea !'}
            ]
        },
        Resp_Resume_SearchRecipes_D: {
            speechtxt: [
                {prompt: 'You can say, find me a recipe for chicken !'},
                {prompt: 'You can say, find me a recipe for breakfast !'},
                {prompt: 'You can say, find me an italian recipe !'},
                {prompt: 'You can say, find me an american recipe with beef!'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_HelloP
        },
        Resp_Resume_SearchRecipes_C: {
            speechtxt: [
                {prompt: 'What are we cooking today?'},
                {prompt: 'What do you feel like eating today?'},
                {prompt: 'How can I help?'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_HelloP
        },
        Resp_Resume_SearchRecipes_E: {
            speechtxt: [
                {prompt: 'let\'s try that again.'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue,
            audio_prefix_url : AUDIO_FILE_URL_Search
        },
        Resp_Resume_SearchRecipes_F: {
            speechtxt: [
                {prompt: '<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/Search.mp3\" /> Ooooooooops!, <break time=\"0.2s\" /> my bad!<break time=\"0.2s\" /> lets try this again '},
                {prompt: '<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/Search.mp3\" /> Hmmmmmmm!, <break time=\"0.2s\" /> my bad!<break time=\"0.2s\" /> lets try this again '},
                {prompt: '<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/Search.mp3\" /> What the?!, <break time=\"0.2s\" /> my bad!<break time=\"0.2s\" /> lets try this again '}
            ]
        },
        Resp_Resume_Ingredients: {
            speechtxt: [
                {prompt: 'Make sure you are ready with the ingredients first. '},
                {prompt: 'Let\'s get setup. '}
            ]
        },
        Resp_Resume_Ingredients_A1: {
            speechtxt: [
                {prompt: 'let us proceed with last ingredient I had mentioned.'}
            ]
        },
        Resp_Resume_Ingredients_A2: {
            speechtxt: [
                {prompt: 'Keep saying O.K. after every ingredient I read out when you hear this sound.'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Resume_Ingredients_B: {
            speechtxt: [
                {prompt: 'That is all for ingredients.'}
            ]
            //audio_suffix_url : AUDIO_FILE_URL_EndOfSection
        },
        Resp_Resume_Ingredients_INTRO: {
            speechtxt: [
                {prompt: '<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/AcousticGuitar.mp3\" /> <break time=\"0.2s\" /> Before we begin<break time=\"0.4s\" /> a quick reminder, <break time=\"0.2s\" /> any time you hear the sound! <break time=\"0.3s\" /> <audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/Continue.mp3\" />,<break time=\"0.4s\" />  say \‘Next!\’, to move to the next step, or <break time=\"0.3s\" />  say \‘Repeat!\’, to hear the last step again. You can also say, \‘Jump to Cooking!\’, <break time=\"0.2s\" /> to go straight into the Cooking steps. <break time=\"0.3s\" />  If you don\’t want to continue with this recipe, just say \‘Cancel!\’ at any time.<break time=\"0.4s\" /> Now, Lets get started. <break time=\"0.8s\" />'},
                {prompt: '<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/EngineStart.mp3\" /> <break time=\"0.2s\" /> Before we begin<break time=\"0.4s\" /> a quick reminder, <break time=\"0.2s\" /> any time you hear the sound! <break time=\"0.3s\" /> <audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/Continue.mp3\" />,<break time=\"0.4s\" />  say \‘Next!\’, to move to the next step, or <break time=\"0.3s\" />  say \‘Repeat!\’, to hear the last step again. You can also say, \‘Jump to Cooking!\’, <break time=\"0.2s\" /> to go straight into the Cooking steps. <break time=\"0.3s\" />  If you don\’t want to continue with this recipe, just say \‘Cancel!\’ at any time.<break time=\"0.4s\" /> Now, Lets get started. <break time=\"0.8s\" /> '}
            ]
        },
        Resp_OrderingIngredients_Ingredients: {
            speechtxt: [
                {prompt: 'consider it done. the order is placed on Amazon Prime. Let\'s continue with other ingredients.'},
                {prompt: 'An order is placed on Amazon Prime. Let\'s continue with other ingredients.'}
            ],
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Cancel_Ingredients: {
            speechtxt: [
                {prompt: '<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/Cancel.mp3\" /> <break time=\"0.2s\" /> You have chosen to cancel this recipe. This will wipe out the current recipe session and close the application. <break time=\"0.3s\" /> We hope to see you soon for your next cooking adventure.<audio src=\"https://s3.amazonaws.com/genie.us.pepper.bucket/AudioFiles16khzMp3/HelloP.mp3\" />'}
            ]
        },
        Resp_Unhandled_Discovery_A: {
            speechtxt: [
                {prompt: 'I did not get that.'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_Unhandled,
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Unhandled_Discovery_B: {
            speechtxt: [
                {prompt: 'I did not get that. Please ask for a recipe. You can say, find me a recipe for tea.'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_Unhandled
        },
        Resp_Unhandled_Ingredients: {
            speechtxt: [
                {prompt: 'Did not understand that.'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_Unhandled,
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Unhandled_Cooking: {
            speechtxt: [
                {prompt: 'Did not understand that.'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_Unhandled,
            audio_suffix_url : AUDIO_FILE_URL_Continue
        },
        Resp_Unhandled_Generic: {
            speechtxt: [
                {prompt: 'Did not understand that.'}
            ],
            audio_prefix_url : AUDIO_FILE_URL_Unhandled,
            audio_suffix_url : AUDIO_FILE_URL_Continue
        }


    };

    // console.log('in the constructor : ResponsePromptStmtsHelper, and the responsePrompts is \n' + JSON.stringify(this.responsePrompts, null, 4));
}

function getPrompt(ResponseCode) {

    // console.log('##### in the getPrompt function ' + ResponseCode);
    // console.log('in getPrompt , and the responsePrompts is \n' + JSON.stringify(responsePrompts, null, 4));

    var item_pick = Math.floor(Math.random() * responsePrompts[ResponseCode].speechtxt.length);
    var speechtext =  responsePrompts[ResponseCode].speechtxt[item_pick].prompt;

    var formattedprompt = speechtext;

    // format in SSML if there is a prefix or suffix audio to be embedded
    if (responsePrompts[ResponseCode].hasOwnProperty('audio_prefix_url')) {
        formattedprompt = '<audio src=\"' + responsePrompts[ResponseCode].audio_prefix_url + '\" /> ' + formattedprompt ;
    }

    if (responsePrompts[ResponseCode].hasOwnProperty('audio_suffix_url')) {
        formattedprompt = formattedprompt + '<audio src=\"' + responsePrompts[ResponseCode].audio_suffix_url + '\" /> ';
    }

    // console.log('##### ResponsePromptStmtsHelper::getPrompt : speech text returned \n' + formattedprompt);

    return formattedprompt;
}


ResponsePromptStmtsHelper.prototype.getPrompt = function (tag) {
    return getPrompt(tag);
};


module.exports = ResponsePromptStmtsHelper;

