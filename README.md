# Bottu Teja Sai: Portfolio

A static portfolio with one procedural 3D scene that scrolling controls. Plain HTML, CSS and JavaScript: no server, no build step to deploy, no external requests.

**Open it:** double-click `index.html`. It works from your disk (`file://`), offline, and on GitHub Pages.

## Page order

1. **Hero:** the name decrypts from ciphertext (on load, and again whenever it comes back into view); each word lifts in 3D under the pointer.
2. **About:** story, `$ whoami` card, and "How I work".
3. **Projects:** one section for every project. Filter by area (All, AI Security, General Cybersecurity, Cryptography); open any card for the full details in a floating view.
4. **Research:** the three papers, each linked to its project.
5. **Experience and leadership**
6. **Skills**
7. **Education and certifications**
8. **Contact**

The old "02 AI Security", "Cryptography", "The Architecture of My Thinking" and "Hide a Message in Plain Sight" sections are gone. Their projects and facts now live in the Projects section.

## Where to edit what

| I want to change… | Edit |
| --- | --- |
| A project's text, tags, links, order | `js/data/projects.js` |
| Add or rename a category | `js/data/projects.js` (the `categories` list) |
| A project illustration | `js/projects/visuals.js`, or set `image` on the project |
| How a compact card looks | `js/projects/card.js` (markup) and `css/projects.css` (the `.pcard` rules) |
| How the floating detail looks | `js/projects/detail.js` (markup) and `css/projects.css` (the `.detail` rules) |
| Filter buttons | `js/projects/filters.js` and `css/projects.css` (`.filter`) |
| All other content (About, Research, Experience…) | `index.html` |
| Colors, fonts, spacing | `css/tokens.css` |
| The 3D scene | `src/scene/` (see below) |

### Add a project

Open `js/data/projects.js`, copy one project block, change the fields, save, reload. Required fields: `id`, `title`, `short`, `summary`, `type`, `categories` and either `visual` or `image`. Optional sections (`role`, `approach`, `highlights`, `outcome`, `stack`, `links`, `related`) appear only when they are filled in. The comment at the top of the file explains each field.

Every project has a shareable link: `index.html#project-<id>` opens the page with that project's details showing.

### Add a category

Add `{ id, label, description }` to `categories`, then put that `id` in the `categories` list of each project that belongs to it. Filter buttons and counts update by themselves; a category with no projects stays hidden. A project can belong to several categories and still appears once.

## Code map

```text
index.html                 Content and page structure
css/
  tokens.css               Design tokens: dark + light colors, type scale, spacing, fonts
  base.css                 Reset and shared components (buttons, links, tags, badges)
  layout.css               Header, hero, sections, footer, responsive rules
  projects.css             Filters, project grid, cards, floating detail view, illustrations
  motion.css               Reveal animations; reduced motion, transparency and contrast
js/
  core.js                  Shared helpers (window.Portfolio)
  data/projects.js         PROJECT DATA: categories and projects
  projects/visuals.js      Illustration library
  projects/filters.js      Filter logic and buttons
  projects/card.js         One compact card
  projects/detail.js       The floating detail view (dialog)
  projects/grid.js         Builds the grid, connects filters, cards, detail and share links
  ui/theme.js              Dark/light switch
  ui/header.js             Header, mobile menu, active section
  ui/name.js               Name decrypt and word hover
  ui/reveal.js             Fade-in on scroll
  ui/extras.js             Journey strip, card tilt, copy email
  scene/bridge.js          Scroll position → 3D scene
  main.js                  Starts everything in order
  vendor/scene.js          Built 3D scene with Three.js (do not edit by hand)
src/scene/                 Readable source of the 3D scene
fonts/  images/  assets/resume.pdf
package.json               Only for rebuilding js/vendor/scene.js
```

All scripts are classic deferred scripts sharing one `window.Portfolio` object. There are no ES modules or `fetch` calls, so the site keeps working when opened straight from disk.

## The 3D scene

One network of nodes, edges and travelling packets sits behind the page. Nobody drags, clicks or rotates it: **the scroll position is the camera**. Scrolling down plays the shots in order and scrolling up plays them backwards. At the contact section the network settles into a sphere.

| File | What it controls |
| --- | --- |
| `src/scene/camera.js` | The `KEYS` table: one row per moment (`p` camera position, `t` look-at point, `hold` easing, `dim` brightness behind text, `fog`) and `SETTLE` (when the sphere forms) |
| `src/scene/network.js` | Node count, layout, edges, packets |
| `src/scene/themes.js` | Scene colors for dark and light |
| `src/scene/shaders.js` | Point and line materials |
| `src/scene/index.js` | Renderer, loop, intro glide, hero offset |
| `js/scene/bridge.js` | Which section maps to which moment (`computeAnchors`) |

After editing anything in `src/scene/`, rebuild once (internet needed only for this step):

```bash
npm install
npm run build
```

This rewrites `js/vendor/scene.js`. Commit it, and the site stays double-click and offline compatible. Changes to `js/scene/bridge.js` need no rebuild.

## Deploy on GitHub Pages

1. Create a repository named `Portfolio` (the links point to `https://tejasai-bottu.github.io/Portfolio/`).
2. Upload everything in this folder to the `main` branch, with `index.html` at the root.
3. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
4. Open the URL GitHub shows after a minute.

All paths are relative. If the URL changes, update `canonical`, `og:url`, `og:image` and the JSON-LD `url` in `index.html`.

## Accessibility and fallbacks

- Skip link, landmarks, visible focus rings, 44 px touch targets.
- **Filters:** toggle buttons with `aria-pressed`; the result count is announced.
- **Detail view:** a native modal dialog. Focus moves into it and returns to the card on close. Close with Esc, the × button or a click outside. ← and → step through the projects in the current filter. On phones it opens as a bottom sheet.
- **Themes:** dark by default; the choice is remembered. Both themes meet WCAG AA contrast for text.
- **Reduced motion:** no decrypt animation, word lift, marquee or camera smoothing; the scene follows scroll as still frames.
- **Reduced transparency / increased contrast / forced colors:** opaque surfaces, stronger borders.
- **No WebGL:** a static dot grid and rings replace the scene. **Slow devices:** the scene lowers its resolution, then stops animating.
- **No JavaScript:** every section stays readable; the Projects section points to the résumé and GitHub.

## Notes

- The About card's "5 security tools, 2 as team lead" line is plain text in `index.html`. Update it when you add projects.
- The phone number comes from the current résumé. Delete that `<li>` in the Contact section if you'd rather not publish it.
- Fonts: SIL Open Font License (see `fonts/`). Three.js: MIT (see `js/vendor/THREE-LICENSE.txt`).
