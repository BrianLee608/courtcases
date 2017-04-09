from collections import namedtuple
import json
import os
from pprint import pprint

from util import states_abv_to_full, states_full_to_abv

DATA_DIR = '/Users/brianlee/Desktop/data_watson'

Node = namedtuple('Node', ['id', 'label', 'x', 'y'])

class Edge:
    def __init__(self, id, source, target, n=1):
        self.id = id
        self.source = source
        self.target = target
        self.n = n  # ranges from 1 to 16

    def __str__(self):
        return self.id + '; n = ' + str(self.n)

nodes = set()
edges = dict()

def create_nodes(dirs):
    """ Creates nodes from states listed in file directory """

    for subdir in dirs:
        state_id = subdir[-2:].upper()
        label = states_abv_to_full[state_id]
        x = 0
        y = 0
        n = 0
        node = Node(state_id, label, x, y)
        nodes.add(node)

def parse_abv_from_text(target):
    target = target.replace('.', '')
    if len(target) == 2 and target.upper() in states_abv_to_full.keys():
        # ie CA, MD, NY
        return target.upper()
    elif target in states_full_to_abv.keys():
        # ie California, Maryland, New York
        return states_full_to_abv[target]
    else:
        # ie the location was a city instead ie San Francisco
        return None

def process_entities(data, source):
    """ data is a json object returned from Watson """

    for entity in data['entities']:
        if entity['type'] == 'Location':

            target = parse_abv_from_text(entity['text'])
            if target is None:
                continue

            edge_id = source + '-' + target

            if edge_id in edges and states_abv_to_full[source] != target:
                edges[edge_id].n += 1
            else:
                edges[edge_id] = Edge(edge_id, source, target)

def create_edges(dirs):
    """ Creates edges from namespaced state folders """

    for subdir in dirs:
        source = subdir[-2:].upper()
        for file in os.listdir(subdir):
            with open(os.path.join(subdir, file)) as datafile:
                data = json.load(datafile)
                process_entities(data, source)

def write_nodes_to_jsonfile():
    nodes_json = {'nodes': []}
    for n in nodes:
        nodes_json['nodes'].append(json.dumps(n.__dict__))

    with open('nodes.json', 'w') as f:
        json.dump(nodes_json, f)

def write_edges_to_jsonfile():
    edges_json = {'edges': []}
    for _, v in edges.items():
        edges_json['edges'].append(json.dumps(v.__dict__))

    with open('edges.json', 'w') as f:
        json.dump(edges_json, f)

if __name__ == '__main__':
    dirs = [os.path.join(DATA_DIR, d) for d in os.listdir(DATA_DIR) \
                if os.path.isdir(os.path.join(DATA_DIR, d))]

    create_nodes(dirs)
    create_edges(dirs)

    write_nodes_to_jsonfile()
    write_edges_to_jsonfile()
