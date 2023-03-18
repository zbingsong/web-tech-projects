"use strict";

import axios from 'axios';
import cors from 'cors';
import express from 'express';
import Geohash from 'latlon-geohash';
import util from 'node:util';
import SpotifyWebApi from 'spotify-web-api-node';
import { 
  CATEGORY_OPTIONS, 
  extractArtistAlbums, 
  extractArtistDetail, 
  extractAutoCompleteOptions, 
  extractEvent, 
  extractEventDetail, 
  extractVenueDetail, 
  TICKETMASTER_API_KEY,
} from './utils.js';

const app = express();
app.use(cors());

const spotifyApi = new SpotifyWebApi({
  clientId: 'f6060fc47d844b2c8a2c10c74069b475',
  clientSecret: '767c268ac092486d9e0eeed414d665bc',
});
let lastSpotifyTokenRefresh = 0;
// spotifyApi.clientCredentialsGrant() 
//   .then((data) => {
//     spotifyApi.setAccessToken(data.body.access_token);
//   })
//   .catch((error) => { console.log(error); });

const PORT = 8081;
const PARENT_ROUTE = '/api';
const TICKETMASTER_API_ROUTE = 'https://app.ticketmaster.com/discovery/v2';
const SPOTIFY_TOKEN_TTL = 3600000;

// for auto complete
app.get(`${PARENT_ROUTE}/suggest`, (request, response) => {
  // console.log(request.query);
  console.log(`${Date()}: auto complete, keyword ${request.query.keyword}`);
  response.json(['abc', 'def']);
  // eslint-disable-next-line max-len
  // const requestUrl = `${TICKETMASTER_API_ROUTE}/suggest?apikey=${TICKETMASTER_API_KEY}&keyword=${request.query.keyword}`;
  // axios.get(requestUrl)
  //   .then((res) => {
  //     if (res.status < 400) {
  //       return res.data;
  //     } else {
  //       throw res;
  //     }
  //   })
  //   .then((data) => {
  //     response.json(extractAutoCompleteOptions(data));
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //     response.status(500).json({});
  //   });
});

// search event with keywords, location, and category
app.get(`${PARENT_ROUTE}/search`, (request, response) => {
  // const queries = request.query;
  const queries = {
    keyword: 'p!nk', 
    distance: 100,
    category: 'Default', 
    lng: -118.2863, 
    lat: 34.0030,
  };
  console.log(`${Date()}: search event, params: ${util.inspect(queries)}`);
  const geoHash = Geohash.encode(queries.lat, queries.lng, 7);
  // eslint-disable-next-line max-len
  // const requestUrl = `${TICKETMASTER_API_ROUTE}/events.json?apikey=${TICKETMASTER_API_KEY}&keyword=${queries.keyword}&geoPoint=${geoHash}&radius=${queries.distance}&unit=miles${CATEGORY_OPTIONS[queries.category]}`;
  // axios.get(requestUrl)
  //   .then((res) => {
  //     if (res.status < 400) {
  //       return res.data;
  //     } else {
  //       throw res;
  //     }
  //   })
  //   .then((data) => {
  // eslint-disable-next-line max-len
    //   const eventArray = (data._embedded?.events ?? []).map((rawEventInfo) => {
    //     return extractEvent(rawEventInfo);
    //   });
    //   response.json(eventArray);
    // })
    // .catch((error) => {
    //   console.error(error);
    //   response.status(500).json({});
    // });

  response.json([
    {
        "id": "vvG1IZ9pNeVNoR",
        "date": "2023-10-05",
        "time": "18:30:00",
        // eslint-disable-next-line max-len
        "image_url": "https://s1.ticketm.net/dam/a/4c8/cee4224d-ed9f-4267-81a4-61be2a1f44c8_ARTIST_PAGE_3_2.jpg",
        "name": "P!NK: Summer Carnival 2023",
        "genre": "Music",
        "venue": "SoFi Stadium",
    },
  ]);
});

// get event detail with event's id
app.get(`${PARENT_ROUTE}/event/:eventId`, (request, response) => {
  const eventId = request.params.eventId;
  console.log(`${Date()}: get event detail, id=${eventId}`);
  // eslint-disable-next-line max-len
  // const requestUrl = `${TICKETMASTER_API_ROUTE}/events/${eventId}.json?apikey=${TICKETMASTER_API_KEY}`;
  // axios.get(requestUrl)
  //   .then((res) => {
  //     if (res.status < 400) {
  //       return res.data;
  //     } else {
  //       throw res;
  //     }
  //   })
  //   .then((data) => {
  //     response.json(extractEventDetail(data));
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //     response.status(500).json({});
  //   });
  response.json({
    "id": "vvG1IZ9pNeVNoR",
    "name": "P!NK: Summer Carnival 2023",
    "date": "2023-10-05",
    "time": "18:30:00",
    "artists": [
        {
            "name": "P!NK",
            "category": "",
            "url": "https://www.ticketmaster.com.au/pnk-tickets/artist/718655"
        },
        {
            "name": "Pat Benatar & Neil Giraldo",
            "category": "",
            // eslint-disable-next-line max-len
            "url": "https://www.ticketmaster.com.au/pat-benatar-neil-giraldo-tickets/artist/734537",
        },
        {
            "name": "Grouplove",
            "category": "",
            // eslint-disable-next-line max-len
            "url": "https://www.ticketmaster.com.au/grouplove-tickets/artist/1504793",
        },
        {
            "name": "KidCutUp",
            "category": "",
            // eslint-disable-next-line max-len
            "url": "https://www.ticketmaster.com.au/kidcutup-tickets/artist/1797766",
        },
    ],
    "genre": "",
    "category": "",
    "venue_id": "KovZ917ACh0",
    "venue": "SoFi Stadium",
    "price": "undefined - undefined undefined",
    "status": "On Sale",
    "status_color": "green",
    // eslint-disable-next-line max-len
    "buy": "https://www.ticketmaster.com/pnk-summer-carnival-2023-inglewood-california-10-05-2023/event/0A005D68C2D2346F",
    // eslint-disable-next-line max-len
    "seatmap": "https://maps.ticketmaster.com/maps/geometry/3/event/0A005D68C2D2346F/staticImage?type=png&systemId=HOST",
  });
});

// get venue detail with venue's id
app.get(`${PARENT_ROUTE}/venue/:venueId`, (request, response) => {
  const venueId = request.params.venueId;
  console.log(`${Date()}: get venue detail, id=${venueId}`);
  // eslint-disable-next-line max-len
  // const requestUrl = `${TICKETMASTER_API_ROUTE}/venues/${venueId}.json?apikey=${TICKETMASTER_API_KEY}`;
  // axios.get(requestUrl)
  //   .then((res) => {
  //     if (res.status < 400) {
  //       return res.data;
  //     } else {
  //       throw res;
  //     }
  //   })
  //   .then((data) => {
  //     response.json(extractVenueDetail(data));
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //     response.status(500).json({});
  //   });
  response.json({
    "name": "Crypto.com Arena",
    "address": "1111 S. Figueroa St, Los Angeles, California",
    "phone": "213-742-7340",
    // eslint-disable-next-line max-len
    "openHours": "Box office is located on North side of building at 11th and South Figueroa. Box office hours are 10am to 6pm, Monday through Saturday. It is open extended hours on event day. Phone: 213-742-7340 SUMMER HOURS Closed Saturdays and Sundays unless there is an event, the box office will open at 9am on Saturdays or 10am on Sundays only if there is an event. The box office will have extended hours on all event days.",
    // eslint-disable-next-line max-len
    "genRule": "No Bottles, Cans, Or Coolers. No Smoking In Arena. No Cameras Or Recording Devices At Concerts! Cameras w/No Flash Allowed For Sporting Events Only!",
    // eslint-disable-next-line max-len
    "childRule": "Some events require all attendees, regardless of age, to present a ticket for entry. Please check the event ticket policies at the time of purchase. Children age three (3) and above require a ticket for Los Angeles Lakers, Los Angeles Clippers, Los Angeles Kings and Los Angeles Sparks games.",
    "location": {
        "lat": 34.043003,
        "lng": -118.267253,
    },
  });
});

// get artist info using Spotify API
app.get(`${PARENT_ROUTE}/artist`, (request, response) => {
  console.log(`${Date()}: search for artist, keyword=${request.query.keyword}`);
  // if (Date.now() - lastSpotifyTokenRefresh >= SPOTIFY_TOKEN_TTL) {
  //   // console.log('refresh Spotify access token');
  //   lastSpotifyTokenRefresh = Date.now();
  //   spotifyApi.clientCredentialsGrant() 
  //     .then((data) => {
  //       spotifyApi.setAccessToken(data.body.access_token);
  //       // console.log('Spotify access token refreshed');
  //     })
  //     .then(() => {
  //       return spotifyApi.searchArtists(request.query.keyword);
  //     })
  //     .then((res) => {
  //       // console.log('searched artist');
  //       if (res.statusCode < 400) {
  //         return res.body;
  //       } else {
  //         throw res;
  //       }
  //     })
  //     .then((data) => {
  //       const artistDetail = extractArtistDetail(data.artists.items);
  //       // console.log('extracted artist detail, no albums');
  //       return artistDetail;
  //     })
  //     .then((artistDetail) => {
  //       if (!artistDetail.id) {
  //         response.json({ id: '' });
  //       } else {
  //         spotifyApi.getArtistAlbums(artistDetail.id, { limit: 3 })
  //         .then((res) => {
  //           if (res.statusCode < 400) {
  //             return res.body;
  //           } else {
  //             throw res;
  //           }
  //         })
  //         .then((data) => {
  //           return extractArtistAlbums(data.items);
  //         })
  //         .then((albums) => {
  //           artistDetail.albums = albums;
  //           response.json(artistDetail);
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       response.status(500).json({});
  //     });
  // } else {
  //   // console.log('not refresh spotify token');
  //   spotifyApi.searchArtists(request.query.keyword)
  //     .then((res) => {
  //       if (res.statusCode < 400) {
  //         return res.body;
  //       } else {
  //         throw res;
  //       }
  //     })
  //     .then((data) => {
  //       const artistDetail = extractArtistDetail(data.artists.items);
  //       return artistDetail;
  //     })
  //     .then((artistDetail) => {
  //       if (!artistDetail.id) {
  //         response.json({ id: '' });
  //       } else {
  //         spotifyApi.getArtistAlbums(artistDetail.id)
  //         .then((res) => {
  //           if (res.statusCode < 400) {
  //             return res.body;
  //           } else {
  //             throw res;
  //           }
  //         })
  //         .then((data) => {
  //           return extractArtistAlbums(data.items);
  //         })
  //         .then((albums) => {
  //           artistDetail.albums = albums;
  //           response.json(artistDetail);
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       response.status(500).json({});
  //     });
  // }
  response.json({
    "id": "1KCSPY1glIKqW2TotWuXOR",
    "name": "P!nk",
    "followers": 14754714,
    "popularity": 85,
    "url": "https://open.spotify.com/artist/1KCSPY1glIKqW2TotWuXOR",
    "image": "https://i.scdn.co/image/ab6761610000e5eb7bbad89a61061304ec842588",
    "albums": [
        "https://i.scdn.co/image/ab67616d0000b2735b8cf73dd4eebd286d9a2c78",
        "https://i.scdn.co/image/ab67616d0000b27310f09598c255c327ff64943b",
        "https://i.scdn.co/image/ab67616d0000b273622e777dae28385599c114c8"
    ],
  });
});

// run server
app.listen(PORT);
