import json
import sys
import re

if len(sys.argv) < 3:
    print ('\n\nusage1: \n\n>>>python3 ' + sys.argv[0] + '<cooking steps file> <stanford parser output file>\n\n')
    exit()



class Node(object):
    def __init__(self, token):
        self.token = token
        self.children = []
        self.data = None
        self.depth = 0

    def add_child(self, obj):
        self.children.append(obj)
        obj.parent = self
        obj.depth = self.depth + 1

    def add_data(self, data):
        self.data = data

    def tree_data_string(self):
        # print (self.token),
        if self.data is None:
            str = ''
            for child in self.children:
                str += child.tree_data_string() + ' '
            return str
        else:
            # print (' (%d) %s ' % (self.depth, self.data)),
            return self.data

    def tree_data_string_upto_NN(self, limiter_token_found=False):
        # print (self.token),
        if self.data is None:
            str = ''
            for child in self.children:
                (ret_str, limiter_token_found) = child.tree_data_string_upto_NN(limiter_token_found)
                str += ret_str + ' '
                if limiter_token_found == True:
                    break
            return (str, limiter_token_found)
        else:
            # print (' (%d) %s ' % (self.depth, self.data)),
            if (self.token == 'NN'):
                # print ('found NN . should end here ')
                # print (' (%d) %s ' % (self.depth, self.data)),
                limiter_token_found = True
            return ( self.data, limiter_token_found )


    def find_action_sentence (self, sequence, stepback = 1):
        if ( self.depth == len(sequence) ) and ( sequence[self.depth - 1] == self.token ):
            # print ('>>>>>>>>>>>>>>>found ')
            # print ( self.parent.tree_data_string() )
            # return  self.parent.tree_data_string()
            if stepback == 1:
                (str, found) = self.parent.tree_data_string_upto_NN()
            elif stepback == 2:
                (str, found) = self.parent.parent.tree_data_string_upto_NN()
            return str
        elif ( self.depth < len(sequence) ) and ( sequence[self.depth - 1] == self.token ):
            # print ('at depth %d and matching token %s to match with self token %s' %(self.depth, sequence[self.depth - 1], self.token))
            str = ''
            for child in self.children:
                return_val = child.find_action_sentence(sequence)
                if return_val is not None:
                    str += return_val
                    return str




def create_tree(largeline, prevNode):
    currNode = None
    endPos = 0
    x = 0
    while x < len(largeline):
        # print (largeline[x:])
        pattern_token = re.compile('\s*\(([A-Z]+(\$)*)\s+')
        pattern_data = re.compile('\s*([A-Za-z\-0-9]+)(\)?)\s*')
        # pattern_data = re.compile('\s*(\S+)(\)?)\s*')
        pattern_close_brace = re.compile('\s*(\))\s*')
        pattern_punctuation = re.compile('((\(\. \.\))|(\(\, \,\)))')
        odd_pattern = re.compile('\(((\-[A-Z]+\-\s+\-[A-Z]+\-)|(\'\' \')|(`` `))\)')

        # m = pattern_token.match(largeline[x:])
        if odd_pattern.match(largeline[x:]) is not None:
            m = odd_pattern.match(largeline[x:])
            data = m.group(1)
            endPos = m.end()
            # print ('|||||'),
        elif pattern_token.match(largeline[x:]) is not None:
            m = pattern_token.match(largeline[x:])
            token = m.group(1)
            endPos = m.end()
            currNode = Node(token)
            prevNode.add_child(currNode)
            prevNode = currNode
            # print ('<%s>' % (token)),
        elif pattern_data.match(largeline[x:]) is not None:
            m = pattern_data.match(largeline[x:])
            data = m.group(1)
            endPos = m.end()
            currNode.add_data(data)
            # print ('  %s  ' % (data)),
            prevNode = prevNode.parent
            currNode = currNode.parent
        elif pattern_close_brace.match(largeline[x:]) is not None:
            m = pattern_close_brace.match(largeline[x:])
            endPos = m.end()
            prevNode = prevNode.parent
            currNode = currNode.parent
        elif pattern_punctuation.match(largeline[x:]) is not None:
            m = pattern_punctuation.match(largeline[x:])
            data = m.group(1)
            endPos = m.end()
        else:
            print ('\n\n\n\ndont recoganize at position %d of %d in string \n\n%s\n\n' % (x, len(largeline), largeline[x:]))
            break

        x += endPos




''' extract the individual sentences that will correspond to the NLP structures produced '''
with open(sys.argv[1], 'r') as myfile:
    cooking_steps_all=myfile.read().replace('\n', '')
cooking_steps_array_of_sentences = cooking_steps_all.split('.')
map(str.strip, cooking_steps_array_of_sentences)
cooking_steps_array_of_sentences = filter(None, cooking_steps_array_of_sentences)
print ('\nNumber of cooking steps sentences is %d before NLP parsing' % (len(cooking_steps_array_of_sentences)))
# print (cooking_steps_array_of_sentences)



''' build the tree data structure from the NLP parsed file '''
lines = [line.strip() for line in open(sys.argv[2])]
largeline = ' '.join(lines)
Tree = Node('TREE')
create_tree(largeline, Tree)
print ('Number of NLP sentences parsed is %d \n' % (len(Tree.children)))


''' Find look ahead version, if exists, for each cooking step sentence '''
for i in range(len(cooking_steps_array_of_sentences)):
    print('COOKING STEP [%02d] : %s' % (i+1, cooking_steps_array_of_sentences[i]))
    # print Tree.children[i].tree_data_string()
    # verb_string = Tree.children[i].find_action_sentence(['ROOT', 'S', 'VP', 'VB'])
    if Tree.children[i].find_action_sentence(['ROOT', 'S', 'VP', 'VB']) is not None:
        verb_string = Tree.children[i].find_action_sentence(['ROOT', 'S', 'VP', 'VB'], 1)
        print('LOOK AHEAD VERSION 1: %s' % (verb_string))
    elif Tree.children[i].find_action_sentence(['ROOT', 'S', 'NP', 'NN']) is not None:
        verb_string = Tree.children[i].find_action_sentence(['ROOT', 'S', 'NP', 'NN'], 2)
        print('LOOK AHEAD VERSION 3: %s' % (verb_string))
    '''
    elif Tree.children[i].find_action_sentence(['ROOT', 'S', 'VP', 'VP', 'VB']) is not None:
        verb_string = Tree.children[i].find_action_sentence(['ROOT', 'S', 'VP', 'VP', 'VB'], 1)
        print('LOOK AHEAD VERSION 2: %s' % (verb_string))
    '''

    print ('\n\n')
