function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  let publications = [];

  fetch('data/publications.json')
    .then(resp => resp.json())
    .then(data => {
      publications = data;
	console.log(publications)
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
	  console.log(pub.index)
          pub.index = splitAndDeduplicate([pub.index, ""])        })

      // Pre‑set filters from URL params
      const indexParam = getQueryParam("index");
      publications = filterPublicationsByIndexWord(publications, indexParam);
      renderResults(publications);
    })
    .catch(err => {
      console.error("Error loading publications:", err);
      resultsDiv.innerHTML = `<p>Error loading publications.</p>`;
    });




   function splitAndDeduplicate(arr) {
  	return [...new Set(
    	arr
     	 .flatMap(item => item.split(','))
      	.map(item => item.trim())
      	.filter(item => item.length > 0)
 	 )];
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



function filterPublicationsByIndexWord(publications, word) {
  Object.keys(publications).forEach(key => {
    const pub = publications[key];

    if (
      !Array.isArray(pub.index) ||
      !pub.index.includes(word)
    ) {
      delete publications[key];
    }
  });

  return publications;
}