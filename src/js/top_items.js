//Fill the top items list with the top items of the user
async function fillTopItemsList(itemType, timeRange, limit, offset) {
	let response = await getTopItems(itemType, timeRange, limit, offset);
	sessionStorage.setItem("top_items_offset", offset);
	const pageNumberSelect = document.getElementById("pageNumber");
	pageNumberSelect.value = parseInt(offset) / limit + 1;
	let numPages = Math.ceil(response.total / limit);
	document.getElementById("pageNumber").setAttribute("max", numPages);

	if (response.total <= limit) {
		document.getElementById("next").classList.add("hidden");
		document.getElementById("previous").classList.add("hidden");
		document.getElementById("pageNumber").classList.add("hidden");
	} else if (response.total / (parseInt(offset) + limit) <= 1) {
		document.getElementById("next").classList.add("hidden");
		document.getElementById("previous").classList.remove("hidden");
		document.getElementById("pageNumber").classList.remove("hidden");
	} else if (offset === 0) {
		document.getElementById("next").classList.remove("hidden");
		document.getElementById("previous").classList.add("hidden");
		document.getElementById("pageNumber").classList.remove("hidden");
	} else {
		document.getElementById("next").classList.remove("hidden");
		document.getElementById("previous").classList.remove("hidden");
		document.getElementById("pageNumber").classList.remove("hidden");
	}

	const topItemsList = document.getElementById("topItemsList");
	const topItemsNames = response.items.map((item) => item.name);
	topItemsList.innerHTML = "";
	topItemsList.classList.add("nunitoText");

	if (itemType === "artists") {
		topItemsList.classList.add("topArtistsList");
		const artistsImages = response.items.map((item) => item.images[0]?.url || null);
		topItemsNames.forEach((item, index) => {
			const component = createTopArtistComponent(item, index + offset + 1, artistsImages[index]);
			topItemsList.appendChild(component);
		});
	} else if (itemType === "tracks") {
		topItemsList.classList.remove("topArtistsList");
		const trackAlbumImages = response.items.map((item) => item.album.images[2]?.url || null);
		const trackArtistsNames = response.items.map((item) => item.artists.map((artist) => artist.name));
		const trackDurations = response.items.map((item) => item.duration_ms);
		const trackAlbum = response.items.map((item) => item.album.name);
		topItemsNames.forEach((item, index) => {
			const component = createTopTrackComponent(
				item,
				index + offset + 1,
				trackAlbumImages[index],
				trackArtistsNames[index],
				msToMinutesAndSeconds(trackDurations[index]),
				trackAlbum[index]
			);
			topItemsList.appendChild(component);
		});
	}
}

function createTopArtistComponent(artistName, index, artistImage) {
	const li = document.createElement("li");
	index = index < 10 ? "0" + index : index;

	const content = `
        <div class="topArtist">
            <p class="rankArtistNumber subtitle">${index}</p>
            <a href="#"><img src=${artistImage} onerror=this.src='/public/user_avatar.svg'></a>
            <div class="artistDetails">
                <a href="#" class="artistName subtitle">${artistName}</a>
            </div>
        </div>
    `;

	li.innerHTML = content;

	return li;
}

function createTopTrackComponent(trackName, index, trackAlbumImage, trackArtistName, trackDuration, trackAlbum) {
	const li = document.createElement("li");
	index = index < 10 ? "0" + index : index;

	if (trackArtistName.length > 1) {
		trackArtistName = trackArtistName.join(", ");
	}

	const content = `
        <div id=topTrack>
            <p class="rankTrackNumber subtitle">${index}</p>
            <img src=${trackAlbumImage} alt="Cover Image">
            <div class="trackDetails">
                <a href="#"><span class="trackName subtitle">${trackName}</span></a>
                <a href="#"><span class="trackArtistName subtitle">${trackArtistName}</span></a>
            </div>
            <div class="trackAlbum subtitle"><a href="#">${trackAlbum}</a></div>
            <div class="trackDuration subtitle">${trackDuration}</div>
        </div>
    `;

	li.innerHTML = content;

	return li;
}

function createTopAlbumComponent(albumName, index, albumImage, artistName) {
	const li = document.createElement("li");
	index = index < 10 ? "0" + index : index;

	const content = `
        <div class="topAlbum">
            <p class="rankAlbumNumber subtitle">${index}</p>
            <a href="#"><img src=${albumImage} onerror=this.src='/public/user_avatar.svg'></a>
            <a href="#" class="albumName subtitle">${albumName}</a>
            <a href="#" class="artistName subtitle">${artistName}</a>
        </div>
    `;

	li.innerHTML = content;

	return li;
}

function pageSwitchButtonClicked(pagesSwitch) {
	const topItemsTypeSelect = document.getElementById("topItemsType");
	const timeRangeSelect = document.getElementById("timeRange");
	const itemType = topItemsTypeSelect.value;
	const timeRange = timeRangeSelect.value;
	const offset = sessionStorage.getItem("top_items_offset");

	fillTopItemsList(itemType, timeRange, 50, parseInt(offset) + pagesSwitch);

	window.scrollTo(0, 0);
}

function listenerSelectActivated(offset) {
	const topItemsTypeSelect = document.getElementById("topItemsType");
	const timeRangeSelect = document.getElementById("timeRange");
	const itemType = topItemsTypeSelect.value;
	const timeRange = timeRangeSelect.value;
	sessionStorage.removeItem("top_items_offset");
	fillTopItemsList(itemType, timeRange, 50, offset);

	window.scrollTo(0, 0);
}

//Listener for changes in the select itemType and timeRange
document.addEventListener("DOMContentLoaded", (event) => {
	const topItemsTypeSelect = document.getElementById("topItemsType");
	const timeRangeSelect = document.getElementById("timeRange");
	const pageNumberSelect = document.getElementById("pageNumber");

	topItemsTypeSelect.addEventListener("change", () => {
		listenerSelectActivated(0);
	});

	timeRangeSelect.addEventListener("change", () => {
		listenerSelectActivated(0);
	});

	pageNumberSelect.addEventListener("change", () => {
		let max = parseInt(document.getElementById("pageNumber").getAttribute("max"));
		let min = parseInt(document.getElementById("pageNumber").getAttribute("min"));

		if (parseInt(pageNumberSelect.value) <= max && parseInt(pageNumberSelect.value) >= min) {
			listenerSelectActivated(pageNumberSelect.value * 50 - 50);
		} else {
			alert("Invalid page number");
		}
	});

	document.getElementById("pageNumber").addEventListener("input", function () {
		let input = this;
		let value = parseInt(input.value, 10);
		let min = parseInt(input.min, 10);
		let max = parseInt(input.max, 10);

		if (value > max) {
			input.value = max;
		} else if (value < min) {
			input.value = min;
		}
	});
});
