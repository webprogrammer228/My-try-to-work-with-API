const API_KEY = 'b4ed7a15-94ce-4903-bb44-9e0af37c38ab';
const API_URL_POPULAR = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1';
const API_URL_POPULAR_PAGE = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=';
const API_URL_SEARCH = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=';

const form = document.querySelector('form');
const search = form.search;

function getMovies(url) {
	const request = new XMLHttpRequest();

	request.open('GET', url);
	request.responseType = 'json';
	request.setRequestHeader('Content-type', 'application/json');
	request.setRequestHeader('X-API-KEY', API_KEY);

	request.getResponseHeader('Content-Type');
	request.send();
	request.addEventListener('load', function() {
		if (request.readyState === 4 && request.status === 200) {
			let data = request.response;
			showMovies(data);
		}
		else {
			console.error('Что то пошло не так');
		}
	});
}

// Обводка цвета рейтинга по оценке

function getClassByRate(vote) {
	if (vote >= 7) {
		return 'green';
	}
	else if (vote > 5) {
		return 'orange';
	}
	else {
		return 'red';
	}
}

// Вывод списка фильмов

function showMovies(data) {
	const moviesElem = document.querySelector('.films');
	document.querySelector('.films').innerHTML = '';
	data.films.forEach(movie => {
		const movieElem = document.createElement('div');
		movieElem.classList.add('movie');
		movieElem.innerHTML = `
		<div class="movie_poster">
		<img src="${movie.posterUrlPreview}"
		alt="${movie.nameRu}">
		<div class="movie_dark">
		</div>
	</div>
	<div class="movie_description">
		<div class="title">
			${movie.nameRu}
		</div>
		<div class="movie_category">
			${movie.genres.map((genre) => `${genre.genre}`)}
		</div>
		${movie.rating &&
			`
		<div class="movie_average movie_average_${getClassByRate(movie.rating)}">
			${movie.rating}
		</div>
		`
			}
	</div>
		`;
		moviesElem.appendChild(movieElem);
	});
	// проблема с рейтингом, если нет рейтинга у фильма - выдается undefined. Как избавиться - вопрос.

	const film = document.querySelectorAll('.movie_dark');
	const modal_block = document.getElementById('modal_block');
	const poster = document.getElementById('poster');
	const table = document.getElementById('table');

	// Нажатие на любой из фильмов выводит попап. Перебор массива в функцию
	for (let i = 0; i < film.length; i++) {
		film[i].addEventListener('click', set_handler(i), false);
	}

	function set_handler(i) {
		return function(e) {
			e.preventDefault();
			modal_block.classList.toggle('open');

			poster.innerHTML = `<img src='${data.films[i].posterUrlPreview}'>`;
			table.innerHTML = `
		<h2 class="title_modal"> ${data.films[i].nameRu}</h2>
		<span class="year">Год: ${data.films[i].year}</span>
		<span class="country">Страна: ${data.films[i].countries.map((country) => `${country.country}`)}</span>
		<span class="rating">Рейтинг: ${data.films[i].rating}</span>
		<span class="genre">Жанр: ${data.films[i].genres.map((genre) => `${genre.genre}`)}</span>
		<span class="timing">Продолжительность: ${data.films[i].filmLength}ч</span>`
		};
	}

	// Закрытие модального окна по клику на любое место вне модального окна

	modal_block.addEventListener('click', function(event) {
		let body = document.querySelector('.modal_body');
		if (event.target == body) {
			modal_block.classList.remove('open');
		}
	})
}

// поиск фильмов

form.addEventListener('submit', (event) => {
	event.preventDefault();

	const apiSearchUrl = `${API_URL_SEARCH}${search.value}`;
	if (search.value) {
		getMovies(apiSearchUrl);
		search.value = '';
	}
})

// Пагинация

const previous = document.getElementById('previous');
const next = document.getElementById('next');

const pagination = document.getElementById('pagination');
const numbers = document.getElementById('numbers');

pagination.addEventListener('click', function(event) {

	const target = event.target;
	if (target.tagName != 'BUTTON') return;
	let page = +document.querySelector('.active').textContent;

	let activePage = document.querySelector('.active');

	if (target.matches('#pagination > .numbers > button')) {
		activePage.setAttribute('class', '');
		numbers.children[target.textContent - 1].setAttribute('class', 'active');
		getMovies(`${API_URL_POPULAR_PAGE}${+target.textContent}`)
	}

	else if (target.matches('#pagination > button')) {
		if (target.matches('.previous')) {
			if (page !== 1) {
				page--;
				activePage.setAttribute('class', '');
				numbers.children[page - 1].setAttribute('class', 'active');
				getMovies(`${API_URL_POPULAR_PAGE}${page}`);
			}
			else if (page == 1) {
				page = 5;
				activePage.setAttribute('class', '');
				numbers.children[page - 1].setAttribute('class', 'active');
				getMovies(`${API_URL_POPULAR_PAGE}${page}`);
			}
		}

		else if (target.matches('.next')) {
			if (page !== 5) {
				activePage.setAttribute('class', '');
				numbers.children[page].setAttribute('class', 'active');
				page = +document.querySelector('.active').textContent;
				getMovies(`${API_URL_POPULAR_PAGE}${page}`);
			}
			else {
				page = 0;
				activePage.setAttribute('class', '');
				numbers.children[page].setAttribute('class', 'active');
				getMovies(`${API_URL_POPULAR_PAGE}${page + 1}`);
			}
		}
	}
});

let firstPage = numbers.children[0];

window.onload = function() {
	getMovies(API_URL_POPULAR);
	firstPage.classList.add('active');
}

