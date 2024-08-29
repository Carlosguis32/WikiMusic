//Load the top menu bar from the menu_bar.html file
function loadMenu() {
    fetch("/html/menu_bar.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("topBarMenu").innerHTML = data;
        })
        .catch((error) => console.error("Error loading the menu:", error));
}

function msToMinutesAndSeconds(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = (Math.floor(ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

//Callback to every time the page is loaded
window.addEventListener("DOMContentLoaded", async (event) => {
    loadMenu();
    if (sessionStorage.getItem("auth_redirect") === "true") {
        if (getAuthentificationCode()) {
            let response = await getCurrentProfileInfo();
            sessionStorage.setItem("current_user_user_country", response.country);
        }
        sessionStorage.removeItem("auth_redirect");
    }
});
