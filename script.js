const API_URL = "http://localhost:3000/films";

// fetch and display the first movie
const fetchFirstMovie = () => {
    fetch(`${API_URL}/films/1`)
    .then(response => response.json())
    .then(data => {
        displayMovieDetails(data);
    });
};

// displaying movie details
const displayMovieDetails = (movie) => {
    document.getElementById("poster").src = movie.poster;
    document.getElementById("title").textContent = movie.title;
    document.getElementById("runtime").textContent = `Runtime: ${movie.runtime} minutes`;
    document.getElementById("showtime").textContent = `Showtime: ${movie.showtime}`;

    const availableTickets = movie.capacity - movie.tickets_sold;
    document.getElementById("available-ticket").textContent = `Available Tickets: ${availableTickets}`;

    const buyButton = document.getElementById("buy-ticket");
    buyButton.disabled = availableTickets === 0;
    buyButton.textContent = availableTickets === 0 ? "Sold Out" : "Buy Ticket";

    buyButton.onclick = () => purchaseTicket(movie);
};

// fetching and displaying all movies
const fetchAllMovies = () => {
    fetch(`${API_URL}/films`)
    .then(response => response.json())
    .then(data => {
        displayMovieMenu(data);
    });
};

// displaying the movie list
const displayMovieMenu = (movies) => {
    const filmsList = document.getElementById("films");
    filmsList.innerHTML = ""; // clears previous movies

    movies.forEach(movie => {
        const li = document.createElement("li");
        li.textContent = movie.title;
        li.classList.add("film", "item");

        if (movie.capacity - movie.tickets_sold === 0) {
            li.classList.add("sold-out");
        }

        // Click event to display movie details
        li.addEventListener("click", () => displayMovieDetails(movie));

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "DELETE";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteMovie(movie.id);
        });

        li.appendChild(deleteButton);
        filmsList.appendChild(li);
    });
};

// purchasing a ticket
const purchaseTicket = (movie) => {
    if (movie.tickets_sold < movie.capacity) {
        movie.tickets_sold += 1;

        // updating db.json with count
        fetch(`${API_URL}/films/${movie.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tickets_sold: movie.tickets_sold })
        })
        .then(response => response.json())
        .then(updatedMovie => {
            displayMovieDetails(updatedMovie);
            fetchAllMovies(); // Update movie list
        });
    }
};

// deleting a movie
const deleteMovie = (movieId) => {
    fetch(`${API_URL}/films/${movieId}`, { method: "DELETE" })
    .then(() => {
        fetchAllMovies(); // Refresh movie list
    });
};

// Initialize the app
fetchFirstMovie();
fetchAllMovies();
