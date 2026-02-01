async function loadPartial(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = await fetch(url).then(r => r.text());
}

loadPartial("site-header", "partials/header.html");
loadPartial("site-footer", "partials/footer.html");
