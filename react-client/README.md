## H-1B1 guide

`/how` is authored in React (`src/features/how/page.tsx` and `content.tsx`). It shares the jobs page's `Layout`, `PageFooter`, `Button`, `ModeToggle`, and `ThemeProvider`. On desktop, the guide scrolls inside the card below its fixed navigation, like the jobs page’s scrolling results. On mobile, the guide scrolls with the document.

`npm run build` builds both Vite entries, then `scripts/prerender.mjs` renders the guide to `dist/how/index.html` using `react-dom/server`. The browser hydrates the same tree for the theme menu. The article, links, and SEO metadata are present without JavaScript; no runtime rendering server or GraphQL requests are needed for the guide.

- `npm run dev`: React development with hot reload.
- `npm run build && npm run preview -- --port 4173`: verify the generated static page at `/how`.
- Edit guide metadata in `how/index.html`, and homepage metadata in `index.html`.
- Vite development/preview and the included Nginx config map `/how` to `/how/index.html`.

The guide retains the original 2025 visa guidance intentionally, with minor copyediting for grammar and consistency. The recruitment and contact sections have been removed; factual revisions are a separate editorial task.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
