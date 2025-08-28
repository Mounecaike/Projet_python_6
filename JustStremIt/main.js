document.addEventListener("DOMContentLoaded", () => {
const DEFAULT_IMAGE = "./images/Image_non_disponible.jpg";


// Récupérer plusieurs films
fetch("http://127.0.0.1:8000/api/v1/titles/?sort_by=-imdb_score&page_size=30")
  .then(res => res.json())
  .then(data => {
    let bestFilm = null;

    data.results.forEach(film => {
      const score = parseFloat(film.imdb_score) || 0;
      const votes = parseInt(film.votes) || 0;

      if (!bestFilm) {
        bestFilm = film;
      } else {
        const bestScore = parseFloat(bestFilm.imdb_score) || 0;
        const bestVotes = parseInt(bestFilm.votes) || 0;

        if (score > bestScore || (score === bestScore && votes > bestVotes)) {
          bestFilm = film;
        }
      }
    });

    // Aller chercher les détails de ce film
    return fetch(`http://127.0.0.1:8000/api/v1/titles/${bestFilm.id}`)
      .then(r => r.json());
  })
  .then(film => {
    const desc = film.long_description || film.description || "Pas de description.";
    document.getElementById("best").innerHTML = `
      <div class="card">
        <img src="${film.image_url}" alt="${film.title}" onerror="this.src='${DEFAULT_IMAGE}'" class="img-best">
        <div class="best-movie-text">
          <h3>${film.title}</h3>
          <p>${desc}</p>
          <button onclick="openModal(${film.id})">Détails</button>
        </div>
      </div>
    `;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("best").innerHTML = "<p>Impossible de charger le meilleur film.</p>";
  });


// === Top 6 films (note + votes) ===
fetch("http://127.0.0.1:8000/api/v1/titles/?sort_by=-imdb_score&page_size=200")
  .then(res => res.json())
  .then(data => {
    // On garde les 6 meilleurs
    let top = [];

    data.results.forEach(film => {
      const score = parseFloat(film.imdb_score) || 0;
      const votes = parseInt(film.votes) || 0;

      // On insère dans le tableau
      top.push(film);

      // Si plus de 6 films, on trie et on coupe
      if (top.length > 6) {
        top.sort((a, b) => {
          const sA = parseFloat(a.imdb_score) || 0;
          const sB = parseFloat(b.imdb_score) || 0;
          const vA = parseInt(a.votes) || 0;
          const vB = parseInt(b.votes) || 0;

          if (sB !== sA) return sB - sA; // score desc
          return vB - vA;                // votes desc
        });
        top = top.slice(0, 6);
      }
    });

    // Afficher les 6 films
    let html = "";
    top.forEach(f => {
      html += `
        <li class="card">
          <img src="${f.image_url}" alt="${f.title}"
               onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
          <p>${f.title}</p>
          <button onclick="openModal(${f.id})">Détails</button>
        </li>
      `;
    });
    document.getElementById("top").innerHTML = html;
  })
  .catch(err => {
    console.error("Top films error:", err);
    document.getElementById("top").innerHTML = "<p>Impossible de charger les films.</p>";
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
