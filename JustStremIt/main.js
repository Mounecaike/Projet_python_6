document.addEventListener("DOMContentLoaded", () => {
  // Meilleur film
  fetch("http://127.0.0.1:8000/api/v1/titles/?sort_by=-imdb_score&page_size=1")
    .then(res => res.json())
    .then(data => {
      const film = data.results[0];
      document.getElementById("best").innerHTML = `
        <h3>${film.title}</h3>
        <img src="${film.image_url}" alt="${film.title}">
        <button onclick="openModal(${film.id})">Détails</button>
      `;
    });

  // Top films
  fetch("http://127.0.0.1:8000/api/v1/titles/?sort_by=-imdb_score&page_size=6")
    .then(res => res.json())
    .then(data => {
      let html = "";
      data.results.forEach(f => {
        html += `
          <li>
            <img src="${f.image_url}" alt="${f.title}">
            <p>${f.title}</p>
            <button onclick="openModal(${f.id})">Détails</button>
          </li>
        `;
      });
      document.getElementById("top").innerHTML = html;
    });

  // Catégorie 1
  fetch("http://127.0.0.1:8000/api/v1/titles/?genre=Mystery&sort_by=-imdb_score&page_size=6")
    .then(res => res.json())
    .then(data => {
      let html = "";
      data.results.forEach(f => {
        html += `
          <li>
            <img src="${f.image_url}" alt="${f.title}">
            <p>${f.title}</p>
            <button onclick="openModal(${f.id})">Détails</button>
          </li>
        `;
      });
      document.getElementById("cat1").innerHTML = html;
    });

  // Catégorie 2
  fetch("http://127.0.0.1:8000/api/v1/titles/?genre=Sci-Fi&sort_by=-imdb_score&page_size=6")
    .then(res => res.json())
    .then(data => {
      let html = "";
      data.results.forEach(f => {
        html += `
          <li>
            <img src="${f.image_url}" alt="${f.title}">
            <p>${f.title}</p>
            <button onclick="openModal(${f.id})">Détails</button>
          </li>
        `;
      });
      document.getElementById("cat2").innerHTML = html;
    });

  // Genres
  fetch("http://127.0.0.1:8000/api/v1/genres/")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("genres");
      data.results.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g.name;
        opt.textContent = g.name;
        select.appendChild(opt);
      });

      select.addEventListener("change", () => {
        fetch(`http://127.0.0.1:8000/api/v1/titles/?genre=${select.value}&sort_by=-imdb_score&page_size=6`)
          .then(res => res.json())
          .then(data => {
            let html = "";
            data.results.forEach(f => {
              html += `
                <li>
                  <img src="${f.image_url}" alt="${f.title}">
                  <p>${f.title}</p>
                  <button onclick="openModal(${f.id})">Détails</button>
                </li>
              `;
            });
            document.getElementById("others").innerHTML = html;
          });
      });
    });
});

// ----------- MODALE -----------

const modal = document.getElementById("movie-modal");
const modalContent = document.getElementById("modal-content");
const closeBtn = document.getElementById("close-modal");

function openModal(id) {
  fetch(`http://127.0.0.1:8000/api/v1/titles/${id}`)
    .then(res => res.json())
    .then(movie => {
      modalContent.innerHTML = `
        <h2>${movie.title} (${movie.year})</h2>
        <img src="${movie.image_url}" alt="${movie.title}">
        <p><strong>Genres :</strong> ${movie.genres.join(", ")}</p>
        <p><strong>Réalisateur :</strong> ${movie.directors.join(", ")}</p>
        <p><strong>Acteurs :</strong> ${movie.actors.slice(0, 5).join(", ")}</p>
        <p><strong>Score IMDB :</strong> ${movie.imdb_score}</p>
        <p>${movie.description || ""}</p>
      `;
      modal.showModal();
    });
}

closeBtn.addEventListener("click", () => modal.close());
