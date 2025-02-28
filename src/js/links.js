function searchPanel(searchInput, maxResults) {
    if (searchInput.trim() !== "" && maxResults.trim() !== "" && maxResults > 0 && maxResults <= 50) {
        sessionStorage.setItem("search_input", searchInput);
        sessionStorage.setItem("max_results", maxResults);
        window.location.href = "/html/search";
    } else {
        alert("Please, enter a valid search input and a valid number of results (1-" + maxResults + ").");
    }
}

function keyDownUserInput(event) {
    if (event.key === "Enter") {
        let searchLimit = "9";

        searchPanel(document.getElementById("userInput").value, searchLimit);
    }
}
