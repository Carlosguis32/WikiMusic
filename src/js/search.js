//Fill the top items list with the top items of the user
const fillSearchResultsList = (numberOfResults) => {
    getSearchData(numberOfResults).then((response) => {
        let tracksResultsList = document.getElementById("tracksSearchedList");
        tracksResultsList.innerHTML = "";

        let artistsResultsList = document.getElementById("artistsSearchedList");
        artistsResultsList.innerHTML = "";

        let albumsResultsList = document.getElementById("albumsSearchedList");
        albumsResultsList.innerHTML = "";

        let trackNames = response.tracks.items.map((item) => item.name);
        let trackAlbumImages = response.tracks.items.map((item) => item.album.images[2]?.url || null);
        let trackArtistsNames = response.tracks.items.map((item) => item.artists.map((artist) => artist.name));
        let trackDurations = response.tracks.items.map((item) => item.duration_ms);
        let trackAlbum = response.tracks.items.map((item) => item.album.name);

        let artistNames = response.artists.items.map((item) => item.name);
        let artistImages = response.artists.items.map((item) => item.images[0]?.url || null);

        let albumNames = response.albums.items.map((item) => item.name);
        let albumImages = response.albums.items.map((item) => item.images[1]?.url || null);
        let albumArtistsNames = response.albums.items.map((item) => item.artists.map((artist) => artist.name));

        trackNames.forEach((item, index) => {
            let component = createTopTrackComponent(
                item,
                index + 1,
                trackAlbumImages[index],
                trackArtistsNames[index],
                msToMinutesAndSeconds(trackDurations[index]),
                trackAlbum[index]
            );
            tracksResultsList.appendChild(component);
        });

        artistNames.forEach((item, index) => {
            let component = createTopArtistComponent(item, index + 1, artistImages[index]);
            artistsResultsList.appendChild(component);
        });

        albumNames.forEach((item, index) => {
            let component = createTopAlbumComponent(item, index + 1, albumImages[index], albumArtistsNames[index]);
            albumsResultsList.appendChild(component);
        });
    });
};

window.addEventListener("DOMContentLoaded", (event) => {
    fillSearchResultsList(sessionStorage.getItem("max_results"));
});
