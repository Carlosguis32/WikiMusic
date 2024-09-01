async function signup() {
    const response = await fetch("/html/signup/auth", {
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

    if (response.status === 200) {
        document.getElementById("modalDialogText").textContent = "Your account has been created";
        document.getElementById("modalDialogDescription").textContent =
            "A confirmation email has been sent to your email address";
        const modalDialog = document.getElementById("modalDialog");
        modalDialog.showModal();
    } else {
        const error = await response.json();
        errorHandler(error);
    }

    modalDialog.addEventListener("close", function onClose() {
        if (response.status === 200) {
            window.location.href = "/html/login";
        }
    });
}
