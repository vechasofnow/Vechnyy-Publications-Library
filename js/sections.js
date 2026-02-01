document.addEventListener("DOMContentLoaded", init);

async function init() {
  const typeList = document.getElementById("type-links");
  const typeSearch = document.getElementById("mainSearch");

  if (!typeList || !typeSearch) return;

  let allTypes = [];

  try {
    const data = await fetchJSON("data/publications.json");
    allTypes = extractUniqueTypes(data);
    renderTypes(allTypes);
  } catch (err) {
    console.error("Error loading types:", err);
    typeList.innerHTML = `<li>Error loading types</li>`;
  }

  // =====================
  // HELPERS
  // =====================
  async function fetchJSON(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  }

  function extractUniqueTypes(data) {
    const raw = data
      .map(pub => pub.index || "")
      .flatMap(item => item.split(","))
      .map(item => item.trim())
     .filter(Boolean);

    return [...new Set(raw)].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }

  function renderTypes(types) {
    typeList.innerHTML = "";

    if (!types.length) {
      typeList.innerHTML = `<li>No matching types.</li>`;
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const type of types) {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.href = `indexterm.html?index=${encodeURIComponent(type)}`;
      a.textContent = type;

      li.appendChild(a);
      fragment.appendChild(li);
    }
    typeList.appendChild(fragment);
  }


  // =====================
  // SEARCH
  // =====================

  typeSearch.addEventListener("input", () => {
    const term = typeSearch.value.trim().toLowerCase();

    if (!term) {
      renderTypes(allTypes);
      return;
    }

    renderTypes(
      allTypes.filter(t => t.toLowerCase().includes(term))
    );
  });
}

