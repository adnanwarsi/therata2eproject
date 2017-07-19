import json
import re
import sys
import time
import datetime
import boto3
import botocore
import decimal
import fb
import requests
from operator import itemgetter
from redpepper_utils import recipe




if __name__ == "__main__":
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1', endpoint_url="http://localhost:8000")
    ALEXA_DEV_USER_ID = 'amzn1.ask.account.SUPERCALIFRAGILISTICEXPIALIDOTIOUS'
else:
    dynamodb = boto3.resource('dynamodb')
    # this is the user id with current alexa dev account
    ALEXA_DEV_USER_ID = 'amzn1.ask.account.AFP3ZWPOS2BGJR7OWJZ3DHPKMOMA7X4FGLSZDXJCW5R7NZXFO6IWFIUYBCVDMR3VCRNBZBAVDSJVP5Y5PTHWUD3RE6DXBPUNHSJ3RWDRU767WOJ64RALIN7VKIDZ3WCMDWK32UN4LTP4EGKWK4EUUA7S7GEMGNRN2VZTD5NO6XWODWQCFCSBMDSYCN6RIPIUMIPOJIGCPQLFTJA'

PEPPER_FEEDBACK_SLACK_WEBHOOK = 'https://hooks.slack.com/services/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'
COGNITO_IDENTITY_POOL_ID = 'us-west-2:7b674d12-bff0-4fbb-ae3d-02de013a3c29'


table = dynamodb.Table('recipeDepot')


# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)




'''
function to translate a facebook token from the client application
to a valid Alexa User ID stored in the Cognito db
'''
def  get_cognito_records_from_fb_token (fb_token):
    return_obj = {}
    return_obj['result'] = 'failed' # initialized

    AlexaUserID = ''
    try:
        facebook = fb.graph.api(fb_token)
        fb_user_info = facebook.get_object(cat="single", id='me', fields=["name", "email"])
        if 'error' in fb_user_info:
            return_obj['reason'] = 'Invalid facebook token'  # initialized
            # print('ERROR: not a valid FB token')
        else :
            # print (json.dumps(fb_user_info, indent=4, ensure_ascii=False).encode('utf8'))
            # print (fb_user_info['name'])
            return_obj['result'] = 'success'
            return_obj['user_info'] = {}  # initialized
            return_obj['cognito'] = 'none'
            return_obj['user_info']['AlexaUserID'] = 'none'
            return_obj['user_info']['name'] = fb_user_info['name']
            return_obj['user_info']['email'] = fb_user_info['email']

            # check if there exists a cognito record for the FB token identity
            client = boto3.client('cognito-identity','us-west-2')

            resp = client.get_id(Logins={"graph.facebook.com": fb_token}, IdentityPoolId=COGNITO_IDENTITY_POOL_ID)
            print "\nCognito ID: %s" % (resp['IdentityId'])

            if 'IdentityId' in resp:
                COGNITO_ID = resp['IdentityId']
                return_obj['cognito'] = COGNITO_ID
                cognitosync = boto3.client('cognito-sync','us-west-2')
                response = cognitosync.list_records(
                    IdentityPoolId=COGNITO_IDENTITY_POOL_ID,
                    IdentityId=COGNITO_ID,
                    DatasetName='AlexaData',
                )
                print (response)

                for val in response['Records']:
                    return_obj['user_info'][val['Key']] = val['Value']
                # if 'AlexaUserID' in return_obj['user_info']:
                #     return_obj['user_info']['AlexaUserID'] = 'exists'

            else:
                # cognito record does not exists for the FB token
                print ('cognito record does nto exists for the FB token')

    except botocore.exceptions.ClientError as e:
        print("Error in Cognito :: %s" % e)
        return_obj['reason'] = 'Alexa User ID not found'  # initialized

    return return_obj



def retrieveKitchenboardList (cognito_user_id):
    print ('entered function retrieveKitchenboardList')
    return_obj = {}
    return_obj['found'] = 'no'

    try:
        response = table.query(
            ProjectionExpression="kitchenBoard",
            KeyConditionExpression=boto3.dynamodb.conditions.Key('cognitoID').eq(cognito_user_id)
        )

        print("table query succeeded:")
        print(json.dumps(response, indent=4, cls=DecimalEncoder))

        if (response['Count'] > 0):
            return_obj['found'] = 'yes'
            return_obj['recipes'] = []
            for key in response['Items'][0]['kitchenBoard']:
                abridged_recipe_obj = response['Items'][0]['kitchenBoard'][key]['recipe']
                abridged_recipe_obj['timestamp'] = response['Items'][0]['kitchenBoard'][key]['timestamp']
                abridged_recipe_obj.pop('cookingsteps', None)
                abridged_recipe_obj.pop('ingredients', None)

                # add an source website name only for display
                url = abridged_recipe_obj['url']
                m = re.match(r"^https?\:\/\/(.*?)\/", url)
                if m is not None:
                    abridged_recipe_obj['source'] = m.group(1)

                return_obj['recipes'].append(abridged_recipe_obj)
                # sort the list in reverse order of timestamp
                return_obj['recipes'] = sorted(return_obj['recipes'], key=itemgetter('timestamp'), reverse=True)

    except botocore.exceptions.ClientError as e:
        print("could not retrieve any recipes from kitchenBoard ::  %s" % e)
        return_obj['reason'] = e

    print (json.dumps(return_obj, indent=4, ensure_ascii=False, cls=DecimalEncoder))
    return return_obj



def getCognitoId (event):
    return_obj = {}
    return_obj['found'] = 'no'

    if 'token' in event['headers']:
        obj = get_cognito_records_from_fb_token(event['headers']['token'])

        if obj['cognito'] != 'none':
            cognito_id = obj['cognito']
        else :
            return_obj['reason'] = 'invalid token'
            return return_obj
    else:
        return_obj['reason'] = 'token missing'
        return return_obj

    return [cognito_id, return_obj]



'''
handler to get the list of recipes stored at present on the list,
a.k.a. the 'Kitchen Board'. The returned JSON shall will contain an
array of objects that contain the recipe name and few other key/value pairs.
'''
def getKitchenboardHandler(event, context):
    print ('entered lambda handler::getKitchenboardHandler')
    print ("Received event: " + json.dumps(event, indent=4))

    return_obj = {}
    return_obj['found'] = 'no'

    [cognito_id, obj] = getCognitoId(event)
    if len(cognito_id) < 1:
        return obj

    return retrieveKitchenboardList(cognito_id)



def postKitchenboardHandler(event, context):
    print ('entered lambda handler::postKitchenboardHandler')
    print ("Received event: " + json.dumps(event, indent=2))

    return_obj = {}
    return_obj['found'] = 'no'
    origin_recipe_obj = {}

    [cognito_id, obj] = getCognitoId(event)
    if len(cognito_id) < 1:
        return obj

    url = event['query']['recipe_url']

    # find just the url, in a string input that may contain extraneous text
    m = re.search(r"(https?\:\/\/.+?)(\s+|$)", url)
    if m is not None:
        trimmed_url = m.group(1)
        print ('Trimmed URL \n%s\nto \n%s' % (url, trimmed_url))
        url = trimmed_url
    else:
        print ('ERROR : no URL found in \n\n%s' % (url))
        return_obj['reason'] = 'not a url'
        return return_obj

    # check for redirects. e.g. urls like http://pin.it/VhH_nte
    response = requests.get(url)
    if response.history:
        print ("There is URL redirection")
        for resp in response.history:
            print (resp.status_code, resp.url)
        print ("Final destination:")
        print (response.status_code, response.url)
        url = response.url

    ''' if this is a pinterest page of a recipe, extract the ingredients,then call the site for directions.'''
    m = re.match(r"https\:\/\/(www\.pinterest\.com\/pin\/)(\d+)\/(.*)", url)
    if m is not None:
        pinterest_id = m.group(2)
        print ('found pinterest page for recipe %s' % (pinterest_id))
        origin_recipe_obj = recipe.recipe_extract_pinterest_page(url)
    else:
        m = re.match(r"^(https?\:\/\/.*\/)(\?)", url)
        if m is not None:
            trimmed_url = m.group(1)
            print ('Trimmed URL %s  to read and store as %s' % (url, trimmed_url) )
            url = trimmed_url
        origin_recipe_obj = recipe.recipe_extract(url)

    # print (json.dumps(origin_recipe_obj, indent=4, ensure_ascii=False, cls=DecimalEncoder))


    '''check if the recipe object did get filled up with cooking steps'''
    if len(origin_recipe_obj['cookingsteps']) > 0:
        return_obj['found'] = 'yes'

        ''' attempt to write the JSON object into the Dynabo DB table KitchenBoard as new recipe'''


        params = {
            'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %X:%f"),
            'recipe': origin_recipe_obj
        }

        # print (json.dumps(params, indent=4, ensure_ascii=False, cls=DecimalEncoder))

        print('check if record for this cognito ID does not exists, initialize it')
        try:
            response = table.put_item(
                Item = {
                    'cognitoID': cognito_id,
                    'kitchenBoard' : {}
                },
                ConditionExpression = "attribute_not_exists(cognitoID)",
            )
            print(json.dumps(response, indent=4, cls=DecimalEncoder))
        except botocore.exceptions.ClientError as e:
            print ("did not create new entry of cognito in the depot DB::  %s" % e)
            # return_obj['reason'] = e
            # return return_obj

        print('going to add the recipe to the kitchenBoard')

        try:
            response = table.update_item(
                Key={'cognitoID': cognito_id},
                UpdateExpression="SET kitchenBoard.#item = :obj",
                ExpressionAttributeNames = {"#item": params['recipe']['url']},
                ExpressionAttributeValues = {":obj": params},
            )
            print(json.dumps(response, indent=4, cls=DecimalEncoder))
            return_obj['recipe'] = origin_recipe_obj

            # successfully posted the new recipe

            # now GET the new (updated) recipes list to return in the response
            obj = retrieveKitchenboardList(cognito_id)
            return_obj['recipes'] = obj['recipes']

        except botocore.exceptions.ClientError as e:
            print ("did not add the recipe to kitchenboard :: ERROR : %s" % e)
            return_obj['reason'] = e
            return return_obj
    else:
        return_obj['reason'] = 'could not extract recipe'

        # log the recipe, to investigate the algorithm
        facebook = fb.graph.api(event['headers']['token'])
        fb_user_info = facebook.get_object(cat="single", id='me', fields=["name", "email"])
        if 'error' in fb_user_info:
            return return_obj

        str = '<mailto:' + fb_user_info['email'] + '|' + fb_user_info['name'] + '>: could not extract recipe from ' + url
        payload = {"text": str}
        headers = {'content-type': 'application/x-www-form-urlencoded', 'Accept-Charset': 'UTF-8'}
        try:
            requests.post(PEPPER_FEEDBACK_SLACK_WEBHOOK, data=json.dumps(payload), headers=headers)
        except requests.exceptions.RequestException as e:
            print("Error :: %s" % e)


    print (json.dumps(return_obj, indent=4, ensure_ascii=False, cls=DecimalEncoder))

    return return_obj



def touchKitchenboardRecipeHandler(event, context):
    print ('entered lambda handler::touchKitchenboardRecipeHandler')
    print ("Received event: " + json.dumps(event, indent=4))

    return_obj = {}
    return_obj['result'] = 'failed'  # initialized

    [cognito_id, obj] = getCognitoId(event)
    if len(cognito_id) < 1:
        return obj

    url = event['query']['recipe_url']

    # str = 'SET mapAttr.kitchenBoard.' + url + '.timestamp =  \"' + str(datetime.datetime.now()) + '\"'
    print (str)
    # Touch the recipe, which is to update the timestamp to now
    try:
        response = table.update_item(
            Key={'cognitoID': cognito_id},
            UpdateExpression="SET kitchenBoard.#item.#ts = :stamp",
            ExpressionAttributeNames={
                "#item": url,
                "#ts": 'timestamp'
            },
            ExpressionAttributeValues={":stamp": datetime.datetime.now().strftime("%Y-%m-%d %X:%f")},
        )
        return_obj['result'] = 'success'
        # now GET the new (updated) recipes list to return in the response
        obj = retrieveKitchenboardList(cognito_id)
        return_obj['recipes'] = obj['recipes']

        # successfully posted the new recipe
    except botocore.exceptions.ClientError as e:
        print ("Failed to touch the recipe on kitchenboard :: ERROR : %s" % e)
        return_obj['reason'] = e
        return return_obj

    return return_obj




def deleteKitchenboardRecipeHandler(event, context):
    print ('entered lambda handler::deleteKitchenboardRecipeHandler')
    print ("Received event: " + json.dumps(event, indent=4))

    return_obj = {}
    return_obj['result'] = 'failed'  # initialized
    return_obj['removed'] = 'no'

    [cognito_id, obj] = getCognitoId(event)
    if len(cognito_id) < 1:
        return obj

    url = event['query']['recipe_url']
    try:
        response = table.update_item(
            Key={'cognitoID': cognito_id},
            UpdateExpression="REMOVE kitchenBoard.#item",
            ExpressionAttributeNames={"#item": url},
            ReturnValues="UPDATED_NEW"
        )
        print(json.dumps(response, indent=4, cls=DecimalEncoder))
        return_obj['removed'] = 'yes'
        return_obj['result'] = 'success'  # initialized

    except botocore.exceptions.ClientError as e:
        print ("ERROR : %s" % e)
        return_obj['reason'] = e

    print (json.dumps(return_obj, indent=4, ensure_ascii=False, cls=DecimalEncoder))

    return return_obj


def getUserInfoHandler(event, context):
    print ('entered lambda handler::getUserInfoHandler')
    print ("Received event: " + json.dumps(event, indent=4))

    # stub the user id out till this functionality is added and associated with user identity
    # user_id = ALEXA_DEV_USER_ID
    return_obj = {}
    return_obj['result'] = 'failed' # initialized

    if 'token' in event['headers']:
        # return_obj['result'] = 'success'
        # instead, entire return_obj is returned verbatim
        return get_cognito_records_from_fb_token(event['headers']['token'])
    else:
        return_obj['reason'] = 'token missing'

    return return_obj


def postUserInfoHandler(event, context):
    print ('entered lambda handler::postUserInfoHandler')
    print ("Received event: " + json.dumps(event, indent=4))
    return_obj = {}
    return_obj['result'] = 'failed'  # initialized

    possible_parameters = {'name', 'email', 'gender', 'age', 'household_size', 'employment_status', 'cooking_skills'}

    if 'token' in event['headers']:
        obj = get_cognito_records_from_fb_token(event['headers']['token'])

        # check if cognito ID exists
        if 'cognito' in obj:
            cognito_id = obj['cognito']
            cognitosync = boto3.client('cognito-sync', 'us-west-2')

            response = cognitosync.list_records(
                IdentityPoolId=COGNITO_IDENTITY_POOL_ID,
                IdentityId=cognito_id,
                DatasetName='AlexaData',
            )

            write_params = []
            for param_name in possible_parameters:
                if param_name in event['body']:
                    param_obj = {}
                    param_obj['Op'] = 'replace'
                    param_obj['SyncCount'] = response['DatasetSyncCount']
                    param_obj['Key'] = param_name
                    param_obj['Value'] = event['body'][param_name]
                    write_params.append(param_obj)

            try:
                update_response = cognitosync.update_records(
                    IdentityPoolId=COGNITO_IDENTITY_POOL_ID,
                    IdentityId=cognito_id,
                    DatasetName='AlexaData',
                    SyncSessionToken=response['SyncSessionToken'],
                    RecordPatches= write_params
                )

                if len(update_response) > 0:
                    return_obj['result'] = 'success'

            except botocore.exceptions.ClientError as e:
                return_obj['reason'] = e
                print ("ERROR : %s" % e)


    else:
        return_obj['reason'] = 'token missing'

    return return_obj



def postUserFeedbackHandler(event, context):
    print ('entered lambda handler::postUserFeedbackHandler')
    print ("Received event: " + json.dumps(event, indent=4))
    return_obj = {}
    return_obj['result'] = 'failed'  # initialized

    if 'token' not in event['headers']:
        return_obj['reason'] = 'token missing'
        return return_obj

    for param in ['rating','category']:
        if param not in event['body']:
            return_obj['reason'] = param +' missing'
            return return_obj

    facebook = fb.graph.api(event['headers']['token'])
    fb_user_info = facebook.get_object(cat="single", id='me', fields=["name", "email"])
    if 'error' in fb_user_info:
        return_obj['reason'] = 'Invalid facebook token'
        return return_obj

    str = '<mailto:' + fb_user_info['email'] + '|' + fb_user_info['name'] + '>: ' + event['body']['feedback'] + ' [rating:' + event['body']['rating'] + '] [category:' + event['body']['category'] + ']'
    payload = {"text": str}
    headers = {'content-type': 'application/x-www-form-urlencoded', 'Accept-Charset': 'UTF-8'}
    try:
        requests.post(PEPPER_FEEDBACK_SLACK_WEBHOOK, data=json.dumps(payload), headers=headers)
        return_obj['result'] = 'success'
    except requests.exceptions.RequestException as e:
        print("Error :: %s" % e)

    return return_obj



def test():
    start_time = time.time()

    return_obj = {}
    return_obj['result'] = 'failed'

    test_context = {}
    test_event = {}
    test_event['userId'] = ALEXA_DEV_USER_ID

    '''
    # test the postKitchenboardHandler
    url_set = [
        "https://www.pinterest.com/pin/412923859559192662/",
        "https://www.pinterest.com/pin/94434923413538430/",
        "",
        "http://allrecipes.com/recipe/219167/chef-johns-pumpkin-pancakes/",
    ]
    for url in url_set:
        test_event['url'] = url
        postKitchenboardHandler(test_event, test_context)

    '''

    '''
    # test the getKitchenboardHandler
    getKitchenboardHandler(test_event, test_context)
    '''

    '''
    # test the deleteKitchenboardRecipeHandler
    test_event['url'] = "http://allrecipes.com/recipe/219167/chef-johns-pumpkin-pancakes/"
    deleteKitchenboardRecipeHandler(test_event, test_context)
    '''

    TEST_VALID_FB_TOKEN = 'EAAZAFOQZAwq0gBAHU43BS9ZAqfah0ZBwpRzxAzenCjrWUdYJ11wk4JgjUHZCSOPWjNy9IPCrJOPyUP5I3pj84jSfwLs7Ujct53JdZCUuBPPUuqlZB79ZBwRquN6eRLdOxXx6TVmWz2ZAkZAojBlkQe5QPZCwOlGtZCPZB6r4ZD'
    TEST_INVALID_FB_TOKEN = 'EAAZAFOQZAwq0gBAHU43BS9ZAqfah0ZBwpRzxAzenCjrWUdYJ11wk4JgjUHZCSOPWjNy9IPCrJOPyUP5I3pj84jSfwLs7Ujct53JdZCUuBPPUuqlZB79ZBwRquN6eRLdOxXx6TVmWz2ZAkZAojBlkQe5QPZCwOlGtZCPZB6r4Z'

    return_obj = get_cognito_records_from_fb_token(TEST_VALID_FB_TOKEN)
    if ( 'failed' == return_obj['result']):
        print ('ERROR : %s' % return_obj['reason'])
    else:
        if 'AlexaUserID' in return_obj['user_info']:
            print ('Alexa User ID exists')
        else:
            print ('Alexa User ID not defined')


    elapsed_time = time.time() - start_time
    print('\n\n >>> Exectution time : %.3f seconds \n\n' % (elapsed_time))

    print(json.dumps(return_obj, indent=4))

    return return_obj


if __name__ == "__main__":
    sys.exit(test())
