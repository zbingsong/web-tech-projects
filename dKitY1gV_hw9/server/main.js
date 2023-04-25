"use strict";

import axios from 'axios';
// import cors from 'cors';
import express from 'express';
import Geohash from 'latlon-geohash';
// import util from 'node:util';
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
import util from 'util';

const app = express();
// app.use(cors());

const spotifyApi = new SpotifyWebApi({
  clientId: 'f6060fc47d844b2c8a2c10c74069b475',
  clientSecret: '767c268ac092486d9e0eeed414d665bc',
});
let lastSpotifyTokenRefresh = Date.now();
spotifyApi.clientCredentialsGrant() 
  .then((data) => {
    spotifyApi.setAccessToken(data.body.access_token);
  })
  .catch((error) => { console.log(error); });

const PORT = 8080;
const PARENT_ROUTE = '/api';
const TICKETMASTER_API_ROUTE = 'https://app.ticketmaster.com/discovery/v2';
const SPOTIFY_TOKEN_TTL = 3600000;

// serve static files
app.use(express.static('dist'));

// default route, send index file
app.get('/', (request, response) => {
  response.sendFile('index.html', { root: 'dist' }, (error) => {
    console.error(error);
  });
});

app.get('/search', (request, response) => {
  response.sendFile('index.html', { root: 'dist' }, (error) => {
    console.error(error);
  });
});

app.get('/favorites', (request, response) => {
  response.sendFile('index.html', { root: 'dist' }, (error) => {
    console.error(error);
  });
});

// for auto complete
app.get(`${PARENT_ROUTE}/suggest`, (request, response) => {
  console.log(`${Date()}: auto complete, keyword ${request.query.keyword}`);
  // eslint-disable-next-line max-len
  const requestUrl = `${TICKETMASTER_API_ROUTE}/suggest?apikey=${TICKETMASTER_API_KEY}&keyword=${request.query.keyword}`;
  axios.get(requestUrl)
    .then((res) => {
      if (res.status < 400) {
        return res.data;
      } else {
        throw res;
      }
    })
    .then((data) => {
      response.json(extractAutoCompleteOptions(data));
    })
    .catch((error) => {
      console.error(error);
      response.status(500).json({});
    });
});

// search event with keywords, location, and category
app.get(`${PARENT_ROUTE}/search`, (request, response) => {
  const queries = request.query;
  console.log(`${Date()}: search event, params: ${util.inspect(queries)}`);
  const geoHash = Geohash.encode(queries.lat, queries.lng, 7);
  // eslint-disable-next-line max-len
  const requestUrl = `${TICKETMASTER_API_ROUTE}/events.json?apikey=${TICKETMASTER_API_KEY}&keyword=${queries.keyword}&geoPoint=${geoHash}&radius=${queries.distance}&unit=miles${CATEGORY_OPTIONS[queries.category]}`;
  axios.get(requestUrl)
    .then((res) => {
      if (res.status < 400) {
        return res.data;
      } else {
        throw res;
      }
    })
    .then((data) => {
      const eventArray = (data._embedded?.events ?? []).map((rawEventInfo) => {
        return extractEvent(rawEventInfo);
      });
      response.json(eventArray);
    })
    .catch((error) => {
      console.error(error);
      response.status(500).json({});
    });
});

// get event detail with event's id
app.get(`${PARENT_ROUTE}/event/:eventId`, (request, response) => {
  const eventId = request.params.eventId;
  console.log(`${Date()}: get event detail, id=${eventId}`);
  // eslint-disable-next-line max-len
  const requestUrl = `${TICKETMASTER_API_ROUTE}/events/${eventId}.json?apikey=${TICKETMASTER_API_KEY}`;
  axios.get(requestUrl)
    .then((res) => {
      if (res.status < 400) {
        return res.data;
      } else {
        throw res;
      }
    })
    .then((data) => {
      response.json(extractEventDetail(data));
    })
    .catch((error) => {
      console.error(error);
      response.status(500).json({});
    });
});

// get venue detail with venue's id
app.get(`${PARENT_ROUTE}/venue/:venueId`, (request, response) => {
  const venueId = request.params.venueId;
  console.log(`${Date()}: get venue detail, id=${venueId}`);
  // eslint-disable-next-line max-len
  const requestUrl = `${TICKETMASTER_API_ROUTE}/venues/${venueId}.json?apikey=${TICKETMASTER_API_KEY}`;
  axios.get(requestUrl)
    .then((res) => {
      if (res.status < 400) {
        return res.data;
      } else {
        throw res;
      }
    })
    .then((data) => {
      response.json(extractVenueDetail(data));
    })
    .catch((error) => {
      console.error(error);
      response.status(500).json({});
    });
});

// get artist info using Spotify API
app.get(`${PARENT_ROUTE}/artist`, (request, response) => {
  console.log(`${Date()}: search artist, keyword=${request.query.keyword}`);
  if (Date.now() - lastSpotifyTokenRefresh >= SPOTIFY_TOKEN_TTL) {
    lastSpotifyTokenRefresh = Date.now();
    spotifyApi.clientCredentialsGrant() 
      .then((data) => {
        spotifyApi.setAccessToken(data.body.access_token);
      })
      .then(() => {
        return spotifyApi.searchArtists(request.query.keyword);
      })
      .then((res) => {
        if (res.statusCode < 400) {
          return res.body;
        } else {
          throw res;
        }
      })
      .then((data) => {
        const artistDetail = extractArtistDetail(data.artists.items);
        return artistDetail;
      })
      .then((artistDetail) => {
        if (!artistDetail.id) {
          response.json({ id: '' });
        } else {
          spotifyApi.getArtistAlbums(artistDetail.id, { limit: 3 })
          .then((res) => {
            if (res.statusCode < 400) {
              return res.body;
            } else {
              throw res;
            }
          })
          .then((data) => {
            return extractArtistAlbums(data.items);
          })
          .then((albums) => {
            artistDetail.albums = albums;
            response.json(artistDetail);
            console.log(artistDetail);
          });
        }
      })
      .catch((error) => {
        console.log(error);
        response.status(500).json({});
      });
  } else {
    spotifyApi.searchArtists(request.query.keyword)
      .then((res) => {
        if (res.statusCode < 400) {
          return res.body;
        } else {
          throw res;
        }
      })
      .then((data) => {
        const artistDetail = extractArtistDetail(data.artists.items);
        return artistDetail;
      })
      .then((artistDetail) => {
        if (!artistDetail.id) {
          response.json({ id: '' });
        } else {
          spotifyApi.getArtistAlbums(artistDetail.id)
          .then((res) => {
            if (res.statusCode < 400) {
              return res.body;
            } else {
              throw res;
            }
          })
          .then((data) => {
            return extractArtistAlbums(data.items);
          })
          .then((albums) => {
            artistDetail.albums = albums;
            response.json(artistDetail);
            console.log(artistDetail);
          });
        }
      })
      .catch((error) => {
        console.log(error);
        response.status(500).json({});
      });
  }
});

// run server
app.listen(PORT);
