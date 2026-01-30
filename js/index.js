function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  const filterType = document.getElementById("filter-type");
  const filterYear = document.getElementById("filter-year");
  const filterAuthor = document.getElementById("filter-author");
  const mainSearch = document.getElementById("mainSearch");

  let publications = [];

  fetch('data/publications.json')
    .then(resp => resp.json())
    .then(data => {
      publications = data;

      publications.forEach(pub => {
          const input = pub.mic;
          const parts = input.split('.');
          pub.year = parseInt(parts[0], 10)
          pub.monthDate = parts[1] + '.' + parts[2]
          pub.lastChangedYear = parseInt(parts[3], 10)
          pub.lastChangedMonthDate = parts[4] + '.' + parts[5]
          pub.type = parts[6]
          if (parts[6] == "DG") {
            pub.fulltype = "Digital"
          } if (parts[6] == "PB") {
            pub.fulltype = "PaperBack"
          } if (parts[6] == "MI") {
            pub.fulltype = "Mindful Intent"
          }
          pub.author = parts[7]    
          console.log(pub)  
        })
      console.log(publications)
      // Pre‑set filters from URL params
      const typeParam = getQueryParam("type");
      if (typeParam) filterType.value = typeParam;

      const searchParam = getQueryParam("search");
      if (searchParam) {
        mainSearch.value = searchParam;
      }

      renderResults(publications);
      applyFilters();
    })
    .catch(err => {
      console.error("Error loading publications:", err);
      resultsDiv.innerHTML = `<p>Error loading publications.</p>`;
    });

  filterType.addEventListener("change", applyFilters);
  filterYear.addEventListener("input", applyFilters);
  filterAuthor.addEventListener("input", applyFilters);
  mainSearch.addEventListener("input", applyFilters);

  function applyFilters() {
    const t = filterType.value;
    const y = filterYear.valueAsNumber;
    const a = filterAuthor.value.trim().toLowerCase();
    const s = mainSearch.value.trim().toLowerCase();

    const filtered = publications.filter(pub => {

      let ok = true;
      if (t) ok = ok && (pub.type === t);
      if (!isNaN(y) && y) ok = ok && (pub.year <= y || pub.lastChangedYear <=y);
      if (a) ok = ok && (pub.author.toLowerCase().includes(a));
      if (s) {
        ok = ok && (
          pub.title.toLowerCase().includes(s) ||
          pub.author.toLowerCase().includes(s) || 
          pub.mic.toLowerCase().includes(s)
        );
      }
      return ok;
    });

    renderResults(filtered);
  }

  function renderResults(list) {
    if (list.length === 0) {
      resultsDiv.innerHTML = `<p>No matching publications found.</p>`;
      return;
    }
    resultsDiv.innerHTML = "";
    list.forEach(pub => {
      const div = document.createElement("div");
      div.classList.add("publication");
      div.innerHTML = `
        <h2><a href="publication.html?id=${pub.mic}">${pub.title}</a></h2>
        <div class="meta">
          <strong>UID:</strong> ${pub.author} |
          <strong>Year:</strong> ${pub.year} |
          <strong>Type:</strong> ${pub.fulltype}
        </div>
        <p class="description">${pub.description}</p>
        <p><a href="publication.html?id=${pub.mic}" target="_blank">Publication Link / More Info</a></p>
      `;
      resultsDiv.appendChild(div);
    });
  }
});