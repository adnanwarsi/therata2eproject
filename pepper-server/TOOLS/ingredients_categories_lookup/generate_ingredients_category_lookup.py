import sys
import glob
import json
import re

if len(sys.argv) < 2:
    print ('\n\nusage1: \n\n>>>python3 ' + sys.argv[0] + '   <folder with recipe jsons>\n\n')
    exit()

folder= sys.argv[1]

ingredient_instance = int(0)
file_instance = int(0)

'''database to be generated'''
recipe_ingredient_category_lookup = {}

for filename in glob.glob(folder+'*.json'):
    try:
        with open(filename) as data_file:
            data = json.load(data_file)
            file_instance += 1
            for ingredient_obj in data['ingredients']:
                prompt = ingredient_obj['prompt']
                if 'category' in ingredient_obj:
                    category = ingredient_obj['category']
                    print('\n\n%d) %s: \n%d) %s, \t %s' % (file_instance, filename, ingredient_instance, category, prompt))
                    ingredient_instance += 1

                    '''extract the ingredient from the prompt string'''
                    m = re.match(r"((\d+\s+\d+\/\d+\s+\d+)|(\d+\/\d+\s+\d+)|(\d+\s+\d+)|(\d+\s+\d+\/\d+)|(\d+\/\d+)|(\d+))\s+((gram|gm|g|lb|lbs|pound|oz|tablespoon|teaspoon|tbsp|tsp|cup|pint|gallon|ml|qt|inches|inch|bag|small|big)(s)?)?\s*(.*)", prompt)
                    print (m)
                    ingredient_temp = str.lower(m.group(11))

                    # eliminate text in braces
                    ingredient_temp = re.sub(r"\(.*\)", "", ingredient_temp)
                    ingredient = re.split(',|\$', ingredient_temp)[0]
                    ingredient = re.split(' or |\/| of | cup | cups ', ingredient)[-1]


                    # ingredient = re.match('((gram|gm|g|lb|pound|oz|tablespoon|teaspoon|tbsp|tsp|cup|pint|gallon|can)\s+)?(.*)', ingredient).group(2)
                    ingredient = ingredient.strip()
                    print (ingredient)

                    ''' push it to the lookup table'''
                    recipe_ingredient_category_lookup[ingredient]=category

    except:
        print ('\n\n\nERROR: count not process the file %s\n\n\n' % filename)

dict_array = {}

for key,value in sorted(recipe_ingredient_category_lookup.items()):
    print ('%s : %s' % (key, value))

    if value not in dict_array:
        dict_array[value] = []
    dict_array[value].append(key)

print ('\n\n%d ingredient items in lookup table \n\n' % (len(recipe_ingredient_category_lookup)))
'''
print (json.dumps(recipe_ingredient_category_lookup, indent=4))
'''


print(json.dumps(dict_array,indent=4))
