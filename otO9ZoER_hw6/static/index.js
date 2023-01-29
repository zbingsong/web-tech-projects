function searchEvents(event) {
  console.log('search button clicked');
  event.preventDefault();
  const formData = new FormData(event.target);
  const keyword = formData.get('keyword');
  const distance = 
    formData.get('distance') === '' ? 10 : parseInt(formData.get('distance'));
  const category = formData.get('category');
  const location = getLocation(formData);
  console.log(`${keyword}, ${distance}, ${category}, ${location}`);
}


function clearForm(event) {
  event.preventDefault();
  const formElems = document.getElementById('search-form').elements;
  formElems['keyword'].value = '';
  formElems['distance'].value = '';
  formElems['category'].value = 'Music';
  formElems['location-checkbox'].checked = false;
  formElems['location-input'].value = '';
  formElems['location-input'].style.display = 'block';
  formElems['location-input'].required = false;
}


function getLocation(formData) {
  if (formData.get('location-checkbox')) {

  } else {
    const locationInput = formData.get('location');
  }
}


function toggleLocationInput(event) {
  const locationInput = document.getElementById('location-input');
  locationInput.style.display = event.target.checked ? 'none' : 'block';
  locationInput.required = !event.target.checked;
}


function showResults(results) {
  if (results.length === 0) {
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
      const dateText = document.createElement('span');
      dateText.innerHTML = result.dates.localDate;
      const timeText = document.createElement('span');
      timeText.innerHTML = result.dates.localTime;
      date.append(dateText, timeText);

      const icon = document.createElement('th');
      const iconImg = document.createElement('img');
      iconImg.src = result.images;
      icon.append(iconImg);

      const event = document.createElement('th');
      event.innerHTML = result.name;
      event.onclick = showEventDetail(result.id);

      const genre = document.createElement('th');
      genre.innerHTML = result.segment;

      const venue = document.createElement('th');
      venue.innerHTML = result.venue.name;

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
