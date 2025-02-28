//Load the top menu bar from the menu_bar.html file
function loadMenu() {
    fetch("/html/menu_bar.html")
        .then((response) => response.text())
        .then((data) => {
            document.getElementById("topBarMenu").innerHTML = data;
        })
        .catch((error) => console.error("Error loading the menu:", error));
}

//Callback to every time the page is loaded
window.addEventListener("DOMContentLoaded", async (event) => {
    loadMenu();
});
