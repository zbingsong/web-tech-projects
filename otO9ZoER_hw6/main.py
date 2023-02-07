from flask import Flask, request, Response, send_from_directory
from geolib import geohash
from typing import Final
from werkzeug.datastructures import ImmutableMultiDict
import json
import requests

from utils import CATEGORY_OPTIONS, TICKETMASTER_API_KEY, EventDict, EventDetailDict, VenueDetailDict, extract_event, extract_event_detail, extract_venue_detail


app: Final[Flask] = Flask(__name__)

# APIs to serve HTML and static resources
@app.get('/')
@app.get('/index')
def index() -> Response:
  return send_from_directory('static', 'index.html')


@app.get('/<path:filename>')
def get_static_file(filename: str) -> Response:
  return send_from_directory('static', filename)


# APIs to get data from external APIs
@app.get('/event/<string:event_id>')
def get_event_detail(event_id: str) -> str:
  request_url: str = 'https://app.ticketmaster.com/discovery/v2/events/{0}.json?apikey={1}'\
    .format(event_id, TICKETMASTER_API_KEY)
  response: requests.Response = requests.get(request_url)
  if response.status_code >= 400:
    return json.dumps(dict())
  event_detail: EventDetailDict = extract_event_detail(response.json())
  return json.dumps({'event_detail': event_detail})


@app.get('/venue/<string:venue_id>')
def get_venue_detail(venue_id: str) -> str:
  request_url: str = 'https://app.ticketmaster.com/discovery/v2/venues/{0}.json?apikey={1}'\
    .format(venue_id, TICKETMASTER_API_KEY)
  response: requests.Response = requests.get(request_url)
  if response.status_code >= 400:
    return json.dumps(dict())
  venue_detail: VenueDetailDict = extract_venue_detail(response.json())
  return json.dumps({'venue_detail': venue_detail})


@app.get('/search')
def search_events() -> str:
  params: ImmutableMultiDict[str, str] = request.args
  # params = {'keyword': 'usc', 'distance': 10, 'category': 'Default', 'lng': -118.2863, 'lat': 34.0030}
  geo_hash: str = geohash.encode(params['lat'], params['lng'], 7)
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
  event_list: list[EventDict] = list(
    map(extract_event, response.json().get('_embedded', dict()).get('events', list()))
  )
  return json.dumps({'events': event_list})


if __name__ == '__main__':
  app.run(port=8080)
