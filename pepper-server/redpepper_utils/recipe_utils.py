import re
import operator
import math
from fractions import Fraction


def recipe_convert_units_using_chart(unit, quantity, unit_conversion_table):
    ''' number of small units in a large unit '''
    def unit_multiple(large_unit, small_unit):
        if small_unit not in unit_conversion_table:
            return
        if large_unit not in unit_conversion_table:
            return
        return unit_conversion_table[small_unit] / unit_conversion_table[large_unit]

    converted_vals = {}
    sorted_vals_keys = {}
    scaled_values_array = []

    for key in unit_conversion_table:
        '''determine number of units in each denomination for the given unit quantitiy'''
        converted_vals[key] = (unit_conversion_table[key] / unit_conversion_table[unit]) * float(quantity)
        sorted_vals_keys = sorted(converted_vals.items(), key=operator.itemgetter(1))

    unit_quantity_left = int(quantity)
    for item in sorted_vals_keys:
        '''
        1. check if item units can account for positive units of smaller units
        '''
        item_unit_quantum = math.floor(unit_quantity_left / unit_multiple(item[0], unit))
        if (item_unit_quantum) > 0:
            scaled_values_array.append([item[0], item_unit_quantum])
            unit_quantity_left -= item_unit_quantum * unit_multiple(item[0], unit)

    print_str = ''
    for item in scaled_values_array:
        print_str += str(item[1]) + ' ' + item[0]
        if item[1] > 1:
            print_str += 's'
        print_str += ' '


    return print_str


def recipe_convert_volume(unit, quantity):
    ''' volume conversion table , as per gallon '''
    volume_units_table = {
        'oz'   : 16,
        'pound': 1
    }

    weight_units_table = {
        'tsp'   : 768,
        'tbsp'  : 256,
        'cup'   : 16,
        'pint'  : 8,
        'gallon': 1
    }

    if not quantity.isdigit():
        return

    '''eliminate the plural, ending s'''
    m = re.match('(^.+?)(s?$)', unit)
    unit = m.group(1)
    if unit in volume_units_table:
        return recipe_convert_units_using_chart(unit, quantity, volume_units_table)
    elif unit in weight_units_table:
        return recipe_convert_units_using_chart(unit, quantity, weight_units_table)
    else:
        return





def simplify_recipe_fraction(frac_str):
    numer = 0
    denom = 0
    whole_num = 0
    reduced_num = 0

    regexp = re.compile('((\d+)\/(\d+))(.*)')
    m = regexp.match(frac_str)
    if( (m is not None) and (len(m.group()) > 0) ):
        numer = int(m.group(2))
        denom = int(m.group(3))
    else:
        return frac_str

    if int(numer) > int(denom):
        reduced_num = int(numer) % int(denom)
        whole_num = math.floor(int(numer)/int(denom))

    if whole_num > 0:
        return "%d and %d/%d " % (whole_num, reduced_num, int(denom))
    else:
        return "%d/%d" % (int(numer), int(denom))




def recipe_serving_multiply(reicpe_json, servings_new):
    if 'servings' in reicpe_json:
        servings_orig_str = reicpe_json['servings']
        p = re.compile('(\d+)(.*)')
        m = p.match(servings_orig_str)
        servings_orig = m.group(1)
        scaling_multiplier = int( round( int(servings_new)/ int(servings_orig) ) )
        reicpe_json['servings'] = servings_new + m.group(2)

        '''iterate over inpredients, and scale'''
        for i in range(0, len(reicpe_json['ingredients'])):
            ingr_str = reicpe_json['ingredients'][i]['prompt']

            '''extract the quantity from the sentence'''
            regexp = re.compile('((\d+\/\d+)|(\d+))\s+(.*)')
            match_str = regexp.match(ingr_str)
            ingr_quant = match_str.group(1)
            rest_of_ing_str = match_str.group(4)

            scaled_fraction = simplify_recipe_fraction(str( Fraction (Fraction(ingr_quant) * Fraction(scaling_multiplier) ) ) )
            new_ingerdient_string = str(scaled_fraction) + ' ' + rest_of_ing_str

            '''now attempt a units reduction'''
            whole_num = 0
            frac_num = ''
            units = ''

            '''check if the scaled ingredient string is (xxx and yy/zz  units ) format'''
            m = re.match(r"(\d+)(\s+and\s+)(\d+\/\d+)\s+([A-Za-z]+)(.+)", new_ingerdient_string)
            if m is not None:
                whole_num = m.group(1)
                frac_num = m.group(3)
                units = m.group(4)
                rest_of_ing_str = m.group(5)
            else:
                '''if not, check if ingredient string is ( xxx units ) format'''
                m = re.match(r"(\d+?)\s+([A-Za-z]+)(.+)", new_ingerdient_string)
                if m is not None:
                    whole_num = m.group(1)
                    units = m.group(2)
                    rest_of_ing_str = m.group(3)
                else:
                    ''' the only other option would be ( xx/yy  unit) format'''
                    ''' don't need to reduce such a fraction '''

            if int(whole_num) > 0:
                reduced_str = recipe_convert_volume(units,whole_num)
                if (len(frac_num) > 0):
                    '''extract the quantity only (minus the unit)'''
                    m = re.match(r"(.*(\d+?)\s+)([A-Za-z]+)", reduced_str)
                    if(m.group(3) == units):
                        '''the units of the fraction and the last part of the reuced string is same'''
                        '''add the fraction to the text'''
                        reduced_str = m.group(1) + 'and ' + frac_num
                        ''' add back the unit and the rest of the string'''
                        new_ingerdient_string = reduced_str + ' ' + units + rest_of_ing_str
                    else:
                        '''the units are different for the fraction remaining'''
                        new_ingerdient_string = reduced_str + 'and '+ frac_num + ' ' + units + rest_of_ing_str
                else:
                    '''there was not a fraction '''
                    if reduced_str is not None:
                        '''there was reduction returned'''
                        new_ingerdient_string = reduced_str + rest_of_ing_str


            ''' scale up the ingredients text '''
            reicpe_json['ingredients'][i]['prompt'] = new_ingerdient_string
