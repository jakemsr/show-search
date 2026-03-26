// global variable to sort without re-fetching 
let shows;

/**
 * fetches show information into the global shows array
 * 
 * @param {*} event 
 */
async function getShows(event) {

	const sortOrder = event.target.elements.filter.value;

	const searchString = event.target.elements.searchText.value;
	if (!searchString) {
		return;
	}

    const requestURL = `https://www.omdbapi.com/?apikey=76dbaf2b&t=movie&r=json&s=${searchString}`;

    const showsDiv = document.querySelector('.shows');

	// reset the shows HTML for each new search so we actually get the spinner
	showsDiv.innerHTML = `<i class="fas fa-spinner"></i>`;

	showsDiv.classList.add("shows__loading");

	const request = await fetch(requestURL);
    const requestData = await request.json();

	showsDiv.classList.remove("shows__loading");

	// only use first 6 results
	shows = requestData.Search.slice(0,6);

	renderShows(sortOrder);
}


/**
 * sorts the shows array and displays the show information
 * 
 * @param {*} sortOrder 
 */
function renderShows(sortOrder) {

	switch (sortOrder) {
		case "TITLE_A_TO_Z":
			shows.sort((a, b) => a.Title.localeCompare(b.Title));
			break;
		case "TITLE_Z_TO_A":
			shows.sort((a, b) => b.Title.localeCompare(a.Title));
			break;
		case "YEAR_LOW_TO_HIGH":
			shows.sort((a, b) => a.Year - b.Year);
			break;
		case "YEAR_HIGH_TO_LOW":
			shows.sort((a, b) => b.Year - a.Year);
			break;
		default:
			break;
	}

    const showsDiv = document.querySelector('.shows');

	showsDiv.innerHTML = `
    <div class="show__heading">
      <div class="show__title">
        Title
      </div>
      <div class="show__year">
        Year
      </div>
      <div class="show__img">
        Poster
      </div>
    </div>`;

    showsDiv.innerHTML += shows.map(show => getShowHTML(show)).join("");
}

/**
 * callback for the map() in renderShows, generates HTML for an individual show
 * 
 * @param {*} show 
 * @returns string for map()
 */
function getShowHTML(show) {
    return `
    <div class="show">
      <div class="show__title">
        ${show.Title}
      </div>
      <div class="show__year">
        ${show.Year}
      </div>
      <div class="show__img">
        <img src="${show.Poster}" class="image">
      </div>
    </div>`;
}

/**
 * called by form submission
 * 
 * @param {*} event 
 */
function searchShows(event) {
    event.preventDefault();
    getShows(event);
}

/**
 * called by sort order selection
 * 
 * @param {*} event 
 */
function filterShows(event) {
	const sortOrder = event.target.value;
	// don't try to render shows if they haven't been fetched yet
	if (!shows) {
		return;
	}
	renderShows(sortOrder);
}
