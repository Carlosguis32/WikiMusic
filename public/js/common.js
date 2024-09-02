function msToMinutesAndSeconds(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = (Math.floor(ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function errorHandler(response) {
    const errorMessage = (response.errors && response.errors[0] && response.errors[0].msg) || response.error;
    document.getElementById("modalDialogText").textContent = "Oops, something went wrong";
    document.getElementById("modalDialogDescription").textContent = errorMessage;
    const errorDialog = document.getElementById("modalDialog");
    errorDialog.showModal();
}

function closeErrorDialog() {
    const errorDialog = document.getElementById("modalDialog");
    errorDialog.close();
}

window.addEventListener("DOMContentLoaded", async (event) => {
    if (sessionStorage.getItem("auth_redirect") === "true") {
        if (getAuthentificationCode()) {
            let response = await getCurrentProfileInfo();
            sessionStorage.setItem("current_user_user_country", response.country);
        }
        sessionStorage.removeItem("auth_redirect");
    }
});
