import axios from 'axios';
import Notiflix from 'notiflix';

const formSearch = document.querySelector('.search-form');
const btnSearch = document.querySelector('button[type="submit"]');
const divListImg = document.querySelector('.gallery');
const btnImgload = document.querySelector('.load-more');

let pageToFetch = 1;
let queryToFetch = '';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '37003941-45b28fe6d413576d76ffd2524';

btnImgload.style.display = 'none';

function fetchEvents(q, page) {
  const params = new URLSearchParams({
    key: API_KEY,
    q,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: 40,
    page,
  });
  return fetch(`${BASE_URL}?${params}`)
    .then(response => {
      // console.log(response);
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    })
    .catch(error => console.log(error));
}

function getEvents(query, page) {
  fetchEvents(query, page).then(data => {
    if (data.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      btnImgload.style.display = 'none';
      return;
    } else {
      renderEvents(data.hits);
      if (data.totalHits > 40) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      } else {
        if (data.totalHits <= 40) {
          btnImgload.style.display = 'none';
          Notiflix.Notify.failure(
            "We're sorry, but you've reached the end of search results."
          );
        } else {
          btnImgload.style.display = 'block';
        }
      }
    }

    const images = data.hits;
    console.log(images);
    renderEvents(images);
  });
}

function renderEvents(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
        <div class="photo-card">
        <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" width="450" />
        </a>
        <div class="info">
            <p class="info-item">
            <b>Likes</b>
            ${likes}
            </p>
            <p class="info-item">
            <b>Views</b>
            ${views}
            </p>
            <p class="info-item">
            <b>Comments</b>
            ${comments}
            </p>
            <p class="info-item">
            <b>Downloads</b>
            ${downloads}
            </p>
        </div>
        </div>
`;
      }
    )
    .join('');
  divListImg.insertAdjacentHTML('beforeend', markup);
}

formSearch.addEventListener('submit', handleSubmit);

function handleSubmit(e) {
  e.preventDefault();
  const inputValue = e.target.elements.searchQuery.value;
  if (!inputValue.trim() || inputValue === queryToFetch) {
    return;
  }

  queryToFetch = inputValue;
  pageToFetch = 1;
  divListImg.innerHTML = '';
  btnImgload.style.display = 'none';
  getEvents(queryToFetch, pageToFetch);
}

btnImgload.addEventListener('click', handleLoad);

function handleLoad() {
  btnImgload.style.display = 'none';
  pageToFetch += 1;
  getEvents(queryToFetch, pageToFetch);
}
