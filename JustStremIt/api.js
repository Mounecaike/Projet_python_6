// api.js
const BASE_URL = "http://127.0.0.1:8000/api/v1";

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status + " " + url);
  return res.json();
}

export async function getBestMovie() {
  const data = await fetchJSON(`${BASE_URL}/titles/?sort_by=-imdb_score&page_size=1`);
  return data.results[0];
}
export async function getTopMovies(limit = 6) {
  const data = await fetchJSON(`${BASE_URL}/titles/?sort_by=-imdb_score&page_size=${limit}`);
  return data.results;
}
export async function getByGenre(genre, limit = 6) {
  const data = await fetchJSON(`${BASE_URL}/titles/?genre=${encodeURIComponent(genre)}&sort_by=-imdb_score&page_size=${limit}`);
  return data.results;
}
export async function getGenres() {
  const data = await fetchJSON(`${BASE_URL}/genres/`);
  return data.results; // [{name:"Action"}, ...]
}
export async function getMovieById(id) {
  return fetchJSON(`${BASE_URL}/titles/${id}`);
}
