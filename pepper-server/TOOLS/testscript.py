import json
import re
import os
import sys
import requests


lib_path = os.path.abspath(os.path.join('..'))
sys.path.append(lib_path)
from redpepper_utils import recipe
# import datetime

if len(sys.argv) < 2:
    print ('\n\nusage: \n\n>>>python ' + sys.argv[0] + ' url \n\n')
    exit()

url = sys.argv[1]

# find just the url, in a string input that may contain extraneous text
m = re.search(r"(https?\:\/\/.+?)(\s+|$)", url)
if m is not None:
    trimmed_url = m.group(1)
    print ('Trimmed URL \n%s\nto \n%s' % (url, trimmed_url))
    url = trimmed_url
else:
    print ('ERROR : no URL found in \n\n%s' % (url))
    exit()

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
        print ('Trimmed URL %s  to read and store as %s' % (url, trimmed_url))
        url = trimmed_url
    origin_recipe_obj = recipe.recipe_extract(url)

# print (origin_recipe_obj)