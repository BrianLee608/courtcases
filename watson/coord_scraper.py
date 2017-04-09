from bs4 import BeautifulSoup
import requests
from collections import namedtuple
import json

URL = 'https://inkplant.com/code/state-latitudes-longitudes'

res = requests.get(URL)
data = res.text

soup = BeautifulSoup(data)
table = soup.find('table', attrs={'class': 'table'})
table_body = table.find('tbody')
rows = table_body.find_all('tr')

Coord = namedtuple('Coord', ['label', 'x', 'y'])

coords_json = {'coordinates': []}

for row in rows:
    cols = row.find_all('td')
    cols = [ele.text.strip() for ele in cols] # ['New Jersey', '43.13', '33.4']
    coord = Coord(cols[0], cols[1], cols[2])
    coords_json['coordinates'].append(json.dumps(coord.__dict__))

with open('coordinates.json', 'w') as f:
    json.dump(coords_json, f)
