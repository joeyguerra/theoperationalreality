# Architecture

This is The Operational Reality blog built for Node, using ESM and the [juphjacs](https://github.com/joeyguerra/juphjacs) web framework.

The **juphjacs** framework generates and serves static pages in the `_site` directory. It also has a facility to handle dynamic routes.

Files and folders are created the `pages` folder. For a new page, an HTML document following the pattern `pages/<page-slug>.html` can be created with JavaScript's Template Literals for dynamic templating. If a file that matches it, `pages/<page-slug>.mjs` is created, that is the "server side" code that gets loaded during boot which contains page properties, variables, and HTTP method handlers. You can look at [index.html](../pages/index.html) and [index.mjs](../pages/index.mjs) as an example of the pattern. Although, it might not include a `post` or `delete` http handler, that facility exists.

Architecture and conventions to follow:
0. Write blog posts in `pages/blog` with the year as a subfolder. Write the posts as markdown files. Look at [first blog](../pages/blog/2026/first.md) as an example. If a more dynamic blog post is appropriate, you can define a corresponding `.mjs` file with the markdown file to define dynamic behavior via the `juphjacs` web framework.
1. Use ESM (`.mjs`) and extend `Page` from `juphjacs/src/domain/pages/Page.mjs`.
2. Export default async factory:
   `export default async (rootFolder, filePath, template, context) => new <ClassName>(rootFolder, filePath, template, context)`
3. In page constructor, set metadata fields:
   - `this.title`
   - `this.excerpt`
   - `this.canonical`
   - `this.image`
   - `this.published` (Date object)
   - `this.uri` (e.g. `/foo.html`)
   - `this.tags` (array)
   - `this.urls` (array)
4. Implement `async get(req, res)` for HTML pages:
   - Optionally log page visit via `this.context.db.logEvent('page-visit', visitData).catch(...)`
   - `await this.render()`
   - set `Content-Type: text/html`
   - `res.end(this.content)`
5. If it is an API endpoint page:
   - keep route under `pages/api/*.mjs`
   - implement HTTP methods directly (`get`, `post`, etc.)
   - return JSON responses with explicit status codes
   - use `this.context.db.logEvent(...)` and optional `postNotification(...)` when relevant
6. Pair each `.mjs` page with an `.html` template in `pages/` at the same basename. make new folders under `/pages` where appropriate.
7. HTML style conventions:
   - HTML with corresponding `css/` files for CSS and optional corresponding `js/` files if necessary.
   - CSS variables in `:root` for colors/radius/shadow
   - Leverage CSS variables to define a consistent UI theme
   - support OS set light/dark theme.
   - mobile-first, responsive layout design with media queries
   - no framework dependencies
8. Client-side state pattern (when interactive):
   - plain JS module-style. suggest software architecture before implementing.
   - localStorage persistence for local-first data
   - defensive error handling and simple user feedback (toast/status text)
9. Use markdown rendering on the client side if needed via existing distributed asset `/js/markdown-it.min.js` (already configured in `site.config.mjs` dist).
10. Keep code style consistent with repo:
   - simple classes/functions
   - minimal abstractions
   - readable naming
   - no TypeScript
   - no nested framework setup

Output requirements:
- Return complete code for both files.
- Do not include placeholders like “TODO”.
- Keep URLs/domains consistent with existing canonical host usage in repo.
- Ensure the page can be served immediately by existing `JuphjacWebServer` setup without extra config.
- If an API endpoint is required, add files under the `pages/api/` folder following the `juphjacs` webframework pattern of an `.html` and corresponding `.mjs` file with the HTTP handlers defined.
