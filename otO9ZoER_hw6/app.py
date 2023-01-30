from flask import Flask, request, Response, send_from_directory
from geolib import geohash
from typing import Final
from werkzeug.datastructures import ImmutableMultiDict
import json
import requests

from utils import CATEGORY_OPTIONS, TICKETMASTER_API_KEY


EventDict = dict[
  'id': str, 
  'date': str, 
  'time': str, 
  'image_url': str, 
  'name': str, 
  'genre': str, 
  'venue': str
]

app: Final[Flask] = Flask(__name__)

# APIs to serve HTML and static resources
@app.get('/')
def index() -> Response:
  return send_from_directory('static', 'index.html')

@app.get('/<path:filename>')
def get_static_file(filename: str) -> Response:
  return send_from_directory('static', filename)


# APIs to get data from external APIs
@app.get('/event/<string:event_id>')
def get_event_detail(event_id: str):
  return 'event' + event_id

@app.get('/venue/<string:venue_id>')
def get_venue_detail(venue_id: str):
  return 'venue' + venue_id

@app.get('/search')
def search_events():
  # params: ImmutableMultiDict[str, str] = request.args
  params = {'keyword': 'usc', 'distance': 10, 'category': 'Default', 'lng': -118.2863, 'lat': 34.0030}
  geo_hash: str = geohash.encode(params['lat'], params['lng'], 5)
  request_url: str = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey={0}&keyword={1}&geoPoint={2}&radius={3}&unit=miles{4}'\
    .format(
      TICKETMASTER_API_KEY, 
      params['keyword'], 
      geo_hash, 
      params['distance'], 
      CATEGORY_OPTIONS[params['category']]
    )
  response: requests.Response = requests.get(request_url)
  # if error in calling the API, return an empty json object
  if response.status_code >= 400:
    # print(response.text)
    return json.dumps(dict())
  event_list: list[EventDict] = list(map(extract_event, response.json()['_embedded']['events']))
  return json.dumps({'events': event_list})


def extract_event(event_json: dict):
  new_event: EventDict = {  
    'id': '', 
    'date': '', 
    'time': '', 
    'image_url': '', 
    'name': '', 
    'genre': '', 
    'venue': ''
  }
  # id
  new_event['id'] = event_json['id']
  # date
  if (not event_json['dates']['start']['dateTBD']) and (not event_json['dates']['start']['dateTBA']):
    new_event['date'] = event_json['dates']['start']['localDate']
  # time
  if not event_json['dates']['start']['timeTBA']:
    new_event['time'] = event_json['dates']['start']['localTime']
  # image_url
  if len(event_json['images']) > 0:
    # get the first event image with a 16:9 ratio; if none, get the first event image with any ratio
    # adapted from @Jossef Harush Kadouri and @wjandrea's answer at
    # https://stackoverflow.com/questions/2361426/get-the-first-item-from-an-iterable-that-matches-a-condition
    new_event['image_url'] = next(
      (image['url'] for image in event_json['images'] if image['ratio'] == '16_9'), 
      event_json['images'][0]['url']
    )
  # name
  new_event['name'] = event_json['name']
  # genre
  new_event['genre'] = event_json['classifications'][0]['segment']['name']
  # venue
  new_event['venue'] = event_json['_embedded']['venues'][0]['name']
  # return the extracted info on event
  return new_event


if __name__ == '__main__':
  app.run(debug=True)
