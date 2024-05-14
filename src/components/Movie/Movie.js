import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Movie.css';
import { format } from 'date-fns';
import { Progress, Rate } from 'antd';
import { Consumer } from '../Context/Context';
import movieService from '../services/services';

class Movie extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: 0, // Изначальная оценка
    };
  }

  componentDidMount() {
    // Загрузка оценки фильма
    const { idForRate } = this.props;
    const rating = movieService.getLocalRating(idForRate);
    this.setState({ rating });
  }

  componentDidUpdate(prevProps) {
    // при изменении id
    if (prevProps.idForRate !== this.props.idForRate) {
      const { idForRate } = this.props;
      const rating = movieService.getLocalRating(idForRate);
      this.setState({ rating });
    }
  }

  // сокращение текста
  cutText = (str) => {
    const truncatedText = str.replace(/^(.{0,90}\S*).*$/, '$1');
    return `${truncatedText}...`;
  };

  // цвета оценки
  ratingColor = (n) => {
    switch (true) {
      case n >= 0 && n <= 3:
        return '#E90000';
      case n > 3 && n <= 5:
        return '#E97E00';
      case n > 5 && n <= 7:
        return '#E9D100';
      default:
        return '#66E900';
    }
  };

  render() {
    const { rating } = this.state;
    const { img, title, overview, date, genreId, vote, idForRate, onRate } =
      this.props;
    return (
      <Consumer>
        {(genres) => (
          <li className="wrapper">
            <section className="visual">
              <img
                src={
                  img
                    ? `https://image.tmdb.org/t/p/w500${img}`
                    : '/errorImg.jpg'
                }
                alt={title}
                height="280px"
                width="180px"
              />
            </section>
            <section className="content">
              <Progress
                type="circle"
                percent={vote * 10}
                format={(percent) => (percent / 10).toFixed(1)}
                strokeColor={this.ratingColor(vote)}
                className="movie-info__rate"
              />
              <div className="box">
                {/* Название  */}
                <h1 className="box__title">{title}</h1>
                {/* Дата выхода  */}
                <p className="box__date">
                  {date ? format(new Date(date), 'MMM dd, yyyy') : 'No data'}
                </p>
                {/* Жанры  */}
                {genres.map((el) => {
                  if (genreId.includes(el.id)) {
                    return (
                      <p className="box__genre" key={el.id}>
                        {el.name}
                      </p>
                    );
                  }
                  return null;
                })}
                {/* Описание */}
                <p className="box__text">{this.cutText(overview)}</p>
              </div>
              <div className="box__star">
                {/* рейтинг */}
                <Rate
                  allowHalf
                  count={10}
                  value={rating}
                  onChange={(star) => {
                    onRate(idForRate, star);
                    this.setState({ rating: star });
                  }}
                />
              </div>
            </section>
          </li>
        )}
      </Consumer>
    );
  }
}

// входные данные
Movie.propTypes = {
  img: PropTypes.string,
  title: PropTypes.string.isRequired,
  overview: PropTypes.string.isRequired,
  date: PropTypes.string,
  genreId: PropTypes.arrayOf(PropTypes.number).isRequired,
  vote: PropTypes.number.isRequired,
  idForRate: PropTypes.number.isRequired,
  onRate: PropTypes.func.isRequired,
};
// по умолчанию
Movie.defaultProps = {
  img: '',
  date: '',
};

export default Movie;
