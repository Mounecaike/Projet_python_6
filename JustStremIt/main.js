// main.js
document.addEventListener("DOMContentLoaded", () => {
  const DEFAULT_IMAGE = "./images/Image_non_disponible.jpg";
  const BASE_URL = "http://127.0.0.1:8000/api/v1";

  // -------- Helpers UI --------
  function movieCardTemplate(film) {
    // fabrique une carte carrée avec bandeau, titre + bouton modal
    return `
      <li class="movie-card">
        <img src="${film.image_url}" alt="${escapeHtml(film.title)}"
             onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
        <div class="band">
          <span class="title" title="${escapeHtml(film.title)}">${escapeHtml(film.title)}</span>
          <button onclick="openModal(${film.id})" aria-label="Ouvrir la fiche de ${escapeHtml(film.title)}">Détails</button>
        </div>
      </li>
    `;
  }

  function renderList(targetId, films) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.innerHTML = films.map(movieCardTemplate).join("");
  }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  }

  // -------- Meilleur film --------
  fetch(`${BASE_URL}/titles/?sort_by=-imdb_score&page_size=30`)
    .then(res => res.json())
    .then(data => {
      // sélectionne le meilleur par score puis votes
      let bestFilm = null;
      data.results.forEach(film => {
        const score = parseFloat(film.imdb_score) || 0;
        const votes = parseInt(film.votes) || 0;
        if (!bestFilm) bestFilm = film;
        else {
          const bestScore = parseFloat(bestFilm.imdb_score) || 0;
          const bestVotes = parseInt(bestFilm.votes) || 0;
          if (score > bestScore || (score === bestScore && votes > bestVotes)) {
            bestFilm = film;
          }
        }
      });
      return fetch(`${BASE_URL}/titles/${bestFilm.id}`).then(r => r.json());
    })
    .then(film => {
      const desc = film.long_description || film.description || "Pas de description.";
      document.getElementById("best").innerHTML = `
        <div class="card">
          <img src="${film.image_url}" alt="${escapeHtml(film.title)}"
               onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'" class="img-best">
          <div class="best-movie-text">
            <h3>${escapeHtml(film.title)}</h3>
            <p>${escapeHtml(desc)}</p>
            <button onclick="openModal(${film.id})">Détails</button>
          </div>
        </div>
      `;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("best").innerHTML = "<p>Impossible de charger le meilleur film.</p>";
    });

  // -------- Top 6 --------
  fetch(`${BASE_URL}/titles/?sort_by=-imdb_score&page_size=200`)
    .then(res => res.json())
    .then(data => {
      // trie score desc puis votes desc, garde 6
      const sorted = [...data.results].sort((a, b) => {
        const sA = parseFloat(a.imdb_score) || 0;
        const sB = parseFloat(b.imdb_score) || 0;
        const vA = parseInt(a.votes) || 0;
        const vB = parseInt(b.votes) || 0;
        if (sB !== sA) return sB - sA;
        return vB - vA;
      });
      renderList("top", sorted.slice(0, 6));
    })
    .catch(err => {
      console.error("Top films error:", err);
      document.getElementById("top").innerHTML = "<p>Impossible de charger les films.</p>";
    });

  // -------- Catégorie 1 (Mystery) --------
  fetch(`${BASE_URL}/titles/?genre=${encodeURIComponent("Mystery")}&sort_by=-imdb_score&page_size=6`)
    .then(res => res.json())
    .then(data => renderList("cat1", data.results))
    .catch(() => (document.getElementById("cat1").innerHTML = "<p>Erreur de chargement.</p>"));

  // -------- Catégorie 2 (Sci-Fi) --------
  fetch(`${BASE_URL}/titles/?genre=${encodeURIComponent("Sci-Fi")}&sort_by=-imdb_score&page_size=6`)
    .then(res => res.json())
    .then(data => renderList("cat2", data.results))
    .catch(() => (document.getElementById("cat2").innerHTML = "<p>Erreur de chargement.</p>"));

  // -------- Genres dynamiques (select + liste) --------
  fetch(`${BASE_URL}/genres/`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("genres");
      if (!select) return;
      data.results.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g.name;
        opt.textContent = g.name;
        select.appendChild(opt);
      });

      // charge un genre par défaut si dispo
      if (data.results?.[0]?.name) {
        select.value = data.results[0].name;
        loadGenre(select.value);
      }

      select.addEventListener("change", () => loadGenre(select.value));
    })
    .catch(err => console.error("Genres error:", err));

  function loadGenre(genreName) {
    fetch(`${BASE_URL}/titles/?genre=${encodeURIComponent(genreName)}&sort_by=-imdb_score&page_size=6`)
      .then(res => res.json())
      .then(data => renderList("others", data.results))
      .catch(() => (document.getElementById("others").innerHTML = "<p>Erreur de chargement.</p>"));
  }
});

// ----------- MODALE -----------
const modal = document.getElementById("movie-modal");
const modalContent = document.getElementById("modal-content");
const closeBtn = document.getElementById("close-modal");

const DEFAULT_IMAGE = "./images/Image_non_disponible.jpg";
const BASE_URL = "http://127.0.0.1:8000/api/v1";

function safeJoin(arr, sep = ", ") {
  return Array.isArray(arr) ? arr.filter(Boolean).join(sep) : "";
}

function openModal(id) {
  fetch(`${BASE_URL}/titles/${id}`)
    .then(res => res.json())
    .then(m => {
      const genres = safeJoin(m.genres);
      const directors = safeJoin(m.directors);
      const cast = safeJoin((m.actors || []).slice(0, 20)); // on limite un peu
      const countries = safeJoin(m.countries || m.country || []);
      const rated = m.rated || (m.mpaa || "").toUpperCase() || "NR";
      const durationMin = m.duration ? `${m.duration} minutes` : "";
      const metaLine = [
        m.year,
        genres,
        `${rated} - ${durationMin}`.trim(),
        countries ? `(${countries})` : ""
      ].filter(Boolean).join(" • ");

      const score = m.imdb_score ? `IMDB score: ${m.imdb_score}/10` : "";
      const boxOffice = m.worldwide_gross_income
        ? `Recettes au box-office: ${m.worldwide_gross_income}`
        : "";

      const desc = m.long_description || m.description || "Pas de description.";

      modalContent.innerHTML = `
        <div class="modal-card">
          <div class="modal-head">
            <div class="modal-titlebloc">
              <h2 class="modal-title">${m.title}</h2>
              <ul class="modal-meta">
                ${metaLine ? `<li>${metaLine}</li>` : ""}
                ${score ? `<li>${score}</li>` : ""}
                ${boxOffice ? `<li>${boxOffice}</li>` : ""}
              </ul>
            </div>
            <div class="modal-poster">
              <img src="${m.image_url}" alt="${m.title}"
                   onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
            </div>
          </div>

          <div class="modal-section">
            <p class="modal-label">Réalisé par&nbsp;:</p>
            <p class="modal-text">${directors || "—"}</p>
          </div>

          <div class="modal-section">
            <p class="modal-desc">${desc}</p>
          </div>

          <div class="modal-section">
            <p class="modal-label">Avec&nbsp;:</p>
            <p class="modal-cast">${cast || "—"}</p>
          </div>
        </div>
      `;

      // place le bouton "Fermer" en bas de la carte (fin du dialog)
      modal.appendChild(closeBtn);

      modal.showModal();
    });
}

// styles focus + fermeture
closeBtn.addEventListener("click", () => modal.close());
