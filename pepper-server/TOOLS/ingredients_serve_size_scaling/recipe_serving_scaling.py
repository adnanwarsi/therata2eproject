import json
import sys
import os

lib_path = os.path.abspath(os.path.join('..', '..'))
sys.path.append(lib_path)
from redpepper_utils import recipe_utils

if len(sys.argv) < 3:
    print ('\n\nusage: \n\n>>>python3 ' + sys.argv[0] + '   <servings>   <recipe json file>\n\n')
    exit()

servings_new = sys.argv[1]
recipe_json_file = sys.argv[2]

with open(recipe_json_file) as json_data:
    recipe_json = json.load(json_data)
    json_data.close()

print('\n\n\n\n\n\n\n')
print (json.dumps(recipe_json, indent=4))
print('\n\n\n\n\n\n\n')


recipe_utils.recipe_serving_multiply(recipe_json, servings_new)

print (json.dumps(recipe_json, indent=4))
