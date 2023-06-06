import './css/styles.css';
import { fetchEvents } from './image-service-API';
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

let pageToFetch = 1;
let queryToFetch = '';
let isLoading = false;

const observer = new IntersectionObserver(
  async entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isLoading) {
        getEvents(queryToFetch, pageToFetch);
      }
    });
  },
  { rootMargin: '200px' }
);

async function getEvents(query, page) {
  isLoading = true;

  const data = await fetchEvents(query, page);

  if (data.totalHits === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    isLoading = false;
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
      observer.unobserve(guard);
    } else {
      observer.observe(guard);
    }
  }
  pageToFetch += 1;
  smoothScrolling();
  isLoading = false;
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
