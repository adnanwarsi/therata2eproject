import requests
import json


'''
curl -X POST --data-urlencode 'payload={"channel": "#random", "text": "This is posted to #random and comes from a bot named red-pepper support."}' https://hooks.slack.com/services/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
<mailto:bob@example.com|Bob>
'''

import fb

PEPPER_FEEDBACK_SLACK_WEBHOOK = 'https://hooks.slack.com/services/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'

token = 'EAAZAFOQZAwq0gBAP9T8Axkr2by0xadleiLC8JLGVOqsi4kuFkNUZBsYYMTed7ucQoPSpboFZCVrZCQnjKrZALYIgyEAgxcj35NoT6U4eZCZBW5s7ZA5iZA2BQvG8eB9ZBNdp422y8mCeX9oklpSZApc3Ciw0osNsrDCFPpC2zQXG2q5Av4LX8wI5KZBSiAyKsh8bddgwvz1SZB1gK91H8fqgW5kNXpKagx16GAwGAZD'
# token = 'ZAFOQZAwq0gBAP9T8Axkr2by0xadleiLC8JLGVOqsi4kuFkNUZBsYYMTed7ucQoPSpboFZCVrZCQnjKrZALYIgyEAgxcj35NoT6U4eZCZBW5s7ZA5iZA2BQvG8eB9ZBNdp422y8mCeX9oklpSZApc3Ciw0osNsrDCFPpC2zQXG2q5Av4LX8wI5KZBSiAyKsh8bddgwvz1SZB1gK91H8fqgW5kNXpKagx16GAwGAZD'

msg = 'blah blah'



def post_user_feedback_to_slack_channel (fb_token, user_msg):
    return_obj = {}
    return_obj['result'] = 'failed' # initialized

    facebook = fb.graph.api(fb_token)
    fb_user_info = facebook.get_object(cat="single", id='me', fields=["name", "email"])
    if 'error' in fb_user_info:
        return_obj['reason'] = 'Invalid facebook token'  # initialized
        print('ERROR: not a valid FB token')
        return

    else:
        user_name = fb_user_info['name']
        user_email = fb_user_info['email']
        str = '<mailto:' + user_email + '|' + user_name + '>: ' + user_msg
        payload = {"text": str}
        headers = {'content-type': 'application/x-www-form-urlencoded', 'Accept-Charset': 'UTF-8'}
        try:
            r = requests.post(PEPPER_FEEDBACK_SLACK_WEBHOOK, data=json.dumps(payload), headers=headers)
            print (r)
        except requests.exceptions.RequestException as e:
            print("Error :: %s" % e)


post_user_feedback_to_slack_channel(token,msg)

