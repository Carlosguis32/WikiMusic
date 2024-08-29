//Display profile information
const setProfileInfoPage = async () => {
    let response = await getCurrentProfileInfo();

    if (response) {
        document.getElementById("profileImage").src = response.images[1].url || null;
        document.getElementById("profileName").textContent = response.display_name;
        document.getElementById("profileEmail").textContent = response.email;
        document.getElementById("profileCountry").textContent = response.country;
        document.getElementById("profileSubscription").textContent =
            response.product.charAt(0).toUpperCase() + response.product.slice(1);
        document.getElementById("profileFollowers").textContent = response.followers.total;
        document.getElementById("profileID").textContent = response.id;
        document.getElementById("profileLink").href = response.external_urls.spotify;
    } else {
        alert("An error occurred while trying to get the profile information.");
    }
};
