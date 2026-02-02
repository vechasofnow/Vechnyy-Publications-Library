document.addEventListener("DOMContentLoaded", init);

const DATA_PATH = "./data/";
const MEDIA_TYPES = {
  DG: "pdf",
  PB: "pdf",
  AD: "m4a",
  AV: "mp4"
};

// =====================
// INIT
// =====================
async function init() {
  const detailDiv = document.getElementById("pub-detail");
  const pubId = getQueryParam("id");

  if (!detailDiv) return;

  if (!pubId) {
    detailDiv.textContent = "No publication selected.";
    return;
  }

  try {
    const resp = await fetch(`${DATA_PATH}publications.json`);
    if (!resp.ok) throw new Error("Failed to load publications.json");

    const data = await resp.json();
    const rawPub = data.find(p => p.mic === pubId);

    if (!rawPub) {
      detailDiv.textContent = "Publication not found.";
      return;
    }

    const pub = parseMIC(rawPub);
    const sourcePath = getSourcePath(pub);

    renderDetail(pub, sourcePath);
    try {
      await renderMedia(pub);
    } catch (err) {
      console.error(err);
      const holder = document.querySelector(".media_holder");
      holder.textContent = "This media couldn’t be loaded. Please try accessing it directly from the source.";
    }

  } catch (err) {
    console.error(err);
    detailDiv.textContent = "Error loading publication.";
  }
}

// =====================
// DATA NORMALIZATION
// =====================
function parseMIC(pub) {
  const parts = String(pub.mic).split(".");
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
    author
  };
}

// =====================
// MEDIA HANDLING
// =====================
async function renderMedia(pub) {
  const holder = document.querySelector(".media_holder");
  if (!holder) return;

  holder.innerHTML = "";

  // PDF
  if (pub.type === "DG" || pub.type === "PB") {
    await renderPDF(pub.author);
    return;
  }

  // Audio / Video
  const ext = MEDIA_TYPES[pub.type];
  if (!ext) return;

  const src = `${DATA_PATH}${pub.author}.${ext}`;
  const element = document.createElement(ext === "m4a" ? "audio" : "video");

  element.controls = true;
  element.style.width = "100%";

  const source = document.createElement("source");
  source.src = src;
  source.type = `${element.tagName.toLowerCase()}/mp4`;

  element.appendChild(source);
  holder.appendChild(element);
}

function getSourcePath(pub) {
  const ext = MEDIA_TYPES[pub.type];
  if (!ext) return "";

  return `${DATA_PATH}${pub.author}.${ext}`;
}

// =====================
// DETAIL RENDERING
// =====================
function renderDetail(pub, path) {
  document.title = pub.title;

  const detailDiv = document.getElementById("pub-detail");
  if (!detailDiv) return;

  const referSource = path
    ? `<a href="${path}" target="_blank">${path.split("/").pop()}</a>`
    : null;

   let toBeRendered = `
    <h2>${pub.title}</h2>

    <div class="meta">
      <strong>UID:</strong> ${pub.author} |
      <strong>Release Date:</strong>
      ${formatMonthDate(pub.monthDate)} ${pub.year} |
      <strong>Type:</strong> ${pub.fulltype} |
      <strong>Last Revision:</strong>
      ${formatMonthDate(pub.lastChangedMonthDate)} ${pub.lastChangedYear}
    </div>

    <div class="meta">
      <strong>Index Terms:</strong>
      ${commaStringToLinks(pub.index || "")}
    </div>

    <p class="description">${pub.description ?? ""}</p>

    <div class="content">${pub.summary ?? ""}</div>
  `;

  if (referSource) {
    toBeRendered = toBeRendered + `<p><strong>Refer Source: </strong>${referSource}</p>`;
  };
  
  detailDiv.innerHTML = toBeRendered
}

// =====================
// PDF RENDERING
// =====================
async function renderPDF(author) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdfjs/pdf.worker.mjs";

  const container = document.querySelector(".media_holder");
  if (!container) return;

  container.innerHTML = "";

  const loadingTask = pdfjsLib.getDocument(
    `${DATA_PATH}${encodeURIComponent(author)}.pdf`
  );
  const pdf = await loadingTask.promise;

  const scale = 1.3;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    // 🔹 DO NOT await here — let it run independently
    pdf.getPage(pageNum).then(page => {
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = "block";
      canvas.style.margin = "20px auto";

      container.appendChild(canvas);

      page.render({
        canvasContext: ctx,
        viewport
      });
    });
  }
}

// =====================
// UTILITIES
// =====================
function getQueryParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

function commaStringToLinks(input) {
  return String(input)
    .split(",")
    .map(v => v.trim())
    .filter(Boolean)
    .map(v =>
      `<a class="indexlink" href="indexterm.html?index=${encodeURIComponent(v)}">${v}</a>`
    )
    .join(", ");
}

function formatMonthDate(md) {
  if (!md) return "—";

  const [m, d] = md.split(".").map(Number);
  if (!m || !d || m < 1 || m > 12 || d < 1 || d > 31) return "Invalid date";

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return `${d}${getDaySuffix(d)} ${months[m - 1]}`;
}

function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return "th";
  return ["th", "st", "nd", "rd"][day % 10] || "th";
}



