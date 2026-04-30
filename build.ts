import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

// Configuration
const config = {
  title: "@derekhans",
  description: "Scratchpad of a Digital Technologist",
  author: "Derek Hanson",
  baseurl: "",
  siteUrl: "https://derekhans.com",
  postsPerPage: 5,
  copyrightYear: "2025",
};

// Ensure _site directory exists
const siteDir = "_site";
const assetsDir = path.join(siteDir, "assets", "css");

if (fs.existsSync(siteDir)) {
  fs.rmSync(siteDir, { recursive: true });
}
fs.mkdirSync(assetsDir, { recursive: true });

// Copy CSS
fs.copyFileSync("assets/css/style.css", path.join(assetsDir, "style.css"));

// Copy images (recursive)
const imagesDir = path.join(siteDir, "assets", "images");
fs.mkdirSync(imagesDir, { recursive: true });

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirRecursive("assets/images", imagesDir);

// Project data
const projects = [
  {
    title: "Nuduo",
    subtitle: "Experts for Everyone: A new technology consultancy",
    image: "/assets/images/projects/nuduo.jpg",
    url: "https://www.nuduo.com",
  },
  {
    title: "r/PowerShell Subreddit",
    subtitle: "The largest independent PowerShell community in the world",
    image: "/assets/images/projects/powershell.jpg",
    url: "https://www.reddit.com/r/PowerShell",
  },
  {
    title: "OttoID",
    subtitle: "World's first AI-powered identity and access management",
    image: "/assets/images/projects/ottoid.jpg",
    url: "https://ottoid.co",
  },
];

// Social icons SVG
const socialIcons = {
  github: `<svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  reddit: `<svg viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>`,
  rss: `<svg viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 110 4.36 2.18 2.18 0 010-4.36zM4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44zm0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93v-2.83z"/></svg>`,
};

// Post interface
interface Post {
  title: string;
  date: Date;
  tags: string[];
  content: string;
  excerpt: string;
  url: string;
  slug: string;
}

// Read and parse posts
const posts: Post[] = [];
const postsDir = "_posts";

if (fs.existsSync(postsDir)) {
  const postFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  for (const file of postFiles) {
    const content = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const { data, content: markdown } = matter(content);

    const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (!match) continue;

    const [, dateStr, slug] = match;
    const date = new Date(dateStr);

    const htmlContent = marked(markdown) as string;
    const excerpt = htmlContent
      .split("</p>")[0]
      ?.replace(/<[^>]*>/g, "")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">") || "";

    posts.push({
      title: data.title || slug,
      date,
      tags: data.tags || [],
      content: htmlContent,
      excerpt,
      url: `/${slug}/`,
      slug,
    });
  }
}

// Sort posts by date (newest first)
posts.sort((a, b) => b.date.getTime() - a.date.getTime());

// Collect all tags and years
const tagCounts: Record<string, number> = {};
const yearCounts: Record<number, number> = {};

for (const post of posts) {
  for (const tag of post.tags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }
  const year = post.date.getFullYear();
  yearCounts[year] = (yearCounts[year] || 0) + 1;
}

const allTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
const allYears = Object.keys(yearCounts).map(Number).sort((a, b) => b - a);

// Generate sidebar HTML
function generateSidebar(currentPath: string = "/"): string {
  const postLinks = posts
    .slice(0, 8)
    .map(
      (p) =>
        `<li class="posts-menu__item"><a href="${p.url}" class="posts-menu__link">${p.title}</a></li>`
    )
    .join("\n");

  return `
    <button class="menu-toggle" onclick="toggleSidebar()">
      <span></span>
    </button>
    <div class="overlay" onclick="toggleSidebar()"></div>

    <aside class="sidebar">
      <h1 class="sidebar__title"><a href="/">${config.title}</a></h1>
      <p class="sidebar__tagline">${config.description}</p>

      <nav class="nav">
        <ul class="nav__list">
          <li class="nav__item">
            <a href="/projects/" class="nav__link ${currentPath === "/projects/" ? "active" : ""}">Projects</a>
          </li>
          <li class="nav__item">
            <a href="/" class="nav__link ${currentPath === "/" || currentPath.startsWith("/page/") ? "active" : ""}">Blog</a>
          </li>
          <li class="nav__item">
            <a href="/about/" class="nav__link ${currentPath === "/about/" ? "active" : ""}">About</a>
          </li>
          <li class="nav__item">
            <a href="/contact/" class="nav__link ${currentPath === "/contact/" ? "active" : ""}">Contact</a>
          </li>
        </ul>
      </nav>

      <div class="posts-menu">
        <h3 class="posts-menu__title">Recent Posts</h3>
        <ul class="posts-menu__list">
          ${postLinks}
        </ul>
      </div>

      <ul class="socials">
        <li><a href="https://www.github.com/derekhans" class="socials__link" title="GitHub">${socialIcons.github}</a></li>
        <li><a href="https://www.reddit.com/u/derekhans" class="socials__link" title="Reddit">${socialIcons.reddit}</a></li>
        <li><a href="/feed.xml" class="socials__link" title="RSS Feed">${socialIcons.rss}</a></li>
      </ul>

      <div class="sidebar__footer">
        <span>&copy; ${config.copyrightYear} ${config.author}</span>
      </div>
    </aside>
  `;
}

// Generate search script
function generateSearchScript(): string {
  const searchData = posts.map(p => ({
    title: p.title,
    excerpt: p.excerpt.substring(0, 200),
    url: p.url,
    tags: p.tags,
    date: formatDate(p.date, "%B %d, %Y"),
    year: p.date.getFullYear()
  }));

  return `
  <script>
    const posts = ${JSON.stringify(searchData)};

    function initSearch() {
      const searchInput = document.getElementById('search-input');
      const yearFilter = document.getElementById('year-filter');
      const tagFilter = document.getElementById('tag-filter');
      const clearBtn = document.getElementById('clear-filters');
      const postList = document.getElementById('post-list');
      const resultsInfo = document.getElementById('results-info');
      const pagination = document.getElementById('pagination');

      if (!searchInput) return;

      function filterPosts() {
        const query = searchInput.value.toLowerCase();
        const selectedYear = yearFilter ? yearFilter.value : '';
        const selectedTag = tagFilter ? tagFilter.value : '';

        let filtered = posts;

        if (query) {
          filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.excerpt.toLowerCase().includes(query) ||
            p.tags.some(t => t.toLowerCase().includes(query))
          );
        }

        if (selectedYear) {
          filtered = filtered.filter(p => p.year === parseInt(selectedYear));
        }

        if (selectedTag) {
          filtered = filtered.filter(p => p.tags.includes(selectedTag));
        }

        renderPosts(filtered, query || selectedYear || selectedTag);
      }

      function renderPosts(filteredPosts, hasFilter) {
        if (hasFilter) {
          resultsInfo.textContent = filteredPosts.length + ' post' + (filteredPosts.length !== 1 ? 's' : '') + ' found';
          resultsInfo.classList.add('visible');
          if (pagination) pagination.style.display = 'none';
        } else {
          resultsInfo.classList.remove('visible');
          if (pagination) pagination.style.display = 'flex';
        }

        if (filteredPosts.length === 0) {
          postList.innerHTML = '<div class="no-results"><div class="no-results__icon">🔍</div><p class="no-results__text">No posts found matching your criteria.</p></div>';
          return;
        }

        postList.innerHTML = filteredPosts.map(post => \`
          <li class="post-list__item">
            <div class="post-list__date">\${post.date}</div>
            <h2 class="post-list__title"><a href="\${post.url}">\${post.title}</a></h2>
            \${post.tags.length ? '<div class="post-list__tags">' + post.tags.map(t => '<span class="tag">' + t + '</span>').join('') + '</div>' : ''}
          </li>
        \`).join('');
      }

      searchInput.addEventListener('input', filterPosts);
      if (yearFilter) yearFilter.addEventListener('change', filterPosts);
      if (tagFilter) tagFilter.addEventListener('change', filterPosts);
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          searchInput.value = '';
          if (yearFilter) yearFilter.value = '';
          if (tagFilter) tagFilter.value = '';
          filterPosts();
        });
      }
    }

    document.addEventListener('DOMContentLoaded', initSearch);
  </script>
  `;
}

// Generate base HTML
function generateHTML(
  content: string,
  title: string,
  currentPath: string = "/",
  includeSearch: boolean = false,
  ogImage: string = "/assets/images/og-default.jpg",
  description: string = config.description
): string {
  const fullTitle = title !== config.title ? `${title} — ${config.title}` : config.title;
  const canonicalUrl = `${config.siteUrl}${currentPath}`;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${config.siteUrl}${ogImage}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${description}">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="apple-touch-icon" href="/assets/favicon.svg">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:site_name" content="${config.title}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${fullTitle}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}">

  <link rel="alternate" type="application/rss+xml" title="${config.title} RSS Feed" href="/feed.xml">
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
</head>
<body>
  <div class="layout">
    ${generateSidebar(currentPath)}

    <main class="main">
      ${content}
    </main>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>
    hljs.highlightAll();

    function toggleSidebar() {
      document.querySelector('.sidebar').classList.toggle('open');
      document.querySelector('.overlay').classList.toggle('active');
    }
  </script>
  ${includeSearch ? generateSearchScript() : ''}
</body>
</html>`;
}

function formatDate(date: Date, format: string): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  if (format === "%B %d, %Y") {
    return `${months[m]} ${d.toString().padStart(2, "0")}, ${y}`;
  }
  if (format === "%Y.%m.%d") {
    return `${y}.${(m + 1).toString().padStart(2, "0")}.${d.toString().padStart(2, "0")}`;
  }
  return date.toLocaleDateString();
}

// Generate pagination HTML
function generatePagination(currentPage: number, totalPages: number): string {
  if (totalPages <= 1) return '';

  let html = '<nav class="pagination" id="pagination">';

  // Previous
  if (currentPage > 1) {
    const prevUrl = currentPage === 2 ? '/' : `/page/${currentPage - 1}/`;
    html += `<a href="${prevUrl}" class="pagination__link">← Prev</a>`;
  } else {
    html += `<span class="pagination__link disabled">← Prev</span>`;
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      const url = i === 1 ? '/' : `/page/${i}/`;
      html += `<a href="${url}" class="pagination__link ${i === currentPage ? 'active' : ''}">${i}</a>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="pagination__ellipsis">...</span>`;
    }
  }

  // Next
  if (currentPage < totalPages) {
    html += `<a href="/page/${currentPage + 1}/" class="pagination__link">Next →</a>`;
  } else {
    html += `<span class="pagination__link disabled">Next →</span>`;
  }

  html += '</nav>';
  return html;
}

// Generate filter controls
function generateFilters(): string {
  const yearOptions = allYears.map(y => `<option value="${y}">${y}</option>`).join('');
  const tagOptions = allTags.slice(0, 20).map(([tag]) => `<option value="${tag}">${tag}</option>`).join('');

  return `
    <div class="search-container">
      <input type="text" id="search-input" class="search-input" placeholder="Search posts...">
    </div>
    <div class="search-results-info" id="results-info"></div>
    <div class="filters">
      <div class="filter-group">
        <label class="filter-label" for="year-filter">Year</label>
        <select id="year-filter" class="filter-select">
          <option value="">All Years</option>
          ${yearOptions}
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label" for="tag-filter">Topic</label>
        <select id="tag-filter" class="filter-select">
          <option value="">All Topics</option>
          ${tagOptions}
        </select>
      </div>
      <button id="clear-filters" class="filter-clear">Clear Filters</button>
    </div>
  `;
}

// Generate post list HTML
function generatePostListHTML(postsToShow: Post[]): string {
  return postsToShow
    .map(
      (post) => `
      <li class="post-list__item">
        <div class="post-list__date">${formatDate(post.date, "%B %d, %Y")}</div>
        <h2 class="post-list__title"><a href="${post.url}">${post.title}</a></h2>
        ${post.tags.length ? `<div class="post-list__tags">${post.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
      </li>
    `
    )
    .join("");
}

// Generate post pages
for (const post of posts) {
  const postDir = path.join(siteDir, post.slug);
  fs.mkdirSync(postDir, { recursive: true });

  const tagsHtml = post.tags.length
    ? `<div class="article__tags">${post.tags.map((t) => `<a href="/tag/${t}/" class="tag">${t}</a>`).join("")}</div>`
    : "";

  const postContent = `
    <article class="article">
      <a href="/" class="article__back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to posts
      </a>

      <header class="article__header">
        <div class="article__date">${formatDate(post.date, "%B %d, %Y")}</div>
        <h1 class="article__title">${post.title}</h1>
        ${tagsHtml}
      </header>

      <div class="article__content">
        ${post.content}
      </div>
    </article>
  `;

  const fullHtml = generateHTML(postContent, post.title, post.url);
  fs.writeFileSync(path.join(postDir, "index.html"), fullHtml);
}

// Generate paginated index pages
const totalPages = Math.ceil(posts.length / config.postsPerPage);

for (let page = 1; page <= totalPages; page++) {
  const startIndex = (page - 1) * config.postsPerPage;
  const endIndex = startIndex + config.postsPerPage;
  const pagePosts = posts.slice(startIndex, endIndex);

  const postListHtml = generatePostListHTML(pagePosts);
  const paginationHtml = generatePagination(page, totalPages);

  const indexContent = `
    ${generateFilters()}
    <ul class="post-list" id="post-list">
      ${postListHtml}
    </ul>
    ${paginationHtml}
  `;

  const currentPath = page === 1 ? "/" : `/page/${page}/`;
  const indexHtml = generateHTML(indexContent, config.title, currentPath, true);

  if (page === 1) {
    fs.writeFileSync(path.join(siteDir, "index.html"), indexHtml);
  } else {
    const pageDir = path.join(siteDir, "page", String(page));
    fs.mkdirSync(pageDir, { recursive: true });
    fs.writeFileSync(path.join(pageDir, "index.html"), indexHtml);
  }
}

// Generate tag pages
for (const [tag, count] of allTags) {
  const tagDir = path.join(siteDir, "tag", tag);
  fs.mkdirSync(tagDir, { recursive: true });

  const tagPosts = posts.filter(p => p.tags.includes(tag));
  const postListHtml = generatePostListHTML(tagPosts);

  const tagContent = `
    <div class="archive-header">
      <h1 class="archive-header__title">Tag: ${tag}</h1>
      <p class="archive-header__count">${count} post${count !== 1 ? 's' : ''}</p>
    </div>
    <ul class="post-list" id="post-list">
      ${postListHtml}
    </ul>
  `;

  const tagHtml = generateHTML(tagContent, `Tag: ${tag}`, `/tag/${tag}/`);
  fs.writeFileSync(path.join(tagDir, "index.html"), tagHtml);
}

// Generate year archive pages
for (const year of allYears) {
  const yearDir = path.join(siteDir, "year", String(year));
  fs.mkdirSync(yearDir, { recursive: true });

  const yearPosts = posts.filter(p => p.date.getFullYear() === year);
  const postListHtml = generatePostListHTML(yearPosts);

  const yearContent = `
    <div class="archive-header">
      <h1 class="archive-header__title">${year}</h1>
      <p class="archive-header__count">${yearPosts.length} post${yearPosts.length !== 1 ? 's' : ''}</p>
    </div>
    <ul class="post-list" id="post-list">
      ${postListHtml}
    </ul>
  `;

  const yearHtml = generateHTML(yearContent, `Archive: ${year}`, `/year/${year}/`);
  fs.writeFileSync(path.join(yearDir, "index.html"), yearHtml);
}

// Generate about page
const aboutDir = path.join(siteDir, "about");
fs.mkdirSync(aboutDir, { recursive: true });

const aboutPageContent = `
  <div class="about">
    <div class="about__intro">
      <h1 class="about__title">About Derek Hans</h1>
      <p class="about__subtitle">I'm a technology veteran, a technologist at heart, and I write about what I learn along the way.</p>
    </div>

    <div class="about__content">
      <h2>What I Do</h2>
      <p>I believe that a true technologist specializes but learns enough to understand the big picture. My work spans:</p>
      <ul>
        <li>Microsoft Azure and cloud architecture</li>
        <li>Platform engineering and developer experience</li>
        <li>Identity management and Zero Trust security</li>
        <li>AI/ML strategy and implementation</li>
        <li>Cybersecurity and risk management</li>
        <li>Enterprise architecture and technology strategy</li>
      </ul>

      <h2>Background</h2>
      <p>With years of experience across enterprise technology, I've helped organizations of all sizes transform their digital capabilities. There aren't many practices I haven't touched. From startups to Fortune 500 companies, I've seen what works and what doesn't when it comes to technology adoption.</p>
      <p>This scratchpad is where I document my thinking, share lessons learned, and explore new ideas in the ever-evolving world of technology.</p>
      
      <h2>Certifications</h2>
      <p><b>Microsoft Certified:</b> Azure Solutions Architect Expert</p>
      <p><b>Microsoft Certified:</b> DevOps Engineer Expert</p>
      <p><b>Microsoft Certified:</b> Cybersecurity Architect Expert</p>

      <h2>Philosophy</h2>
      <p>Technology is an art and a science.</p>
      <p>I believe in incremential improvement.
      <p>As a geek that can talk, I try to present complex concepts in an accessible way.</p>
      <p>Simple solutions that work today are better than perfect solutions that never ship.</p>
      <p>Measure twice, build fifty times.</p>
    </div>
  </div>
`;

const aboutHtml = generateHTML(aboutPageContent, "About", "/about/");
fs.writeFileSync(path.join(aboutDir, "index.html"), aboutHtml);

// Generate projects page
const projectsDir = path.join(siteDir, "projects");
fs.mkdirSync(projectsDir, { recursive: true });

const projectCardsHtml = projects
  .map(
    (project) => `
    <div class="project-card">
      <a href="${project.url}" class="project-card__link">
        <img src="${project.image}" alt="${project.title}" class="project-card__image" loading="lazy">
        <div class="project-card__overlay"></div>
        <div class="project-card__content">
          <h2 class="project-card__title">${project.title}</h2>
          <p class="project-card__subtitle">${project.subtitle}</p>
        </div>
      </a>
    </div>
  `
  )
  .join("");

const projectsPageContent = `
  <div class="projects-header">
    <h1 class="projects-header__title">Projects</h1>
    <p class="projects-header__subtitle">A selection of technical work, projects, and community contributions.</p>
  </div>
  <div class="projects-grid">
    ${projectCardsHtml}
  </div>
`;

const projectsHtml = generateHTML(projectsPageContent, "Projects", "/projects/");
fs.writeFileSync(path.join(projectsDir, "index.html"), projectsHtml);

// Generate contact page
const contactDir = path.join(siteDir, "contact");
fs.mkdirSync(contactDir, { recursive: true });

const contactIcons = {
  email: `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
  github: `<svg viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  reddit: `<svg viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>`,
  location: `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
};

const contactPageContent = `
  <div class="contact">
    <header class="contact__header">
      <h1 class="contact__title">Get in Touch</h1>
      <p class="contact__subtitle">Have a question or want to work together? Fill out the form below or reach out through any of the channels listed.</p>
    </header>

    <div class="contact__content">
      <form class="contact-form" action="https://formspree.io/f/xzdyleyr" method="POST">
        <input type="hidden" name="_next" value="${config.siteUrl}/thank-you/">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" placeholder="Your name" required>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="your@email.com" required>
        </div>

        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" placeholder="How can I help you?" required></textarea>
        </div>

        <button type="submit" class="form-submit">Send Message</button>
      </form>

      <div class="contact-info">
        <h3 class="contact-info__title">Other Ways to Connect</h3>
        <ul class="contact-info__list">
          <li class="contact-info__item">
            <div class="contact-info__icon">${contactIcons.email}</div>
            <div class="contact-info__text">
              <span class="contact-info__label">Email</span>
              <span class="contact-info__value"><a href="mailto:hi@derekhans.com">hi@derekhans.com</a></span>
            </div>
          </li>
          <li class="contact-info__item">
            <div class="contact-info__icon">${contactIcons.github}</div>
            <div class="contact-info__text">
              <span class="contact-info__label">GitHub</span>
              <span class="contact-info__value"><a href="https://www.github.com/derekhans" target="_blank">@derekhans</a></span>
            </div>
          </li>
          <li class="contact-info__item">
            <div class="contact-info__icon">${contactIcons.reddit}</div>
            <div class="contact-info__text">
              <span class="contact-info__label">Reddit</span>
              <span class="contact-info__value"><a href="https://www.reddit.com/u/derekhans" target="_blank">u/derekhans</a></span>
            </div>
          </li>
          <li class="contact-info__item">
            <div class="contact-info__icon">${contactIcons.location}</div>
            <div class="contact-info__text">
              <span class="contact-info__label">Location</span>
              <span class="contact-info__value">AZ, United States</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
`;

const contactHtml = generateHTML(contactPageContent, "Contact", "/contact/");
fs.writeFileSync(path.join(contactDir, "index.html"), contactHtml);

// Generate thank you page
const thankYouDir = path.join(siteDir, "thank-you");
fs.mkdirSync(thankYouDir, { recursive: true });

const thankYouPageContent = `
  <div class="thank-you">
    <div class="thank-you__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    </div>
    <h1 class="thank-you__title">Message Sent</h1>
    <p class="thank-you__text">Thank you for reaching out. I'll get back to you as soon as possible.</p>
    <a href="/" class="thank-you__link">Back to Home</a>
  </div>
`;

const thankYouHtml = generateHTML(thankYouPageContent, "Thank You", "/thank-you/");
fs.writeFileSync(path.join(thankYouDir, "index.html"), thankYouHtml);

// Generate RSS Feed
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRssDate(date: Date): string {
  return date.toUTCString();
}

const rssItems = posts.slice(0, 20).map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${config.siteUrl}${post.url}</link>
      <guid isPermaLink="true">${config.siteUrl}${post.url}</guid>
      <pubDate>${formatRssDate(post.date)}</pubDate>
      <description>${escapeXml(post.excerpt.substring(0, 500))}</description>
      <author>${config.author}</author>
      ${post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`).join('');

const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <description>${escapeXml(config.description)}</description>
    <link>${config.siteUrl}</link>
    <atom:link href="${config.siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>
    <managingEditor>${config.author}</managingEditor>
    <webMaster>${config.author}</webMaster>
    <generator>Custom Static Site Generator</generator>
    <copyright>Copyright ${config.copyrightYear} ${config.author}</copyright>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;

fs.writeFileSync(path.join(siteDir, "feed.xml"), rssFeed);

console.log(`✓ Built ${posts.length} posts (${totalPages} pages), ${allTags.length} tags, ${allYears.length} years, ${projects.length} projects, and RSS feed to _site/`);
