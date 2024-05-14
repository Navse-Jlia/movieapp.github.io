// экземпляр объекта
const createMovieService = (apiKey) => {
  // Базовый URL API
  const apiBase = 'https://api.themoviedb.org/3';

  //  GET-запрос и обработка ответа
  const getResource = async (url) => {
    const result = await fetch(`${apiBase}${url}`);
    if (!result.ok) {
      throw new Error(`Could not fetch ${url}, received ${result.status}`);
    }
    return result.json();
  };

  //  список фильмов по запросу
  const getMovies = async (query = 'filth', currentPage = 1) => {
    return getResource(
      `/search/movie?api_key=${apiKey}&language=en-US&query=${query}&page=${currentPage}`
    );
  };

  //  списoк жанров
  const getGenres = async () => {
    return getResource(`/genre/movie/list?api_key=${apiKey}&language=en-US`);
  };

  //  гостевая сессии
  const getQuestSession = async () => {
    const data = await fetch(
      `https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${apiKey}`
    );
    return data.json();
  };

  //  оценка фильма
  const postMovieRating = async (movieId, rating) => {
    const token = localStorage.getItem('token');
    const data = await fetch(
      `${apiBase}/movie/${movieId}/rating?api_key=${apiKey}&guest_session_id=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          value: rating,
        }),
      }
    );
    return data.json();
  };

  //  удаление оценки фильма
  const deleteRating = async (movieId) => {
    const token = localStorage.getItem('token');
    const data = await fetch(
      `${apiBase}/movie/${movieId}/rating?api_key=${apiKey}&guest_session_id=${token}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
      }
    );
    return data;
  };

  // получение  оцененных фильмов
  const getRatedMovies = async (page = 1) => {
    const token = localStorage.getItem('token');
    const data = await fetch(
      `${apiBase}/guest_session/${token}/rated/movies?api_key=${apiKey}&page=${page}`
    );
    return data.json();
  };

  // получение  токена
  const getLocalGuestSessionToken = () => {
    return localStorage.getItem('token');
  };

  // токен в локальное хранилище
  const setLocalGuestSessionToken = (token) => {
    localStorage.setItem('token', token);
  };

  // установка оценки
  const setLocalRating = (id, value) => {
    localStorage.setItem(id, value);
  };

  // получения оценки
  const getLocalRating = (id) => {
    return +localStorage.getItem(id);
  };

  // методы API
  return {
    getMovies,
    getGenres,
    getQuestSession,
    postMovieRating,
    deleteRating,
    getRatedMovies,
    getLocalGuestSessionToken,
    setLocalGuestSessionToken,
    setLocalRating,
    getLocalRating,
  };
};

// API ключь
const movieService = createMovieService('b0c02172979c3be4ee01cdaa0825f81e');

export default movieService;
