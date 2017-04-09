import os
import collections
import json
import nlu

STATES = [ 'ca', 'tx' ]

class Freq:
    def __init__(self):
        self.k = collections.Counter()
        self.n = 0

def main():
    freq = get_freq()
    top_x = sorted(freq.k.items(), key=lambda x: x[1], reverse=True)[:8]

    for k, v in top_x:
        print(k, v)

def get_freq():
    freq_xx = Freq()

    for d in os.listdir('data'):
        for f in os.listdir(os.path.join('data', d)):
            with open(os.path.join('data', d, f)) as s:
                state = d
                proc_opinion(freq_xx, s)

    return freq_xx

def proc_opinion(freq_xx, s):
    opinion = json.load(s)
    html = opinion['plain_text'] or opinion['html_lawbox']
    response = nlu.analyze(html)
    
    for concept in response['concepts']:
        w = concept['text']
        freq_xx.k[w] +=1
    freq_xx.n += 1

main()

