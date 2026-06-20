# mikerobinson.me

Personal website and software blog for [mikerobinson.me](https://www.mikerobinson.me).

The site is built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages as static HTML, CSS, and JavaScript.

## Development

```sh
npm install
npm run dev
```

Build the production site:

```sh
npm run build
```

Eleventy writes generated output to `_site/`.

## Deployment

Pushes to `master` trigger `.github/workflows/deploy.yml`, which builds Eleventy and publishes `_site/` to GitHub Pages. The repository's Pages source should be set to GitHub Actions.

`CNAME` is copied into the generated site so the custom domain stays configured.

## Structure

| Path | Purpose |
|------|---------|
| `src/index.njk` | Homepage content |
| `src/blog/index.njk` | Blog index at `/blog/` |
| `src/blog/posts/*.md` | Markdown blog posts |
| `src/tags/` | Tag index and generated tag archive pages |
| `src/feed.njk` | RSS feed at `/feed.xml` |
| `src/sitemap.njk` | Sitemap at `/sitemap.xml` |
| `src/_includes/` | Shared layouts and partials |
| `src/_data/site.js` | Site metadata |
| `style.css` | Global styles |
| `analytics.js` | Custom Umami event helpers |
| `icons/` | App icon PNGs for project cards |

## Adding a blog post

1. Add a Markdown file to `src/blog/posts/`.
2. Include front matter:

   ```yaml
   ---
   layout: layouts/post.njk
   title: "Post title"
   description: "Short summary for previews and metadata."
   date: 2026-06-20
   tags:
     - Swift
     - iOS
   ---
   ```

3. Write the post in Markdown.
4. Run `npm run build` to confirm the site generates.

Posts are automatically added to `/blog/`, `/feed.xml`, `/sitemap.xml`, `/tags/`, and matching tag archive pages.

## Adding a project

1. Drop a square PNG icon into `icons/` (for example, `icons/MyApp.png`).
2. Copy an existing `<article class="project-card">` block in `src/index.njk`.
3. Update the app name, tagline, description, icon `src`, and icon `alt`.
4. Run `npm run build`.
