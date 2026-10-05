# Blood Donation System frontend

Vite + React + TypeScript frontend for the Blood Donation System.
## Requirements

- Node.js 18 or newer
- The Spring Boot backend running on `http://localhost:8080`
## Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```
`VITE_API_URL` is the Axios base URL used by the API layer. Do not put secrets in Vite environment variables because `VITE_*` values are exposed to the browser.

## Run locally

From the `frontend` directory:
```bash
npm install
npm run dev
```

Open `http://localhost:5173`.
The Vite development proxy forwards `/api` and `/auth` requests to `http://localhost:8080`. This keeps browser requests same-origin during development. Restart Vite after changing `.env` values.

## Other commands

```bash
npm run build   # strict TypeScript check and production build
npm run lint    # Oxlint
npm run preview # preview the production build
```
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
