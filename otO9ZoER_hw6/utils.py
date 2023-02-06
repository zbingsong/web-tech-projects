from typing import Final, TypedDict, Tuple


# constants
TICKETMASTER_API_KEY: Final[str] = 'kokaaLQxqCux3XHdGCnVGD2zh6mODd2r'

CATEGORY_OPTIONS: Final[dict[str, str]] = {
  'Default': '',
  'Music': '&segmentId=KZFzniwnSyZfZ7v7nJ',
  'Sports': '&segmentId=KZFzniwnSyZfZ7v7nE',
  'Arts': '&segmentId=KZFzniwnSyZfZ7v7na',
  'Theatre': '&segmentId=KZFzniwnSyZfZ7v7na',
  'Film': '&segmentId=KZFzniwnSyZfZ7v7nn',
  'Miscellaneous': '&segmentId=KZFzniwnSyZfZ7v7n1',
}

TICKET_STATUS: Final[dict[str, Tuple[str, str]]] = {
  'none': ('', 'black'),
  'onsale': ('On Sale', 'green'), 
  'offsale': ('Off Sale', 'red'), 
  'canceled': ('Canceled', 'black'), 
  'postponed': ('Postponed', 'orange'), 
  'rescheduled': ('Rescheduled', 'orange')
}


# custom types
class EventDict(TypedDict):
  id: str
  date: str
  time: str
  image_url: str
  name: str
  genre: str
  venue: str

class EventDetailDict(TypedDict):
  name: str
  date: str
  time: str
  artist: list[dict[str, str]]
  genre: str
  venue_id: str
  venue: str
  price: str
  status: str
  status_color: str
  buy: str
  seatmap: str

class VenueDetailDict(TypedDict):
  name: str
  icon: str
  address: list[str]
  city: str
  state: str
  postal: str
  upcoming: str


# helper functions
def extract_event(event_json: dict) -> EventDict:
  new_event: EventDict = {  
    'id': event_json['id'], 
    'date': '', 
    'time': '', 
    'image_url': '', 
    'name': event_json['name'], 
    'genre': '', 
    'venue': ''
  }
  # date
  if (not event_json['dates']['start']['dateTBD']) and (not event_json['dates']['start']['dateTBA']):
    new_event['date'] = event_json['dates']['start']['localDate']
  # time
  if not event_json['dates']['start']['timeTBA']:
    new_event['time'] = event_json['dates']['start']['localTime']
  # image_url
  if len(event_json.get('images', [])) > 0:
    # get the first event image with a 16:9 ratio; if none, get the first event image with any ratio
    # adapted from @Jossef Harush Kadouri and @wjandrea's answer at
    # https://stackoverflow.com/questions/2361426/get-the-first-item-from-an-iterable-that-matches-a-condition
    new_event['image_url'] = next(
      (image['url'] for image in event_json['images'] if image['ratio'] == '16_9'), 
      event_json['images'][0]['url']
    )
  # genre
  if len(event_json['classifications']) > 0:
    new_event['genre'] = event_json['classifications'][0]['segment']['name']
  # venue
  if len(event_json['_embedded'].get('venues', [])) > 0:
    new_event['venue'] = event_json['_embedded']['venues'][0]['name']
  # return the extracted info on event
  return new_event


def extract_event_detail(event_json: dict) -> EventDetailDict:
  event_detail: EventDetailDict = {
    'name': event_json.get('name', ''),
    'date': '',
    'time': '',
    'artist': [],
    'genre': '',
    'venue_id': '',
    'venue': '',
    'price': '',
    'status': TICKET_STATUS[event_json['dates']['status'].get('code', 'none')][0],
    'status_color': TICKET_STATUS[event_json['dates']['status'].get('code', 'none')][1],
    'buy': event_json['url'],
    'seatmap': event_json.get('seatmap', dict()).get('staticUrl', '')
  }
  # date and time
  date_time: dict = event_json['dates']['start']
  if (not date_time['dateTBD']) and (not date_time['dateTBA']):
    event_detail['date'] = date_time['localDate']
  if not date_time['timeTBA']:
    event_detail['time'] = date_time['localTime']
  # artist
  event_detail['artist'] = list(
    map(
      lambda attraction: {'artist': attraction['name'], 'url': attraction.get('url', '')}, 
      event_json['_embedded'].get('attractions', [])
    )
  )
  # genre
  if len(event_json['classifications']) > 0:
    classification: dict = event_json['classifications'][0]
    genre_list: list[str] = []
    if 'segment' in classification:
      genre_list.append(classification['segment']['name'])
    if 'genre' in classification:
      genre_list.append(classification['genre']['name'])
    if 'subGenre' in classification:
      genre_list.append(classification['subGenre']['name'])
    if 'type' in classification:
      genre_list.append(classification['type']['name'])
    if 'subType' in classification:
      genre_list.append(classification['subType']['name'])
    event_detail['genre'] = ' / '.join(genre_list)
  # venue
  if len(event_json['_embedded'].get('venues', [])) > 0:
    venue: dict = event_json['_embedded']['venues'][0]
    event_detail['venue'] = venue['name']
    event_detail['venue_id'] = venue['id']
  # price
  if 'priceRanges' in event_json:
    price_range: dict = event_json['priceRanges'][0]
    event_detail['price'] = '{0} - {1} {2}'.format(
      price_range['min'], 
      price_range['max'],
      price_range['currency'],
    )
  # return the extracted event detail
  return event_detail
  

def extract_venue_detail(venue_json: dict) -> dict:
  venue_detail: VenueDetailDict = {
    'name': venue_json.get('name', ''),
    'icon': '',
    'address': [],
    'city': venue_json.get('city', dict()).get('name', ''), 
    'state': venue_json.get('state', dict()).get('stateCode', ''),
    'postal': venue_json.get('postalCode', ''),
    'upcoming': venue_json.get('url', '')
  }
  # icon
  if len(venue_json.get('images', [])) > 0:
    venue_detail['icon'] = venue_json['images'][0]['url']
  # address
  if 'line1' in venue_json['address']:
    venue_detail['address'].append(venue_json['address']['line1'])
    if 'line2' in venue_json['address']:
      venue_detail['address'].append(venue_json['address']['line2'])
      if 'line3' in venue_json['address']:
        venue_detail['address'].append(venue_json['address']['line3'])
  return venue_detail
