////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////   API AUTHENTIFICATION METHODS   ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Obtain or refresh token for interacting with Spotify API
const getAccessToken = async () => {
    const config = await fetch("/env").then((config) => config.json());
    const request = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(config.clientID + ":" + config.clientSecret),
        },
        body:
            "grant_type=authorization_code" +
            "&code=" +
            sessionStorage.getItem("authentification_code") +
            "&redirect_uri=" +
            encodeURI(config.rootDomain + "/html/home") +
            "&client_id=" +
            config.clientID +
            "&client_secret=" +
            config.clientSecret,
    });

    let response = await request.json();

    if (response.error) {
        refreshAccessToken(response.refresh_token);
    } else {
        sessionStorage.setItem("access_token", response.access_token);
        sessionStorage.setItem("refresh_token", response.refresh_token);
    }
};

//Refresh access token
const refreshAccessToken = async (refreshToken) => {
    const config = await fetch("/env").then((config) => config.json());
    const request = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(config.clientID + ":" + config.clientSecret),
        },
        body:
            "grant_type=refresh_token" +
            "&refresh_token=" +
            sessionStorage.getItem("refresh_token") +
            "&client_id=" +
            config.clientID,
    });

    let response = await request.json();

    if (!response.error) {
        sessionStorage.setItem("access_token", response.access_token);
        sessionStorage.setItem("refresh_token", response.refresh_token);
    }
};

//Get authentification code from URL
function getAuthentificationCode() {
    let code = null;
    let queryString = window.location.search;

    if (queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get("code");
    }

    if (code != null && code.length > 0) {
        sessionStorage.setItem("authentification_code", code);
    }

    return code;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////   API USERS DATA METHODS   //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Obtain current user profile information
const getCurrentProfileInfo = async () => {
    await getAccessToken();
    const request = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
            Authorization: "Bearer " + sessionStorage.getItem("access_token"),
        },
    });

    return await request.json();
};

//Obtain top artists or tracks from current user
// - Type: artists, tracks
// - Time range: short_term, medium_term, long_term
// - Limit: 1-50
// - Offset: 0, 50, 100, 150, 200...
const getTopItems = async (type, timeRange, limit, offset) => {
    await getAccessToken();
    let request = await fetch(
        `https://api.spotify.com/v1/me/top/${type}?time_range=${timeRange}&limit=${limit}&offset=${offset}`,
        {
            method: "GET",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("access_token"),
            },
        }
    );

    return await request.json();
};

//Obtain search data from Spotify API
// - Search results limit: 1-20
const getSearchData = async (searchResultsLimit) => {
    await getAccessToken();
    let userSearch = sessionStorage.getItem("search_input");
    let market = sessionStorage.getItem("current_user_user_country");
    let offset = 0;

    const request = await fetch(
        `https://api.spotify.com/v1/search?q=${userSearch}&type=album,artist,track&market=${market}&limit=${searchResultsLimit}&offset=${offset}`,
        {
            method: "GET",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("access_token"),
            },
        }
    );

    return await request.json();
};

//Obtain recently played tracks from Spotify API
// - Recently played tracks limit: 1-50
const getRecentlyPlayedTracks = async (recentlyPlayedTracksLimit) => {
    await getAccessToken();
    const request = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played?limit=${recentlyPlayedTracksLimit}`,
        {
            method: "GET",
            headers: {
                Authorization: "Bearer " + sessionStorage.getItem("access_token"),
            },
        }
    );

    return await request.json();
};
