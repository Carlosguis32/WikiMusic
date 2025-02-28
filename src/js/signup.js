async function signup() {
    const username = document.getElementById("usernameInput").value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    const confirmPassword = document.getElementById("confirmPasswordInput").value;

    const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            email,
            password,
            confirmPassword,
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
