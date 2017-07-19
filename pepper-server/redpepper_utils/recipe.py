from bs4 import BeautifulSoup
import re
import json
import requests
import decimal


def recipe_extract(url):
    data = {}
    data['ingredients'] = []
    data['cookingsteps'] = []
    data['url'] = url

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
        }

        r = requests.get(url, headers=headers)
        page = r.text
    except Exception as e:
        print (e)
        return data


    bsObj = BeautifulSoup(page, "html.parser")


    ''' find the ingredients list '''
    if bsObj.find_all(itemprop=re.compile("ingredient", re.I)):
        for link in bsObj.find_all(itemprop=re.compile("ingredient", re.I)) :
            data['ingredients'].append({'prompt': re.sub('[\n\r]+', '', link.get_text()).strip()})
    elif bsObj.find_all(itemprop=re.compile("ingredients", re.I)):
        for link in bsObj.find_all(itemprop=re.compile("ingredients", re.I)) :
            data['ingredients'].append({'prompt': re.sub('[\n\r]+', '', link.get_text()).strip()})

    ''' find the cooking instructions list '''
    if bsObj.find_all("li", class_=re.compile("instruction", re.I)):
        for link in bsObj.find_all("li", class_=re.compile("instruction", re.I)) :
            data['cookingsteps'].append({'prompt':re.sub('[\n\r]+', '', link.get_text()).strip()})
    elif bsObj.find_all(itemprop=re.compile("recipeInstructions", re.I)):
        for link in bsObj.find_all(itemprop=re.compile("recipeInstructions", re.I)) :
            data['cookingsteps'].append({'prompt':re.sub('[\n\r]+', '', link.get_text()).strip()})
    elif bsObj.find_all("div", class_=re.compile("instruction", re.I)):
        for link in bsObj.find_all("div", class_=re.compile("instruction", re.I)) :
            if link.find_all("li"):
                for instruction in link.find_all("li"):
                    data['cookingsteps'].append({'prompt': re.sub('[\n\r]+', '', instruction.get_text()).strip()})
    elif bsObj.find_all(itemprop=re.compile("instruction", re.I)):
        for link in bsObj.find_all(itemprop=re.compile("instruction", re.I)) :
            if link.find_all("li"):
                for instruction in link.find_all("li"):
                    data['cookingsteps'].append({'prompt': re.sub('[\n\r]+', '', instruction.get_text()).strip()})
    elif bsObj.find_all("span", class_=re.compile("direction(.*)list")):
        for link in bsObj.find_all("span", class_=re.compile("direction(.*)list")):
            data['cookingsteps'].append({'prompt': re.sub('[\n\r]+', '', link.get_text()).strip()})


    ''' find the name of the recipe '''
    if bsObj.find("meta", property="og:title"):
        data['name'] = bsObj.find("meta", property="og:title")['content']
    elif bsObj.find("div", itemprop="name"):
        data['name'] = bsObj.find("div", itemprop="name").get_text()

    ''' find the description of the recipe '''
    if bsObj.find("meta", property="og:description"):
        data['description'] = bsObj.find("meta", property="og:description")['content']

    ''' find the image of the recipe '''
    if bsObj.find("meta", property="og:image"):
        data['image'] = bsObj.find("meta", property="og:image")['content']

    ''' find the total preperation time '''
    if bsObj.find("span", itemprop="totalTime"):
        data['cookingtime'] = bsObj.find("span", itemprop="totalTime").get_text()
    elif bsObj.find("time", itemprop="totalTime"):
        data['cookingtime'] = bsObj.find("time", itemprop="totalTime").get_text()

    ''' find the recipe yield '''
    if bsObj.find("span", itemprop="recipeYield"):
        data['servings'] = str(bsObj.find("span", itemprop="recipeYield").get_text())
    elif bsObj.find("time", itemprop="recipeYield"):
        data['servings'] = str(bsObj.find("time", itemprop="recipeYield").get_text())

    ''' find the aggregate rating '''
    if bsObj.find("meta", property="og:rating"):
        data['aggregateRating'] = str(decimal.Decimal(bsObj.find("meta", property="og:rating")['content']).quantize(decimal.Decimal('.01')))
    elif bsObj.find("span", itemprop="aggregateRating"):
        data['aggregateRating'] = str(decimal.Decimal(re.sub('[\n\r]+', '', bsObj.find("span", itemprop="aggregateRating").get_text()).strip()).quantize(decimal.Decimal('.01')))
    elif bsObj.find("time", itemprop="aggregateRating"):
        data['aggregateRating'] = str(decimal.Decimal(re.sub('[\n\r]+', '', bsObj.find("div", itemprop="aggregateRating").get_text()).strip()).quantize(decimal.Decimal('.01')))

    ''' find the rating scale'''
    if bsObj.find("meta", property="og:rating_scale"):
        data['rating_scale'] = str(bsObj.find("meta", property="og:rating_scale")['content'])

    ''' find the review count'''
    if bsObj.find("meta", itemprop="reviewCount"):
        data['reviewCount'] = str(bsObj.find("meta", itemprop="reviewCount")['content'])


    ''' (json.dumps(data, indent=4, ensure_ascii=False)) '''
    return data


def recipe_extract_pinterest_ingredients(pinterest_recipe_url):
    data = {}
    data['ingredients'] = []

    try:
        r = requests.get(pinterest_recipe_url)
        htmlpage = r.text
    except Exception as e:
        print (e)
        return data

    bsObj = BeautifulSoup(htmlpage, "html.parser")

    script_text = bsObj.find('script', type="application/json")
    if len(script_text) > 0 :
        json_text = json.loads(script_text.get_text())

        # print(json.dumps(json_text['resourceDataCache'][0]['data']['rich_metadata'] ,indent=4))

        if 'resourceDataCache' in json_text:
            if 'data' in json_text['resourceDataCache'][0]:
                if ('rich_metadata' in json_text['resourceDataCache'][0]['data']) and (json_text['resourceDataCache'][0]['data']['rich_metadata'] != None):
                    if ('recipe' in json_text['resourceDataCache'][0]['data']['rich_metadata']) and (json_text['resourceDataCache'][0]['data']['rich_metadata']['recipe'] != None):
                        categorized_ingredients = json_text['resourceDataCache'][0]['data']['rich_metadata']['recipe']['categorized_ingredients']
                        for category_obj in categorized_ingredients:
                            for ingredient in category_obj['ingredients']:
                                ingredient_text = ingredient['name']
                                if ('amt' in ingredient) and (ingredient['amt'] != None):
                                    ingredient_text = ingredient['amt'] + " " + ingredient_text
                                data['ingredients'].append({'prompt':ingredient_text, 'category':category_obj['category']})
                        data['diets'] = json_text['resourceDataCache'][0]['data']['rich_metadata']['recipe']['diets']

                        data['url'] = json_text['resourceDataCache'][0]['data']['rich_metadata']['url']
                        if 'null' == data['url']:
                            if 'additional_data' in json_text['resourceDataCache'][0]['data']['rich_metadata']['recipe']:
                                data['url'] = json_text['resourceDataCache'][0]['data']['rich_metadata']['recipe']['additional_data']['url']
                            else:
                                print('could not find recipe destination URL')
                    else:
                        print('could not find recipe')
                else:
                    print ('could not find rich_metadata')
                    if 'link' in json_text['resourceDataCache'][0]['data']:
                        data['url'] = json_text['resourceDataCache'][0]['data']['link']
                        m = re.match(r"^(https?\:\/\/.*\/)(\?)", data['url'])
                        if m is not None:
                            trimmed_url = m.group(1)
                            print ('Trimmed URL %s  to read and store as %s' % (data['url'], trimmed_url))
                            data['url'] = trimmed_url

                        print ('the target url is %s' % (data['url']))
            else:
                print ('could not find data')
        else:
            print('could not find resourceDataCache')


    return data


def recipe_extract_pinterest_page (pinterest_recipe_url):
    recipe_obj = {}
    ''' if this is a pinterest page of a recipe, extract the ingredients,then call the site for directions.'''
    m = re.match(r"https\:\/\/(www\.pinterest\.com\/pin\/)(\d+)\/(.*)", pinterest_recipe_url)
    if m is not None:
        pinterest_id = m.group(2)
        print ('found pinterest page for recipe %s' % (pinterest_id))

        pinterest_site_data = recipe_extract_pinterest_ingredients(pinterest_recipe_url)
        # print (json.dumps(pinterest_site_data, indent=4, ensure_ascii=False))

        if len(pinterest_site_data) > 0 :
            ''' found ingredient and other data '''
            url = pinterest_site_data["url"]
            recipe_obj = recipe_extract(url)

            for item in pinterest_site_data:
                if item not in recipe_obj:
                    recipe_obj[item] = pinterest_site_data[item]

            print (json.dumps(recipe_obj, indent=4, ensure_ascii=False))

    return recipe_obj

