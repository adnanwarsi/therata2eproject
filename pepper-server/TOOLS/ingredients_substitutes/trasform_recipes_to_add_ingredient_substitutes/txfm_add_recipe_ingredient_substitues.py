import re
import sys, os
import json
import glob, shutil


def extract_ingredient_from_string(prompt):
    '''extract the ingredient from the prompt string'''
    m = re.match(
        r"((\d+\s+\d+\/\d+\s+\d+)|(\d+\/\d+\s+\d+)|(\d+\s+\d+)|(\d+\s+\d+\/\d+)|(\d+\/\d+)|(\d+))\s+((gram|gm|g|lb|lbs|pound|oz|tablespoon|teaspoon|tbsp|tsp|cup|pint|gallon|ml|qt|inches|inch|bag|small|big)(s)?)?\s*(.*)",
        prompt)
    # print (m)
    # ingredient_temp = str.lower(m.group(11))
    ingredient_temp = 'a'
    try:
        ingredient_temp = m.group(11)
    except:
        print ingredient_temp

    # eliminate text in braces
    ingredient_temp = re.sub(r"\(.*\)", "", ingredient_temp)
    ingredient = re.split(',|\$', ingredient_temp)[0]
    ingredient = re.split(' or |\/| of | cup | cups ', ingredient)[-1]

    # ingredient = re.match('((gram|gm|g|lb|pound|oz|tablespoon|teaspoon|tbsp|tsp|cup|pint|gallon|can)\s+)?(.*)', ingredient).group(2)
    ingredient = ingredient.strip()
    return (ingredient)


def main_code(fname, db_json):
    with open(fname) as json_data:
        recipe_json = json.load(json_data)
        json_data.close()

        for ingredient_obj in recipe_json['ingredients']:
            ingredient_name = extract_ingredient_from_string(ingredient_obj['prompt']).encode('utf-8').lower()
            # ingredient_obj['substitute'] = ''
            for ingredient_db in db_json['list']:
                keyword_in_db = ingredient_db['item'].encode('utf-8').lower()
                if str(ingredient_name) in str(keyword_in_db):
                    ingredient_obj['substitute'] = ingredient_db['substitute']
    return (recipe_json)


def list_of_input_files():
    # List of files to be post Processed.
    list_files = [];
    iter = 0
    for file in glob.glob("*.json"):
        list_files.append(file)
    return (list_files)


def main():
    if not os.path.isdir('recipes_pinterest_json'):
        print "Directory name: 'recipes_pinterest_json' with input files not found. "
        sys.exit()
    else:
        os.chdir('recipes_pinterest_json')

    (list_filenames) = list_of_input_files()
    os.chdir('..')
    subList_file = 'SubstituteList-CW-v1.json'
    if len(list_filenames) == 0:
        print '***No input files found in directory***'
        sys.exit()

    # "substitute list " database
    with open(subList_file) as json_data:
        db_json = json.load(json_data)
        json_data.close()

    dirr = 'recipes_pinterest_json_substitutes'
    try:
        if os.path.exists(dirr):
            shutil.rmtree(dirr)
        os.makedirs(dirr)
    except OSError:
        if not os.path.isdir(dirr):
            raise
    print "Total number of files found = ", len(list_filenames)
    for count in range(0, len(list_filenames)):
        print 'Start Processing File No: ', count + 1, "   :", list_filenames[count]
        os.chdir('recipes_pinterest_json')
        recipe_json = main_code(list_filenames[count], db_json)
        os.chdir('..')
        os.chdir('recipes_pinterest_json_substitutes')
        with open(list_filenames[count], 'w') as outfile:
            json.dump(recipe_json, outfile, indent=4)
            os.chdir('..')


if __name__ == "__main__":
    sys.exit(main())
main()
