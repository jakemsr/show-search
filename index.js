// global variable to sort without re-fetching 
const shows = [];

// global to avoid re-fetching on each onmouseenter
const showPlots = {};

/**
 * fetches show information into the global shows array
 * 
 * @param {*} event 
 */
async function getShows(event) {

	const sortOrder = event.target.elements.filter.value;
	let maxResults = event.target.elements.maxResults.value;
	maxResults = parseInt(maxResults);
	if (!maxResults) {
		maxResults = 10;
	}

	let maxPages = Math.floor(maxResults / 10);
	if (maxResults % 10) {
		maxPages += 1;
	}

	const searchString = event.target.elements.searchText.value;
	if (!searchString) {
		return;
	}

	// empty the shows array on each new search
	shows.length = 0;

	const showsDiv = document.querySelector('.shows');

	// reset the shows HTML for each new search so we actually get the spinner
	showsDiv.innerHTML = `<i class="fas fa-spinner"></i>`;

	showsDiv.classList.add("shows__loading");

	let numResults = 0;

	for (let page = 1; page <= maxPages; page++) {

		const requestURL = `https://www.omdbapi.com/?apikey=76dbaf2b&type=movie&r=json&page=${page}&s=${searchString}`;

		const request = await fetch(requestURL);
	    const requestData = await request.json();

		if (page === 1) {
			if (requestData.totalResults < maxResults) {
				maxResults = requestData.totalResults;
				maxPages = Math.floor(requestData.totalResults / 10);
				if (requestData.totalResults % 10) {
					maxPages += 1;
				}
			}
		}

		let sliceNum = 10;
		numResults += requestData.Search.length;
		if (numResults > maxResults) {
			sliceNum = sliceNum - (numResults - maxResults);
		}

		shows.push(...requestData.Search.slice(0,sliceNum));
	}

	showsDiv.classList.remove("shows__loading");

	renderShows(sortOrder);
}

async function getPlot(id) {
	if (!showPlots[id]) {
		const requestURL = `https://www.omdbapi.com/?apikey=76dbaf2b&type=movie&r=json&plot=short&i=${id}`;
		const request = await fetch(requestURL);
		const requestData = await request.json();
		showPlots[id] = requestData.Plot;
	}
    const showSpan = document.getElementById(id);
	showSpan.innerHTML = showPlots[id];
}

function dropPlot(id) {
    const showSpan = document.getElementById(id);
	showSpan.innerHTML = "";
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

    showsDiv.innerHTML = shows.map(show => getShowHTML(show)).join("");
}

/**
 * callback for the map() in renderShows, generates HTML for an individual show
 * 
 * @param {*} show 
 * @returns string for map()
 */
function getShowHTML(show) {
    return `
    <div class="show" onmouseenter="getPlot('${show.imdbID}')" onmouseleave="dropPlot('${show.imdbID}')">
	  <span id="${show.imdbID}" class="show-plot"></span>
      <div class="show__img">
        <img src="${show.Poster}" onerror="this.src='no_img.svg'" class="image">
      </div>
      <div class="show__title">
        ${show.Title}
      </div>
      <div class="show__year">
        ${show.Year}
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
	if (!shows.length) {
		return;
	}
	renderShows(sortOrder);
}
