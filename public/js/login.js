async function login() {
    const config = await fetch("/env").then((config) => config.json());

    const response = await fetch("/html/login/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: document.getElementById("emailInput").value,
            password: document.getElementById("passwordInput").value,
        }),
    });

    if (response.status === 200) {
        sessionStorage.setItem("auth_redirect", "true");
        window.location.href =
            "https://accounts.spotify.com/authorize?client_id=" +
            config.clientID +
            "&response_type=code&redirect_uri=" +
            encodeURI(config.rootDomain + "/html/home") +
            "&show_dialog=true&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20" +
            "user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-top-read%20" +
            "user-read-recently-played";
    } else {
        const error = await response.json();
        errorHandler(error);
    }
}

async function logout() {
    const config = await fetch("/env").then((config) => config.json());
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = config.rootDomain + "/index";
}
