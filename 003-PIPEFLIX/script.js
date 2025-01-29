const moviesGrid = document.getElementById('movies');
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const categoryList = document.getElementById('categoryList');
const logo = document.querySelector('.logo');

let movies = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let selectedGenre = ''; // Guardar la categoría seleccionada

// ✅ FUNCIÓN PARA MOSTRAR LAS PELÍCULAS FILTRADAS
function displayMovies(moviesToShow) {
    moviesGrid.innerHTML = '';

    if (moviesToShow.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    moviesToShow.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.titulo}" />
            </div>
            <div class="movie-overlay">
                <div class="movie-info">
                    <h3>${movie.titulo}</h3>
                    <p>Año: ${movie.año}</p>
                    <p>Género: ${movie.genero}</p>
                    <button class="play-button">▶ Reproducir</button>
                    <button class="favorite-button">❤️ Favorito</button>
                </div>
            </div>
        `;

        // ✅ ABRIR EL TRÁILER EN UNA NUEVA PESTAÑA CON AUTOPLAY
        movieCard.querySelector('.play-button').addEventListener('click', () => {
            if (movie.trailer) {
                let autoplayUrl = movie.trailer.includes('?') ? `${movie.trailer}&autoplay=1&mute=1` : `${movie.trailer}?autoplay=1&mute=1`;
                window.open(autoplayUrl, '_blank');
            } else {
                alert("No hay tráiler disponible para esta película.");
            }
        });

        // ✅ AÑADIR A FAVORITOS
        movieCard.querySelector('.favorite-button').addEventListener('click', () => {
            addToFavorites(movie);
        });

        moviesGrid.appendChild(movieCard);
    });
}

// ✅ FUNCIÓN PARA FILTRAR PELÍCULAS POR BÚSQUEDA Y/O CATEGORÍA
function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    
    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.titulo.toLowerCase().includes(searchTerm);
        const matchesGenre = !selectedGenre || movie.genero === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    displayMovies(filteredMovies);
}

// ✅ EVENTO PARA FILTRAR EN TIEMPO REAL CON EL BUSCADOR
searchInput.addEventListener('input', filterMovies);

// ✅ FUNCIÓN PARA POBLAR LAS CATEGORÍAS EN EL MENÚ LATERAL
function populateCategories() {
    const genres = [...new Set(movies.map(movie => movie.genero))];
    categoryList.innerHTML = ''; 

    // Opción "Favoritos"
    const favoritesLi = document.createElement('li');
    favoritesLi.textContent = "⭐ Favoritos";
    favoritesLi.addEventListener('click', () => {
        selectedGenre = ''; // No aplicar filtro de género
        searchInput.value = ''; // Limpiar búsqueda
        displayMovies(favorites);
        sidebar.classList.remove('active');
    });
    categoryList.appendChild(favoritesLi);

    // Agregar categorías dinámicamente
    genres.forEach(genre => {
        const li = document.createElement('li');
        li.textContent = genre;

        li.addEventListener('click', () => {
            selectedGenre = genre; // Guardar la categoría seleccionada
            searchInput.value = ''; // Limpiar búsqueda
            filterMovies();
            sidebar.classList.remove('active'); // Cerrar el menú después de seleccionar
        });

        categoryList.appendChild(li);
    });
}

// ✅ FUNCIÓN PARA CARGAR LAS PELÍCULAS DESDE JSON
async function loadMovies() {
    try {
        const response = await fetch('peliculas.json');
        if (!response.ok) throw new Error('Error al cargar JSON');
        movies = await response.json();
        populateCategories();
        displayMovies(movies);
    } catch (error) {
        console.error('Error al cargar películas:', error);
    }
}

// ✅ EVENTO PARA MOSTRAR TODAS LAS PELÍCULAS AL HACER CLIC EN "PipeFlix"
logo.addEventListener('click', () => {
    selectedGenre = '';
    searchInput.value = '';
    displayMovies(movies);
});

// ✅ EVENTO PARA ABRIR/CERRAR EL MENÚ LATERAL
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// ✅ CERRAR EL MENÚ CUANDO SE HAGA CLIC FUERA DE ÉL
document.addEventListener('click', (event) => {
    if (!sidebar.contains(event.target) && event.target !== menuToggle) {
        sidebar.classList.remove('active');
    }
});

// ✅ INICIAR CARGA DE PELÍCULAS
loadMovies();
