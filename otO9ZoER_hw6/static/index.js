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
    showResults(data.events);
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
function showResults(results) {
  if (!results || results.length === 0) {
    document.getElementById('search-no-result').style.display = 'block';
    document.getElementById('search-result').style.display = 'none';
    // the following four lines are adapted from @Fernando and @Nathan's answer at: 
    // https://stackoverflow.com/questions/50269658/how-to-delete-all-child-elements-from-a-div-element-using-js
    const resultTableBody = document.getElementById('search-result-table-body');
    while (resultTableBody.hasChildNodes()) {
      resultTableBody.removeChild(resultTableBody.firstChild);
    }
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


function showEventDetail(eventId) {
  const event = null;

}


function showVenueDetail(venueId) {

}
