# PlayList — Static directory for Games, Movies & Tutorials

This is a lightweight, production-ready static website you can deploy to Netlify. It lists games, movies and tutorials with categories, search, and a detail modal.

What is included

- `index.html` — main single-page UI
- `css/styles.css` — responsive styles
- `js/app.js` — client-side renderer, filters, search, and modal
- `data/items.json` — sample data (add your own entries)
- `_redirects` — SPA redirect rule for Netlify

Deploying to Netlify

1. Initialize a git repo (if you haven't) and push this folder to GitHub/GitLab/Bitbucket.
2. Create a new site on Netlify and connect your repository. No build command is required — set "Publish directory" to the repository root (or the folder containing `index.html`).
3. Alternatively, drag and drop the folder into Netlify's Deploys -> "Deploy site" panel.

Notes & extension ideas

- Add more metadata fields (release date, rating, platforms).
- Add pagination or infinite scroll for larger datasets.
- Add lightweight client-side caching (localStorage) for faster reloads.
- Replace `data/items.json` with a headless CMS or Netlify Functions if you need writes.

Editing data

- Edit `data/items.json` and add objects with the schema: `{id, type: 'game|movie|tutorial', title, description, categories:[], tags:[], link}`

License
This starter is MIT-style — use and adapt freely.
