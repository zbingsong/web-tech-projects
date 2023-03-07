"use strict";

import axios from 'axios';
import express from 'express';
import Geohash from 'latlon-geohash';
import util from 'node:util';
import { 
  CATEGORY_OPTIONS, 
  extractEvent, 
  extractEventDetail, 
  extractVenueDetail, 
  TICKETMASTER_API_KEY,
} from './utils.js';

const app = express();

const PORT = 8081;
const PARENT_ROUTE = '/api';
const TICKETMASTER_API_ROUTE = 'https://app.ticketmaster.com/discovery/v2';

// search event with keywords, location, and category
app.get(`${PARENT_ROUTE}/search`, (request, response) => {
  // const queries = request.query;
  const queries = {
    keyword: 'usc', 
    distance: 10, 
    category: 'Default', 
    lng: -118.2863, 
    lat: 34.0030,
  };
  console.log(`search event, params: ${util.inspect(queries)}`);
  const geoHash = Geohash.encode(queries.lat, queries.lng, 7);
  // eslint-disable-next-line max-len
  const requestUrl = `${TICKETMASTER_API_ROUTE}/events.json?apikey=${TICKETMASTER_API_KEY}&keyword=${queries.keyword}&geoPoint=${geoHash}&radius=${queries.distance}&unit=miles${CATEGORY_OPTIONS[queries.category]}`;
  // make request to TicketMaster server, extract data,
  // and send to client
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
      response.json({ events: eventArray });
    })
    .catch((error) => {
      console.error(error);
      response.json({});
    });
});

// get event detail with event's id
app.get(`${PARENT_ROUTE}/event/:eventId`, (request, response) => {
  const eventId = request.params.eventId;
  console.log(`get event detail, id=${eventId}`);
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
      response.json({ event_detail: extractEventDetail(data) });
    })
    .catch((error) => {
      console.error(error);
      response.json({});
    });
});

// get venue detail with venue's id
app.get(`${PARENT_ROUTE}/venue/:venueId`, (request, response) => {
  const venueId = request.params.venueId;
  console.log(`get venue detail, id=${venueId}`);
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
      response.json({ venue_detail: extractVenueDetail(data) });
    })
    .catch((error) => {
      console.error(error);
      response.json({});
    });
});

// run server
app.listen(PORT, () => { console.log(`app listening on port ${PORT}`); });
