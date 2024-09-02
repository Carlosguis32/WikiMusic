async function signup() {
    const response = await fetch("/api/signup", {
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

    if (response.ok) {
        document.getElementById("modalDialogText").textContent = "Your account has been created";
        document.getElementById("modalDialogDescription").textContent =
            "A confirmation email has been sent to your email address";
        const modalDialog = document.getElementById("modalDialog");
        modalDialog.showModal();
    } else {
        errorHandler(await response.json());
    }

    modalDialog.addEventListener("close", function onClose() {
        if (response.ok) {
            window.location.href = "/html/login";
        }
    });
}
