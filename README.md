# Terminal Notes

A minimal, text-focused Jekyll blog for technical writing.

## Structure

```
tech-blog/
├── _config.yml          # Jekyll configuration
├── _layouts/            # HTML templates
│   ├── default.html     # Base layout
│   └── post.html        # Post layout
├── _posts/              # Blog posts (YYYY-MM-DD-title.md)
├── assets/css/          # Stylesheets
├── about.md             # About page
├── index.html           # Homepage
└── build.ts             # Static site generator
```

## Writing Posts

Create a new file in `_posts/` with the format:

```
YYYY-MM-DD-your-post-title.md
```

Include frontmatter at the top:

```yaml
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD
tags: [tag1, tag2]
---

Your content here...
```

## Development

```bash
# Install dependencies
bun install

# Build and preview
bun run build
bun run serve
```

## Using with Jekyll

If Ruby is installed:

```bash
bundle install
bundle exec jekyll serve
```

## Design Philosophy

- **Text-first**: Serif body, monospace accents
- **Minimal**: No distractions, focused reading
- **Responsive**: Works on all screen sizes
- **Dark mode**: Automatic via prefers-color-scheme

## License

MIT
