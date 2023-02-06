const IPINFO_API_KEY = '4c616ba7471362';
const GOOGLE_GEOCODING_API_KEY = 'AIzaSyAzeFEsfPKDhdxHcwYkDuDirDo4IAifTfk';


async function searchEvents(event) {
  // console.log('search button clicked');
  event.preventDefault();
  const formData = new FormData(event.target);
  const keyword = formData.get('keyword');
  const distance = 
    formData.get('distance') === '' ? 10 : parseInt(formData.get('distance'));
  const category = formData.get('category');
  const location = await getLocation(formData);
  // console.log(`${keyword}, ${distance}, ${category}, ${formData.get('location-checkbox')}, ${JSON.stringify(location)}`);

  try {
    const response = await fetch(
      `/search?keyword=${keyword}&distance=${distance}&category=${category}&lng=${location.lng}&lat=${location.lat}`
    );
    const data = await response.json();
    // console.log(data);
    if (data.events === undefined) {
      throw new Error('Failure in retrieving events');
    }
    showEvents(data.events);
  } catch (error) {
    console.log(error);
    alert(JSON.stringify(error));
  }
}


function clearForm(event) {
  event.preventDefault();
  const formElems = document.getElementById('search-form').elements;
  formElems['keyword'].value = '';
  formElems['distance'].value = '';
  formElems['category'].value = 'Default';
  formElems['location-checkbox'].checked = false;
  formElems['location-input'].value = '';
  formElems['location-input'].style.display = '';
  formElems['location-input'].required = false;
}


async function getLocation(formData) {
  const coordinates = { lng: 0, lat: 0 }
  if (formData.get('location-checkbox') === 'on') {
    // console.log('ipinfo');
    try {
      const response = await fetch(`https://ipinfo.io/?token=${IPINFO_API_KEY}`);
      const data = await response.json();
      const coordArr = data.loc.split(',');
      coordinates.lat = parseFloat(coordArr[0]);
      coordinates.lng = parseFloat(coordArr[1]);
    } catch (error) {
      console.log('location error');
      alert(JSON.stringify(error));
    }
  } else {
    // console.log('google geocoding');
    const locationInput = formData.get('location');
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${locationInput}&key=${GOOGLE_GEOCODING_API_KEY}`
      );
      const data = await response.json();
      const coordObj = data.results[0].geometry.location;
      coordinates.lat = coordObj.lat;
      coordinates.lng = coordObj.lng;
    } catch (error) {
      console.log('location error');
      alert(JSON.stringify(error));
    }
  }
  return coordinates;
}


function toggleLocationInput(event) {
  const locationInput = document.getElementById('location-input');
  locationInput.style.display = event.target.checked ? 'none' : '';
  locationInput.required = !event.target.checked;
}


/**
 * @param {Array<{
 *  id: string, 
 *  date: string, 
 *  time: string, 
 *  image_url: string, 
 *  name: string, 
 *  genre: string, 
 *  venue: string
 * }>} results 
 */
function showEvents(results) {
  if (!results || results.length === 0) {
    document.getElementById('search-no-result').style.display = '';
    document.getElementById('search-result').style.display = 'none';
    clearChildElements(document.getElementById('search-result-table-body'));
  } else {
    const resultTableBody = document.getElementById('search-result-table-body');
    for (const result of results) {
      const row = document.createElement('tr');

      const date = document.createElement('th');
      // date.dataset.eventId = result.id;
      const dateText = document.createElement('p');
      dateText.innerHTML = result.date;
      const timeText = document.createElement('p');
      timeText.innerHTML = result.time;
      date.append(dateText, timeText);

      const icon = document.createElement('th');
      const iconImg = document.createElement('img');
      iconImg.src = result.image_url;
      iconImg.className = 'search-result-event-icon';
      icon.append(iconImg);

      const event = document.createElement('th');
      event.innerHTML = result.name;
      event.onclick = () => showEventDetail(result.id);

      const genre = document.createElement('th');
      genre.innerHTML = result.genre;

      const venue = document.createElement('th');
      venue.innerHTML = result.venue;

      row.append(date, icon, event, genre, venue);
      resultTableBody.append(row);
    }
  }
  document.getElementById('search-result').style.display = '';
  document.getElementById('search-no-result').style.display = 'none';
}


async function showEventDetail(eventId) {
  try {
    const response = await fetch(`/event/${eventId}`);
    const data = await response.json();
    // console.log(data);
    if (!data.event_detail) return;
    const detail = data.event_detail;
    /* 
      shape of data.event_detail: {
        name: string, 
        date: string (empty string if no date),
        time: string (empty string if no time),
        artist: Array<{ artist: string, url: string }> (array of objects),
        genre: string,
        venue_id: string (empty string if no venue),
        venue: string (empty string if no venue),
        price: string (empty string if no price),
        status: string (one of 'On Sale', 'Off Sale', 'Canceled', 'Postponed', 'Rescheduled'),
        status_color: string (one of 'red', 'green', 'orange', 'black')
        buy: string (url link),
        seatmap: string (image url),
      }
    */
    document.getElementById('event-detail').style.display = '';
    document.getElementById('show-venue').style.display = '';
    document.getElementById('show-venue-arrow').onclick = () => showVenueDetail(detail.venue_id);
    
    // name
    document.getElementById('event-detail-title').innerHTML = detail.name;
    // date
    if (detail.date === '') {
      document.getElementById('event-detail-date').style.display = 'none';
    } else {
      document.getElementById('event-detail-date').style.display = '';
      document.getElementById('event-detail-date-content').innerHTML = `${detail.date} ${detail.time}`;
    }
    // artist
    if (detail.artist.length === 0) {
      document.getElementById('event-detail-artist').style.display = 'none';
      clearChildElements(document.getElementById('event-detail-artist-content'));
    } else {
      document.getElementById('event-detail-artist').style.display = '';
      const artistList = document.getElementById('event-detail-artist-content');
      for (let i = 0; i++; i < detail.artist.length-1) {
        const artistInfo = detail.artist[i]
        const artistLink = document.createElement('a');
        artistLink.innerHTML = artistInfo.artist;
        artistLink.href = artistInfo.url;
        const separator = document.createElement('span');
        separator.innerHTML = ' | ';
        artistList.append(artistLink, separator);
      }
      const artistInfo = detail.artist[detail.artist.length-1]
      const artistLink = document.createElement('a');
      artistLink.innerHTML = artistInfo.artist;
      artistLink.href = artistInfo.url;
      artistList.append(artistLink);
    }
    // venue
    if (detail.venue === '') {
      document.getElementById('event-detail-venue').style.display = 'none';
    } else {
      document.getElementById('event-detail-venue').style.display = '';
      document.getElementById('event-detail-venue-content').innerHTML = detail.venue;
    }
    // genre
    if (detail.genre === '') {
      document.getElementById('event-detail-genres').style.display = 'none';
    } else {
      document.getElementById('event-detail-genres').style.display = '';
      document.getElementById('event-detail-genres-content').innerHTML = detail.genre;
    }
    // price
    if (detail.price === '') {
      document.getElementById('event-detail-price').style.display = 'none';
    } else {
      document.getElementById('event-detail-price').style.display = '';
      document.getElementById('event-detail-price-content').innerHTML = detail.price;
    }
    // status
    if (detail.status === '') {
      document.getElementById('event-detail-status').style.display = 'none';
    } else {
      document.getElementById('event-detail-status').style.display = '';
      const statusContent = document.getElementById('event-detail-status-content');
      statusContent.innerHTML = detail.status;
      statusContent.style.backgroundColor = detail.status_color;
    }
    // buy
    if (detail.buy === '') {
      document.getElementById('event-detail-buy').style.display = 'none';
    } else {
      document.getElementById('event-detail-buy').style.display = '';
      document.getElementById('event-detail-buy-content-anchor').href = detail.buy;
    }
    // seatmap
    document.getElementById('event-detail-seat-img').src = detail.seatmap;
  } catch (error) {
    console.log(error);
  }
}


async function showVenueDetail(venueId) {
  if (!venueId) return;

  try {
    const response = await fetch(`/venue/${venueId}`);
    const data = await response.json();
    // console.log(data);
    if (!data.venue_detail) return;
    const detail = data.venue_detail;
    /* 
      shape of data: {
        name: string,
        address: Array<string>,
        city: string,
        state: string,
        postal: string,
        upcoming: string (url),
      }
      all keys are guaranteed to appear
      if no entry in a key, the value is an empty string (except for address)
    */
    // show venue info, hides 'show venue' button
    document.getElementById('venue-detail').style.display = '';
    document.getElementById('show-venue').style.display = 'none';

    document.getElementById('venue-detail-title').innerHTML = detail.name || 'N/A';
    
    const venueAddrContent = document.getElementById('venue-detail-address-content');
    detail.address.forEach(line => {
      const addrLine = document.createElement('p');
      addrLine.innerHTML = line;
      venueAddrContent.append(addrLine);
    });
    
    const addrCityState = document.createElement('p');
    addrCityState.innerHTML = `${detail.city || 'N/A'}, ${detail.state || 'N/A'}`;
    const addrPostal = document.createElement('p');
    addrPostal.innerHTML = detail.postal || 'N/A';
    venueAddrContent.append(addrCityState, addrPostal);

    const mapSearchLink = 
      `https://www.google.com/maps/search/?api=1&query=${detail.name.replaceAll(' ', '+')}`
      + detail.address.join('+').replaceAll(' ', '+')
      + (detail.city ? `+${detail.city}` : '')
      + (detail.state ? `+${detail.state}` : '') 
      + (detail.postal ? `+${detail.postal}` : '');
    document.getElementById('venue-detail-map-anchor').href = mapSearchLink;

    document.getElementById('venue-detail-more-anchor').href = detail.upcoming;
  } catch (error) {
    console.log(error);
  }
}


// adapted from @Fernando and @Nathan's answer at: 
// https://stackoverflow.com/questions/50269658/how-to-delete-all-child-elements-from-a-div-element-using-js
function clearChildElements(parentElement) {
  while (parentElement.hasChildNodes()) {
    parentElement.removeChild(parentElement.firstChild);
  }
}
