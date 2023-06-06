import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '37003941-45b28fe6d413576d76ffd2524';

export async function fetchEvents(q, page) {
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
