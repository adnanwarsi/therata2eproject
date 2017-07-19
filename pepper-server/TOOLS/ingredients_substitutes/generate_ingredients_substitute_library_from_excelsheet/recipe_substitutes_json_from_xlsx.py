import json
import sys
from xlrd import open_workbook

if len(sys.argv) < 2:
    print ('\n\nusage1: \n\n>>>python3 ' + sys.argv[0] + '   <substitutes xls file>\n\n')
    exit()

xls_file = sys.argv[1]


wb = open_workbook(xls_file)
sheets = wb.sheets()
number_of_rows = sheets[0].nrows
number_of_columns = sheets[0].ncols

print ('rows %d and columns %d' % (number_of_rows, number_of_columns))

dict = {}

for row in range(1, number_of_rows):

    ingredient = sheets[0].cell(row,0).value.lower()
    amount = sheets[0].cell(row,1).value.lower()
    substitutes = sheets[0].cell(row,2).value.lower()

    substitute_obj = {}
    if len(amount) > 0: substitute_obj["unit"] = amount
    substitute_obj["substitute"] = substitutes

    if ingredient not in dict: dict[ingredient] = []
    dict[ingredient].append(substitute_obj)


print (json.dumps(dict, indent=4, ensure_ascii=False, sort_keys=True))
