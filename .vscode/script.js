document.addEventListener("DOMContentLoaded", () => {
    fetchMovies();
});

let selectedMovie = null;
// fetching movie
function fetchMovies() {
    const filmsList = document.getElementById("films");
    filmsList.innerHTML = "<li>Loading movies...</li>";

    fetch("http://localhost:3000/films")
        .then(response => response.json())
        .then(movies => {
            displayMovies(movies);
        })
        .catch(error => console.error("Error fetching movies:", error));
}

function displayMovies(movies) {
    const filmsList = document.getElementById("films");
    filmsList.innerHTML = "";

    movies.forEach(movie => {
        const listItem = document.createElement("li");
        listItem.textContent = movie.title;

        let availableTickets = movie.capacity - movie.tickets_sold;

        if (availableTickets === 0) {
            listItem.classList.add("sold-out");
            listItem.textContent += " (Sold Out)";
        }

        listItem.addEventListener("click", () => {
            if (availableTickets === 0) {
                alert("The movie is sold out!");
                return;
            }
            displayMovieDetails(movie);
        });

        filmsList.appendChild(listItem);
    });
}
// dispaly movie details
function displayMovieDetails(movie) {
    selectedMovie = movie;

    document.getElementById("poster").src = movie.poster;
    document.getElementById("title").textContent = movie.title;
    document.getElementById("runtime").textContent = movie.runtime;
    document.getElementById("showtime").textContent = movie.showtime;

    const availableTickets = movie.capacity - movie.tickets_sold;
    document.getElementById("available-tickets").textContent = availableTickets;

    const buyButton = document.getElementById("buy-ticket");
    buyButton.disabled = availableTickets <= 0;
    buyButton.textContent = availableTickets > 0 ? "Buy Ticket" : "Sold Out";

    buyButton.onclick = () => buyTicket(movie);
}
// Handle ticket purchase
function buyTicket(movie) {
    let availableTickets = parseInt(document.getElementById("available-tickets").textContent);

    if (availableTickets > 0) {
        availableTickets--;

        // Update UI immediately
        document.getElementById("available-tickets").textContent = availableTickets;
        selectedMovie.tickets_sold = movie.capacity - availableTickets; // Update selectedMovie object

        fetch('http://localhost:3000/films/${movie.id}', {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tickets_sold: selectedMovie.tickets_sold }) // Send correct updated value
        })
        .then(response => response.json())
        .then(() => {
            if (availableTickets === 0) {
                document.getElementById("buy-ticket").textContent = "Sold Out";
                document.getElementById("buy-ticket").disabled = true;
                updateSidebar(movie.id);
            }
        })
        .catch(error => console.error("Error updating tickets:", error));
    }
}

// show sold out movies on the sidebar
function updateSidebar(movieId) {
    const movieItems = document.querySelectorAll("#films li");

    movieItems.forEach(item => {
        if (item.textContent.includes(selectedMovie.title)) {
            item.classList.add("sold-out");
            item.textContent = selectedMovie.title + " (Sold Out)";
        }
    });
}
const deleteButton = document.createElement("button");
deleteButton.textContent = "Delete Movie";
deleteButton.id = "delete-movie";
document.getElementById("movie-details").appendChild(deleteButton);

// Handle movie deletion
deleteButton.addEventListener("click", () => {
    if (!selectedMovie) return; // Ensure a movie is selected

    fetch('http://localhost:3000/films/${selectedMovie.id}', {
        method: "DELETE"
    })
    .then(response => {
        if (response.ok) {
            removeMovieFromUI(selectedMovie.id); // Remove from UI
            clearMovieDetails(); // Clear movie details section
        } else {
            console.error("Failed to delete movie");
        }
    })
    .catch(error => console.error("Error deleting movie:", error));
});

// Remove the deleted movie from the sidebar
function removeMovieFromUI(movieId) {
    const movieItems = document.querySelectorAll("#films li");
    movieItems.forEach(item => {
        if (item.textContent.includes(selectedMovie.title)) {
            item.remove();
        }
    });
}

// Clear the movie details after deletion
function clearMovieDetails() {
    document.getElementById("poster").src = "";
    document.getElementById("title").textContent = "";
    document.getElementById("runtime").textContent = "";
    document.getElementById("showtime").textContent = "";
    document.getElementById("available-tickets").textContent = "";
    document.getElementById("buy-ticket").disabled = true;
    document.getElementById("buy-ticket").textContent = "Sold Out";
}
// adding new movie
document.getElementById("add-movie-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent page reload

    const newMovie = {
        title: document.getElementById("new-title").value,
        poster: document.getElementById("new-poster").value,
        runtime: parseInt(document.getElementById("new-runtime").value),
        showtime: document.getElementById("new-showtime").value,
        capacity: parseInt(document.getElementById("new-capacity").value),
        tickets_sold: 0
    };

    fetch("http://localhost:3000/films", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie)
    })
    .then(response => response.json())
    .then(movie => {
        addMovieToUI(movie);
        document.getElementById("add-movie-form").reset(); // Clear form
    })
    .catch(error => console.error("Error adding movie:", error));
});

// Function to add the movie to the sidebar
function addMovieToUI(movie) {
    const filmsList = document.getElementById("films");
    const listItem = document.createElement("li");
    listItem.textContent = movie.title;

    listItem.addEventListener("click", () => displayMovieDetails(movie));
    filmsList.appendChild(listItem);
}