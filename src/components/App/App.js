import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import { debounce } from 'lodash';
import { Offline, Online } from 'react-detect-offline';
import { Input, Spin, Alert, Pagination, Tabs } from 'antd';
import MovieList from '../MovieList/MovieList';
import movieService from '../services/services';
import ErrorIndicator from '../Error/Error';
import { Provider } from '../Context/Context';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moviesData: [], // данные о фильмах
      loading: true, // состояние загрузки
      error: null, // состояние ошибки
      searchQuery: 'filth', // запрос по умолчанию
      currentPage: 1, // текущая страница
      totalResults: 0, // общее количество
      currentPageRate: 1, // текущая страница оценок
      totalResultsRate: 0, // общее количество оценок
      genres: [], // жанры фильмов
      rate: [], // оценки фильмов
    };
    //  методы класса
    this.onPaginationChange = this.onPaginationChange.bind(this);
    this.onPaginationChangeRate = this.onPaginationChangeRate.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onRate = this.onRate.bind(this);
    this.onTabsChange = this.onTabsChange.bind(this);
    //  задержка поиска
    this.debouncedGetDataMovies = debounce(this.getDataMovies, 600);
  }

  componentDidMount() {
    // данные о жанрах
    this.load();
    // загрузка фильмов по умолчанию при первоначальной загрузке страницы
    this.getDataMovies();
  }
  //  получение данных о фильмах
  async getDataMovies() {
    const { searchQuery, currentPage } = this.state;
    if (searchQuery.trim().length === 0) {
      return;
    }
    try {
      // загрузка и ошибки
      this.setState({ loading: true, error: null });
      // данные о фильмах
      const data = await movieService.getMovies(searchQuery, currentPage);
      //  после загрузки
      this.setState({
        totalResults: data.total_pages,
        moviesData: data.results,
      });
    } catch (err) {
      //  ошибки
      this.setState({ error: err });
    } finally {
      // Сброс
      this.setState({ loading: false });
    }
  }

  // Асинхронная
  async load() {
    //  гостевой токен
    if (!movieService.getLocalGuestSessionToken()) {
      const session = await movieService.getQuestSession();
      movieService.setLocalGuestSessionToken(session.guest_session_id);
    }
    // жанры и оценка фильмов
    const dataGenre = await movieService.getGenres();
    const ratedMovies = await movieService.getRatedMovies();
    // состояния компонента после
    this.setState({
      genres: dataGenre.genres,
      rate: ratedMovies.results,
    });
  }

  //  оценки фильмов
  async loadRatedMovies(page) {
    try {
      this.setState({ loading: true, error: null });
      const data = await movieService.getRatedMovies(page);
      this.setState({
        totalResultsRate: data.total_results,
        rate: data.results,
      });
    } catch (err) {
      this.setState({ error: err });
    } finally {
      this.setState({ loading: false });
    }
  }

  //  результаты поиска
  onPaginationChange(page) {
    this.setState({ currentPage: page }, () => this.getDataMovies());
  }

  //  изменения оценок фильмов
  onPaginationChangeRate(page) {
    this.setState({ currentPageRate: page }, () => this.loadRatedMovies(page));
  }

  // изменения поискового запроса
  onSearchChange(e) {
    this.setState({ searchQuery: e.target.value }, () => {
      // обновления результатов поиска
      this.debouncedGetDataMovies();
    });
  }

  // оценки фильма
  async onRate(id, value) {
    if (value > 0) {
      await movieService.postMovieRating(id, value);
      movieService.setLocalRating(id, value);
    } else {
      // Удаление оценки фильма
      await movieService.deleteRating(id);
      localStorage.removeItem(id);
    }
    const ratedMovies = await movieService.getRatedMovies();
    this.setState({ rate: ratedMovies.results });
  }

  // изменения вкладки
  onTabsChange(active) {
    if (active === '2') {
      // вкладка "Rated"
      this.loadRatedMovies(1);
    } else if (active === '1') {
      // вкладка "Search"
      this.getDataMovies();
    }
  }

  render() {
    const {
      moviesData,
      loading,
      error,
      searchQuery,
      currentPage,
      totalResults,
      currentPageRate,
      totalResultsRate,
      genres,
      rate,
    } = this.state;
    // во время загрузки
    const spinner = loading ? <Spin /> : null;
    // после загрузки
    const content = !loading ? (
      <MovieList moviesData={moviesData} onRate={this.onRate} />
    ) : null;
    //  ошибки
    const errorIndicator = error ? <ErrorIndicator /> : null;
    //  для результатов поиска
    const paginationPanelSearch =
      !loading && !error && searchQuery ? (
        <Pagination
          current={currentPage}
          total={totalResults}
          onChange={this.onPaginationChange}
          pageSize={20}
          showSizeChanger={false}
        />
      ) : null;
    //  для оценок фильмов
    const paginationPanelRated = !error ? (
      <Pagination
        current={currentPageRate}
        total={totalResultsRate}
        onChange={this.onPaginationChangeRate}
        pageSize={20}
        showSizeChanger={false}
        hideOnSinglePage
      />
    ) : null;
    //  если результатов нет
    if (
      moviesData.length === 0 &&
      searchQuery.length !== 0 &&
      !loading &&
      !error
    ) {
      return (
        <>
          <Input
            placeholder="Type to search..."
            onChange={this.onSearchChange}
            value={searchQuery}
            autoFocus
          />
          <Alert
            message="может посмотришь АТАКУ ТИТАНОВ , то что ты ищешь не сущетсвует "
            type="error"
            showIcon
          />
        </>
      );
    }
    const items = [
      {
        key: '1',
        label: `Search`,
        children: (
          <>
            <Input
              placeholder="Type to search..."
              onChange={this.onSearchChange}
            />
            {spinner}
            {content}
            {errorIndicator}
            {paginationPanelSearch}
          </>
        ),
      },
      {
        key: '2',
        label: `Rated`,
        children: (
          <>
            {paginationPanelRated}
            <MovieList moviesData={rate || []} onRate={this.onRate} />
          </>
        ),
      },
    ];
    return (
      <div className="main">
        <Provider value={genres}>
          <Online>
            <Tabs
              defaultActiveKey="1"
              items={items}
              onChange={this.onTabsChange}
            />
          </Online>
          <Offline>
            <Alert message="зай, включи впн | hey, turn on vpn" type="error" />
          </Offline>
        </Provider>
      </div>
    );
  }
}

export default App;
