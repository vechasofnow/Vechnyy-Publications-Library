<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sections — Vechnyy Publications Library</title>
  <link rel="stylesheet" href="style.css" />
  <script src="js/checklogin.js"></script>
</head>
<body>
  <header id="site-header"></header>
  <nav>
    <ul class="mini-nav">
      <li><a href="index.html">All Publications</a></li>
      <li><a href="section.html">Index</a></li>
      <li><a href="https://vechasofnow.github.io/-/">Info</a></li>
    </ul>
  </nav>
  <section class="filters">
    <div class="index-search‑bar">
      <input type="text" id="mainSearch" placeholder="Search Index Terms" />
    </div>
  </section>
  <main>
    <section id="types-list">
      <h3>Index Terms</h3>
      <ul id="type-links">
        <!-- filtered type links appear here -->
      </ul>
    </section>
  </main>
  <footer id="site-footer"></footer>
  <script src="js/sections.js"></script>
  <script src="js/loadpartials.js"></script>
</body>
</html>
