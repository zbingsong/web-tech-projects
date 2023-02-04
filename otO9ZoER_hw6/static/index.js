const IPINFO_API_KEY = '4c616ba7471362';
const GOOGLE_GEOCODING_API_KEY = 'AIzaSyAzeFEsfPKDhdxHcwYkDuDirDo4IAifTfk';
const TICKETMASTER_API_KEY = 'kokaaLQxqCux3XHdGCnVGD2zh6mODd2r';


async function searchEvents(event) {
  console.log('search button clicked');
  event.preventDefault();
  const formData = new FormData(event.target);
  const keyword = formData.get('keyword');
  const distance = 
    formData.get('distance') === '' ? 10 : parseInt(formData.get('distance'));
  const category = formData.get('category');
  const location = await getLocation(formData);
  console.log(`${keyword}, ${distance}, ${category}, ${formData.get('location-checkbox')}, ${JSON.stringify(location)}`);

  try {
    const response = await fetch(
      `/search?keyword=${keyword}&distance=${distance}&category=${category}&lng=${location.lng}&lat=${location.lat}`
    );
    const data = await response.json();
    console.log(data);
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
  formElems['location-input'].style.display = 'block';
  formElems['location-input'].required = false;
}


async function getLocation(formData) {
  const coordinates = { lng: 0, lat: 0 }
  if (formData.get('location-checkbox') === 'on') {
    console.log('ipinfo');
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
    console.log('google geocoding');
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
  locationInput.style.display = event.target.checked ? 'none' : 'block';
  locationInput.required = !event.target.checked;
}


/**
 * 
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
    document.getElementById('search-no-result').style.display = 'block';
    document.getElementById('search-result').style.display = 'none';
    clearChildElements(document.getElementById('search-result-table-body'));
  } else {
    const resultTableBody = document.getElementById('search-result-table-body');
    for (const result of results) {
      const row = document.createElement('tr');

      const date = document.createElement('th');
      date.dataset.eventId = result.id;
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
      event.onclick = showEventDetail(result.id);

      const genre = document.createElement('th');
      genre.innerHTML = result.genre;

      const venue = document.createElement('th');
      venue.innerHTML = result.venue;

      row.append(date, icon, event, genre, venue);
      resultTableBody.append(row);
    }
  }
  document.getElementById('search-result').style.display = 'block';
  document.getElementById('search-no-result').style.display = 'none';
}


async function showEventDetail(eventId) {
  try {
    const response = await fetch(`/event/${eventId}`);
    const data = await response.json();
    /* shape of data: {
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
    document.getElementById('event-detail-title').innerHTML = data.name;

    if (data.date === '') {
      document.getElementById('event-detail-date').style.display = 'none';
    } else {
      document.getElementById('event-detail-date').style.display = 'block';
      document.getElementById('event-detail-date-content').innerHTML = data.date + ' ' + data.time;
    }

    if (data.artist.length === 0) {
      document.getElementById('event-detail-artist').style.display = 'none';
      clearChildElements(document.getElementById('event-detail-artist-content'));
    } else {
      document.getElementById('event-detail-artist').style.display = 'block';
      const artistList = document.getElementById('event-detail-artist-content');
      for (let i = 0; i++; i < data.artist.length-1) {
        const artistInfo = data.artist[i]
        const artistLink = document.createElement('a');
        artistLink.innerHTML = artistInfo.artist;
        artistLink.href = artistInfo.url;
        const separator = document.createElement('span');
        separator.innerHTML = ' | ';
        artistList.append(artistLink, separator);
      }
      const artistInfo = data.artist[data.artist.length-1]
      const artistLink = document.createElement('a');
      artistLink.innerHTML = artistInfo.artist;
      artistLink.href = artistInfo.url;
      artistList.append(artistLink);
    }

    if (data.venue === '') {
      document.getElementById('event-detail-venue').style.display = 'none';
    } else {
      document.getElementById('event-detail-venue').style.display = 'block';
      document.getElementById('event-detail-venue-content').innerHTML = data.venue;
    }

    if (data.genre === '') {
      document.getElementById('event-detail-genres').style.display = 'none';
    } else {
      document.getElementById('event-detail-genres').style.display = 'block';
      document.getElementById('event-detail-genres-content').innerHTML = data.genre;
    }
  } catch (error) {
    console.log(error);
  }
}


function showVenueDetail(venueId) {

}


// adapted from @Fernando and @Nathan's answer at: 
// https://stackoverflow.com/questions/50269658/how-to-delete-all-child-elements-from-a-div-element-using-js
function clearChildElements(parentElement) {
  while (parentElement.hasChildNodes()) {
    parentElement.removeChild(parentElement.firstChild);
  }
}
