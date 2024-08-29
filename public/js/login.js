async function login() {
    const config = await fetch("/env").then((config) => config.json());
    if (
        document.getElementById("emailInput").value == "admin" &&
        document.getElementById("passwordInput").value == "admin"
    ) {
        sessionStorage.setItem("auth_redirect", "true");
        window.location.href =
            "https://accounts.spotify.com/authorize?client_id=" +
            config.clientID +
            "&response_type=code&redirect_uri=" +
            encodeURI(config.rootDomain + "home") +
            "&show_dialog=true&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20" +
            "user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-top-read%20" +
            "user-read-recently-played";
    } else {
        alert("Invalid credentials, try again.");
    }
}

//Not functional
async function logout() {
    const config = await fetch("/env").then((config) => config.json());
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = config.rootDomain + "index.html";
}
