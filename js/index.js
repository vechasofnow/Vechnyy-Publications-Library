// =====================
// DOM CACHE
// =====================
const resultsDiv   = document.getElementById("results");
const filterType   = document.getElementById("filter-type");
const filterYear   = document.getElementById("filter-year");
const filterAuthor = document.getElementById("filter-author");
const mainSearch   = document.getElementById("mainSearch");

// =====================
// STATE
// =====================
let allPublications = [];

// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const resp = await fetch("data/publications.json");
    const data = await resp.json();

    allPublications = data.map(parseMIC);
    
    let filteredPublications = [];
    
    filteredPublications = applyURLParamsAndCheckIndex()
    if (!filteredPublications) filteredPublications = applyFilters();
    renderResults(filteredPublications);

    // Event listeners
    if (mainSearch) {
      filterType.addEventListener("change", applyFilters);
      filterYear.addEventListener("input", applyFilters);
      filterAuthor.addEventListener("input", applyFilters);
      mainSearch.addEventListener("input", applyFilters);
    }

  } catch (err) {
    console.error("Error loading publications:", err);
    resultsDiv.textContent = "Error loading publications.";
  }
}

// =====================
// DATA NORMALIZATION
// =====================
function parseMIC(pub) {
  const parts = String(pub.mic || "").split(".");
  if (parts.length < 8) return pub;

  const [
    year, m1, d1,
    lastYear, m2, d2,
    type, author
  ] = parts;

  const TYPE_MAP = {
    DG: "Digital",
    PB: "PaperBack",
    MI: "Mindful Intent",
    AD: "Audio",
    AV: "AudioVisual"
  };

  return {
    ...pub,
    year: Number(year),
    monthDate: `${m1}.${d1}`,
    lastChangedYear: Number(lastYear),
    lastChangedMonthDate: `${m2}.${d2}`,
    type,
    fulltype: TYPE_MAP[type] ?? type,
    author,
    index: splitAndDeduplicate([pub.index ?? ""])
  };
}

// =====================
// FILTERING
// =====================
function applyFilters() {
  const type   = filterType.value;
  const year   = filterYear.valueAsNumber;
  const author = filterAuthor.value.trim().toLowerCase();
  const search = mainSearch.value.trim().toLowerCase();

  const filtered = allPublications.filter(pub =>
    (!type || pub.type === type) &&
    (!year || pub.year <= year || pub.lastChangedYear <= year) &&
    (!author || pub.author.toLowerCase().includes(author)) &&
    (!search || [pub.title, pub.author, pub.mic, pub.description]
      .some(v => String(v).toLowerCase().includes(search)))
  );
  renderResults(filtered);
  return filtered;
}

// =====================
// URL PARAMS
// =====================
function applyURLParamsAndCheckIndex() {
  const type   = getQueryParam("type");
  const index  = getQueryParam("index");
  const search = getQueryParam("search");

  if (type)   filterType.value = type;
  if (search) mainSearch.value = search;

  if (index) {
    filteredPublications = allPublications.filter(pub =>
      Array.isArray(pub.index) && pub.index.includes(index)
    );
    return filteredPublications
  }
  return null
}

function getQueryParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

// =====================
// RENDERING
// =====================
function renderResults(list) {
  resultsDiv.innerHTML = "";

  if (!list.length) {
    resultsDiv.textContent = "No matching publications found.";
    return;
  }

  const fragment = document.createDocumentFragment();

  list.forEach(pub => {
    const div = document.createElement("div");
    div.className = "publication";

    div.innerHTML = `
      <h2>
        <a href="publication.html?id=${encodeURIComponent(pub.mic)}">
          ${pub.title}
        </a>
      </h2>
      <div class="meta">
        <strong>UID:</strong> ${pub.author} |
        <strong>Year:</strong> ${pub.year} |
        <strong>Type:</strong> ${pub.fulltype}
      </div>
      <p class="description">${pub.description}</p>
      <p>
        <a href="publication.html?id=${encodeURIComponent(pub.mic)}" target="_blank">
          Publication Link / More Info
        </a>
      </p>
    `;

    fragment.appendChild(div);
  });

  resultsDiv.appendChild(fragment);
}

// =====================
// UTILITIES
// =====================
function splitAndDeduplicate(arr) {
  return [...new Set(
    arr
      .flatMap(v => String(v).split(","))
      .map(v => v.trim())
      .filter(Boolean)
  )];
}

