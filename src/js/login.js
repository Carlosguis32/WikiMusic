async function login() {
    // Fetch the environment variables from the server
    const config = await fetch("/env").then((config) => config.json());

    // Spotify scopes for authentication and permissions
    const scopeImageUpload = "%20ugc-image-upload";

    const scopeReadPlaybackState = "%20user-read-playback-state";
    const scopeModifyPlaybackState = "%20user-modify-playback-state";
    const scopeReadCurrentlyPlaying = "%20user-read-currently-playing";

    const scopeAppRemoteControl = "%20app-remote-control";
    const scopeStreaming = "%20streaming";

    const scopePlaylistReadPrivate = "%20playlist-read-private";
    const scopePlaylistReadCollaborative = "%20playlist-read-collaborative";
    const scopePlaylistModifyPrivate = "%20playlist-modify-private";
    const scopePlaylistModifyPublic = "%20playlist-modify-public";

    const scopeUserFollowModify = "%20user-follow-modify";
    const scopeUserFollowRead = "%20user-follow-read";

    const scopeUserReadPlaybackPosition = "%20user-read-playback-position";
    const scopeReadTop = "%20user-top-read";
    const scopeReadRecentlyPlayed = "%20user-read-recently-played";

    const scopeUserLibraryModify = "%20user-library-modify";
    const scopeUserLibraryRead = "%20user-library-read";

    const scopeReadEmail = "%20user-read-email";
    const scopeReadPrivate = "%20user-read-private";

    const SPOTIFY_AUTHORIZATION_URL =
        "https://accounts.spotify.com/authorize?client_id=" +
        config.clientID +
        "&response_type=code&redirect_uri=" +
        encodeURI(config.rootDomain + "/html/home") +
        `&show_dialog=true&scope=streaming${scopeImageUpload}${scopeReadPlaybackState}${scopeReadCurrentlyPlaying}
        ${scopePlaylistReadPrivate}${scopePlaylistReadCollaborative}${scopePlaylistModifyPrivate}${scopePlaylistModifyPublic}
        ${scopeUserFollowModify}${scopeUserFollowRead}${scopeReadTop}${scopeReadRecentlyPlayed}${scopeUserLibraryModify}
        ${scopeUserLibraryRead}${scopeReadEmail}${scopeReadPrivate}`;

    const response = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: document.getElementById("emailInput").value,
            password: document.getElementById("passwordInput").value,
        }),
    });

    if (response.ok) {
        sessionStorage.setItem("auth_redirect", "true");
        window.location.href = SPOTIFY_AUTHORIZATION_URL;
    } else {
        errorHandler(await response.json());
    }
}
