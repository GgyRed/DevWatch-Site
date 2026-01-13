async function loadArticles() {
  const container = document.getElementById("articles-list");
  if (!container) return;

  const response = await fetch("content/articles/");
  const text = await response.text();

  // Extract markdown file links from directory listing
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/html");
  const links = [...doc.querySelectorAll("a")]
    .map(a => a.getAttribute("href"))
    .filter(href => href.endsWith(".md"));

  for (const file of links.reverse()) {
    const articleRes = await fetch(`content/articles/${file}`);
    const articleText = await articleRes.text();

    const { title, summary, date } = parseFrontMatter(articleText);

    const articleEl = document.createElement("article");
    articleEl.innerHTML = `
      <span class="text-xs uppercase tracking-wide text-muted">
        Analysis
      </span>
      <h2 class="text-2xl font-serif mt-2 mb-3">
        <a href="article-single.html?file=${encodeURIComponent(file)}"> class="hover:text-primary">
          ${title}
        </a>
      </h2>
      <p class="text-muted mb-3">${summary}</p>
      <p class="text-sm text-muted">${date}</p>
    `;

    container.appendChild(articleEl);
  }
}

function parseFrontMatter(text) {
  const match = text.match(/---([\s\S]*?)---/);
  if (!match) return {};

  const lines = match[1].split("\n");
  const data = {};

  lines.forEach(line => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      data[key.trim()] = rest.join(":").trim();
    }
  });

  return {
    title: data.title || "Untitled",
    summary: data.summary || "",
    date: data.date ? new Date(data.date).toDateString() : ""
  };
}

loadArticles();
