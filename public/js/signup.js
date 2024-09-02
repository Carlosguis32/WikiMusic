async function signup() {
    let response = await fetch("/api/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: document.getElementById("usernameInput").value,
            email: document.getElementById("emailInput").value,
            password: document.getElementById("passwordInput").value,
            confirmPassword: document.getElementById("confirmPasswordInput").value,
        }),
    });

    response = await response.json();

    if (response.ok) {
        document.getElementById("modalDialogText").textContent = "Your account has been created";
        document.getElementById("modalDialogDescription").textContent =
            "A confirmation email has been sent to your email address";
        const modalDialog = document.getElementById("modalDialog");
        modalDialog.showModal();
    } else {
        errorHandler(response);
    }

    modalDialog.addEventListener("close", function onClose() {
        if (response.ok) {
            window.location.href = "/html/login";
        }
    });
}
