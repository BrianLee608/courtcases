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
    freq_us, freq_xx_dict = get_freq()
    for state, freq_xx in freq_xx_dict:
        print(state)
        freq = get_norm_freq_xx(freq_us, freq_xx_dict[state])
        top = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:8]
        for k, v in top:
            print(k, v)

def get_freq():
    freq_us = Freq()
    freq_xx_dict = {
        'ca': Freq(),
        'tx': Freq()
    }

    for d in os.listdir('data'):
        for f in os.listdir(os.path.join('data', d)):
            with open(os.path.join('data', d, f)) as s:
                state = d
                proc_opinion(freq_us, freq_xx_dict[state], s)

    return freq_us, freq_xx_dict

def proc_opinion(freq_us, freq_xx, s):
    opinion = json.load(s)
    html = opinion['plain_text'] or opinion['html_lawbox']
    response = nlu.analyze(html)
    
    for concept in response['concepts']:
        w = concept['text']
        freq_us.k[w] += 1
        freq_xx.k[w] +=1
    freq_us.n += 1
    freq_xx.n += 1

def get_norm_freq_xx(freq_us, freq_xx):
    norm_freq_xx = {}
    for w, c in freq_xx.k:
        tf = c / float(freq_xx.n)
        idf = float(freq_us.n) / freq_us.k[w]
        norm_freq_xx[w] = tf * idf
    return norm_freq_xx

main()

