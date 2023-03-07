export const TICKETMASTER_API_KEY = 'kokaaLQxqCux3XHdGCnVGD2zh6mODd2r';

export const CATEGORY_OPTIONS = {
  Default: '',
  Music: '&segmentId=KZFzniwnSyZfZ7v7nJ',
  Sports: '&segmentId=KZFzniwnSyZfZ7v7nE',
  Arts: '&segmentId=KZFzniwnSyZfZ7v7na',
  Film: '&segmentId=KZFzniwnSyZfZ7v7nn',
  Miscellaneous: '&segmentId=KZFzniwnSyZfZ7v7n1',
};

const TICKET_STATUS = {
  none: { text: '', color: 'black' },
  undefined: { text: '', color: 'black' },
  onsale: { text: 'On Sale', color: 'green'}, 
  offsale: { text: 'Off Sale', color: 'red'}, 
  canceled: { text: 'Canceled', color: 'black'}, 
  postponed: { text: 'Postponed', color: 'orange'}, 
  rescheduled: { text: 'Rescheduled', color: 'orange'},
};

export function extractEvent(event) {
  if (!event) return {};
  const extractedInfo = {
    id: event.id, 
    date: '', 
    time: '', 
    image_url: '', 
    name: event.name, 
    genre: '', 
    venue: '',
  };
  // date
  if (!(event.dates.start.dateTBD || event.dates.start.dateTBA)) {
    extractedInfo.date = event.dates.start.localDate;
  }
  // time
  if (!event.dates.start.timeTBA) {
    extractedInfo.time = event.dates.start.localTime;
  }
  // image_url
  if (event.images?.length) {
    extractedInfo.image_url = event.images[0];
  }
  // genre
  if (event.classifications?.length) {
    extractedInfo.genre = event.classifications[0].segment.name;
  }
  // venue
  if (event._embedded.venues?.length) {
    extractedInfo.venue = event._embedded.venues[0].name;
  }
  // return
  return extractedInfo;
}

export function extractEventDetail(event) {
  const extractedInfo = {
    name: event.name ?? '',
    date: '',
    time: '',
    artist: [],
    genre: '',
    venue_id: '',
    venue: '',
    price: '',
    status: TICKET_STATUS[event.dates.status.code].text,
    status_color: TICKET_STATUS[event.dates.status.code].color,
    buy: event.url,
    seatmap: event.seatmap?.staticUrl ?? '',
  };
  // date and time
  if (!(event.dates.start.dateTBD || event.dates.start.dateTBA)) {
    extractedInfo.date = event.dates.start.localDate;
  }
  if (!event.dates.start.timeTBA) {
    extractedInfo.time = event.dates.start.localTime;
  }
  // artist
  if (event._embedded.attractions?.length) {
    extractedInfo.artist = event._embedded.attractions.map((attraction) => ({
      artist: attraction.name, 
      url: attraction.url ?? '',
    }));
  }
  // genre
  if (event.classifications?.length) {
    const classifications = event.classifications;
    const genreArray = [];
    const keys = ['segment', 'genre', 'subgenre', 'type', 'subtype'];
    keys.forEach((key) => {
      if (
        classifications[key] 
        && classifications[key].name.toLowerCase() !== 'undefined'
      ) {
        genreArray.push(classifications[key].name);
      }
    });
    extractedInfo.genre = genreArray.join(' | ');
  }
  // venue
  if (event._embedded.venues?.length) {
    const venueInfo = event._embedded.venues[0];
    extractedInfo.venue = venueInfo.name;
    extractedInfo.venue_id = venueInfo.id;
  }
  // price range
  if (event.priceRanges?.length) {
    const priceInfo = event.priceRanges;
    extractedInfo.price 
      = `${priceInfo.min} - ${priceInfo.max} ${priceInfo.currency}`;
  }
  // return
  return extractedInfo;
}

export function extractVenueDetail(venue) {
  const extractedInfo = {
    name: venue.name ?? '',
    icon: '',
    address: [],
    city: venue.city?.name ?? '', 
    state: venue.state?.stateCode ?? '',
    postal: venue.postalCode ?? '',
    upcoming: venue.url ?? '',
  };
  // icon
  if (venue.images?.length) {
    extractedInfo.icon = venue.images[0].url;
  }
  // address
  if (venue.address.line1) {
    extractedInfo.address.push(venue.address.line1);
    if (venue.address.line2) {
      extractedInfo.address.push(venue.address.line2);
      if (venue.address.line3) {
        extractedInfo.address.push(venue.address.line3);
      }
    }
  }
  // return
  return extractedInfo;
}