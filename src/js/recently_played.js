async function fillRecentlyPlayedTracksList(recentlyPlayedTracksLimit) {
    let response = await getRecentlyPlayedTracks(recentlyPlayedTracksLimit);
    recentlyPlayedList = document.getElementById("recentlyPlayedList");
    recentlyPlayedList.innerHTML = "";
    response.items.forEach((item, index) => {
        let component = createTopTrackComponent(
            item.track.name,
            index + 1,
            item.track.album.images[2]?.url,
            item.track.artists.map((artist) => artist.name),
            msToMinutesAndSeconds(item.track.duration_ms),
            item.track.album.name
        );

        recentlyPlayedList.appendChild(component);
    });
}

window.addEventListener("DOMContentLoaded", (event) => {
    fillRecentlyPlayedTracksList(50);
});
