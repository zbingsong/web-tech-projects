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

export function extractAutoCompleteOptions(data) {
  if (!data?._embedded?.attractions) return [];
  return data._embedded.attractions.map((artist) => (artist.name));
}

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
    extractedInfo.image_url = event.images[0].url;
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
    id: event.id,
    name: event.name ?? '',
    date: '',
    time: '',
    artists: [],
    genre: '',
    category: '',
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
  // artists
  if (event._embedded.attractions?.length) {
    extractedInfo.artists = event._embedded.attractions.map((attraction) => ({
      name: attraction.name, 
      category: attraction.classifications.segment?.name ?? '',
      url: attraction.url ?? '',
    }));
  }
  // genre and category
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
    extractedInfo.category = genreArray.length > 0 ? genreArray[0] : '';
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

export function extractArtistDetail(artistList) {
  if (artistList.length === 0) {
    return {};
  }
  const extractedInfo = {
    id: artistList[0].id,
    name: artistList[0].name,
    followers: artistList[0].followers.total,
    popularity: artistList[0].popularity,
    url: artistList[0].external_urls.spotify,
    image: artistList[0].images[0].url,
    albums: [],
  };
  return extractedInfo;
}

export function extractArtistAlbums(albumList) {
  return albumList.map((album) => album.images[0].url);
}

export function extractVenueDetail(venue) {
  const extractedInfo = {
    name: venue.name ?? '',
    address: '',
    phone: venue.boxOfficeInfo?.phoneNumberDetail ?? '',
    openHours: venue.boxOfficeInfo?.openHoursDetail ?? '',
    genRule: venue.generalInfo?.generalRule ?? '',
    childRule: venue.generalInfo?.childRule ?? '',
    location: {
      lat: 0,
      lng: 0,
    },
  };
  // address
  const venueAddr = [];
  if (venue.address?.line1) {
    venueAddr.push(venue.address.line1);
  }
  if (venue.city?.name) {
    venueAddr.push(venue.city.name);
  }
  if (venue.state?.name) {
    venueAddr.push(venue.state.name);
  }
  extractedInfo.address = venueAddr.join(', ');
  // location
  if (venue.location?.longitude) {
    extractedInfo.location.lng = parseFloat(venue.location.longitude);
  }
  if (venue.location?.latitude) {
    extractedInfo.location.lat = parseFloat(venue.location.latitude);
  }
  // return
  return extractedInfo;
}