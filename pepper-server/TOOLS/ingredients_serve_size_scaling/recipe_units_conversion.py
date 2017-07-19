import sys
import os

lib_path = os.path.abspath(os.path.join('..', '..'))
sys.path.append(lib_path)
from redpepper_utils import recipe_utils

''' scripts arguments house keeping '''

if len(sys.argv) < 3:
    print ('\n\nusage1: \n\n>>>python3 ' + sys.argv[0] + '   <quantity>   <vol units>\n\n')
    exit()

quantity = sys.argv[1]
unit = sys.argv[2]

if not quantity.isdigit():
    print ('\n\nsecond argument not a digit!! \n\nusage: \n\n>>>python3 ' + sys.argv[0] + '   <quantity>   <vol units>\n\n')
    exit()

print (recipe_utils.recipe_convert_volume(unit, quantity))