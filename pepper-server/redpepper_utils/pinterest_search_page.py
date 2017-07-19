import datetime
import json
import os
import re
import urllib2
import io
from bs4 import BeautifulSoup  # $ pip install beautifulsoup4

from redpepper_utils.recipe import recipe_extract
from redpepper_utils.recipe import recipe_extract_pinterest_ingredients

''' Pinterest search words : search recipe , pasta
_URL = "https://www.pinterest.com/search/pins/?q=healthy%20pasta%20recipes"
'''

def pinterest_recipes (_URL):
    html = urllib2.urlopen(_URL)
    soup = BeautifulSoup(html, "html.parser")
    json_text = soup.find("script", type="application/json").get_text()

    json_data = json.loads(json_text)
    resourceDataCache = json_data['resourceDataCache'][0]

    ''' make a directory if not already, to save individual receipe files as json '''
    recipe_dir_path = "./recipes_pinterest_json/"
    try:
        os.makedirs(recipe_dir_path)
    except OSError:
        if not os.path.isdir(recipe_dir_path):
            raise


    print ('\n\n{:%Y-%m-%d %H:%M:%S} >>> '.format(datetime.datetime.now()) + 'there are {0} recipes retrieved from {1}'.format(len(resourceDataCache["data"]["results"]), _URL))

    ''' initialize the list of recipes to be generated '''
    recipe_list = []

    for recipe in resourceDataCache["data"]["results"]:
        norm_recipe = {}
        norm_recipe["url"] = recipe["link"]
        norm_recipe["name"] = recipe["title"]
        if recipe["rich_summary"]:
            norm_recipe["url"] = recipe["rich_summary"]["url"]
            norm_recipe["name"] = recipe["rich_summary"]["display_name"]
            norm_recipe["source"] = recipe["rich_summary"]["site_name"]
            norm_recipe["description"] = recipe["rich_summary"]["display_description"]
            norm_recipe["image"] = recipe["images"]["orig"]["url"]
            norm_recipe["pinterestid"] = recipe["id"]

        '''
        print(json.dumps(norm_recipe, sort_keys=True, indent=4))
        print ("\n\n")
        '''

        print('{:%Y-%m-%d %H:%M:%S} >>> '.format(datetime.datetime.now()) + norm_recipe["url"] + ', \t\t' + norm_recipe["name"] + ' \t pin ' + recipe["id"])


        origin_recipe_obj = recipe_extract(norm_recipe["url"])


        if (len(origin_recipe_obj["cookingsteps"]) > 0):

            ''' if the pinterest page for the recipe had ingredients, remove the ingredients from the origin_recipe_obj, and add this one in the norm_recipe'''

            if 'id' in recipe:
                pinterest_recipe_obj_with_ingredients = recipe_extract_pinterest_ingredients("https://www.pinterest.com/pin/" + recipe["id"])
                if len(pinterest_recipe_obj_with_ingredients["ingredients"]):
                    del origin_recipe_obj["ingredients"]
                    for item in pinterest_recipe_obj_with_ingredients:
                        norm_recipe[item] = pinterest_recipe_obj_with_ingredients[item]

            for item in origin_recipe_obj:
                norm_recipe[item] = origin_recipe_obj[item]

            recipe_list.append(norm_recipe)

            ''' write the recipe into a json file '''
            filename = re.sub('\s', '-', norm_recipe["name"]).lower()
            if 'source' in norm_recipe:
                filename += '___' + re.sub('[\s\.]+', '-', norm_recipe["source"]).lower()
            filename += '.json'

            '''
            f = open(recipe_dir_path + filename, 'w')
            json.dump(norm_recipe, f, indent = 4, ensure_ascii=False).encode('utf8')
            f.closed
            '''

            with io.open(recipe_dir_path + filename, 'w', encoding='utf8') as json_file:
                data = json.dumps(norm_recipe, indent=4, ensure_ascii=False)
                # unicode(data) auto-decodes data to unicode if str
                json_file.write(unicode(data))


        else:
            print('{:%Y-%m-%d %H:%M:%S} >>> ERROR >>> '.format(datetime.datetime.now()) + norm_recipe["name"] + ' could not be extracted from url ' + norm_recipe["url"])

    # print(json.dumps(recipe_list, sort_keys=True, indent=4))

# pinterest_recipes(_URL)
