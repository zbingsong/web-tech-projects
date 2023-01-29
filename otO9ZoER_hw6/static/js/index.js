// document.addEventListener('DOMContentLoaded');

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
  
}

function getLocation(formData) {
  if (formData.get('locationCheckbox')) {

  } else {
    const locationInput = formData.get('location');
  }
}

function toggleLocationInput(event) {
  if (event.target.checked) {
    document.getElementById('location-input').style.display = 'none';
  } else {
    const locationInput = document.getElementById('location-input');
    locationInput.style.display = 'block';
    locationInput.required = true;
  }
}
