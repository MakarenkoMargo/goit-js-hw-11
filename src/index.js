import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formSearch = document.querySelector('.search-form');
const divListImg = document.querySelector('.gallery');
const guard = document.querySelector('.guard');

var lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '37003941-45b28fe6d413576d76ffd2524';

let pageToFetch = 1;
let queryToFetch = '';

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        getEvents(queryToFetch, pageToFetch);
      }
    });
  },
  { rootMargin: '200px' }
);

async function fetchEvents(q, page) {
  try {
    const { data } = await axios({
      params: {
        key: API_KEY,
        q,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
}

async function getEvents(query, page) {
  const data = await fetchEvents(query, page);

  if (data.totalHits === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  } else {
    renderEvents(data.hits);
    if (page === 1) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }
    if (data.totalHits <= 40 * page) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  }
  pageToFetch += 1;
  smoothScrolling();
  observer.observe(guard);
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
  lightbox.refresh();
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
  observer.unobserve(guard);
  getEvents(queryToFetch, pageToFetch);
  // formSearch.reset();
}

function smoothScrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
