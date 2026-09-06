# EndExpanser website

Static GitHub Pages site for the EndExpanser Modrinth profile

## deploy

1. create a GitHub repository
2. upload `index.html`, `style.css` and `script.js` to the repository root
3. open Settings → Pages
4. set **Deploy from a branch**
5. select `main` and `/ (root)`
6. save

The project grid, project count, downloads and follower totals are fetched from the public Modrinth API at page load

## files

- `index.html` — page structure
- `style.css` — design + animations + mobile layout
- `script.js` — Modrinth API, particles, reveal animations, tilt and counters

No build step is required
