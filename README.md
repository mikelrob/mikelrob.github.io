# mikerobinson.me

Personal website / portfolio. Plain HTML, CSS, and a sprinkle of vanilla JS — no frameworks, no build step.

🌐 **Live:** [mikerobinson.me](https://mikerobinson.me)  
🚀 **Deployment:** GitHub Pages — pushes to `master` go live automatically.

---

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Entire site — nav, hero, about, projects, footer |
| `style.css` | All styles, including dark-mode via `prefers-color-scheme` |
| `analytics.js` | Custom Umami event helpers (outbound link tracking etc.) |
| `app-release.js` | Switches pre-order badges to download badges at the configured release time |
| `icons/` | App icon PNGs for each project card |

**Design decisions to remember:**
- No frameworks or bundlers — edit files directly, push, done.
- Font: Inter via Google Fonts.
- Analytics: [Umami](https://umami.is) (self-hosted). The script tag in `index.html` points to the cloud instance; the `data-website-id` ties it to the right site.
- Tracking events use `data-umami-event` attributes on links — no JS wiring needed for basic clicks.

---

## Adding a new project

1. Drop a square PNG icon into `icons/` (e.g. `icons/MyApp.png`).
2. Copy an existing `<article class="project-card">` block in `index.html`.
3. Update: app name (`<h3>`), tagline (`<p class="project-tagline">`), description (`<p class="project-desc">`), icon `src` and `alt`, App Store `href`, and the `data-umami-event-app` attribute.
4. Push — done.

## Scheduled app releases

Add `data-release-at` to a project card with an ISO timestamp including its UTC offset.
Reach switches to the download badge and hides its release note at midnight UK time
on 23 October 2026 (`2026-10-23T00:00:00+01:00`). The page checks the visitor's clock
on load and schedules the switch for pages left open, without another deployment.

Run the release checks with `node --test tests/app-release.test.cjs`.
