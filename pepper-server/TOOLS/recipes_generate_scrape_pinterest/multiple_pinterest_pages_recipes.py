import sys
import os

lib_path = os.path.abspath(os.path.join('..', '..'))
sys.path.append(lib_path)
from redpepper_utils.pinterest_search_page import pinterest_recipes

if len(sys.argv) < 2:
    print ('\n\nusage: \n\n>>>python3 ' + sys.argv[0] + ' <file with pinterest recipe search terms>\n\n')
    exit()

fname = sys.argv[1]

with open(fname) as f:
    lines = f.readlines()

for line in lines:
    '''split the line into words'''
    search_terms = line.split()

    '''
    _URL = "https://www.pinterest.com/search/pins/?rs=ac&len=2&q=recipes%20indian"
    '''
    _URL = "https://www.pinterest.com/search/pins/?rs=ac&len=2&q=recipes"

    for term in search_terms:
        _URL += '%20'+term

    pinterest_recipes(_URL)
