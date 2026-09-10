# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      # Personal Website

      React + TypeScript + Vite personal website with an AI chat page and donation page.

      ## Local development

      ```bash
      npm install
      npm run dev
      ```

      The app expects `VITE_API_BASE_URL` in a `.env` file:

      ```env
      VITE_API_BASE_URL=http://localhost:8000
      ```

      The chat client sends `POST /api/chatbot/ask/` with a question and optional conversation history. The response must include `id`, `question`, `answer`, `created_at`, and a `sources` array containing `id`, `title`, and an `http` or `https` URL.

      ## Checks

      ```bash
      npm run lint
      npm run build
      ```

      ## Render

      Use `personal-website` as the project root. The build command is:

      ```bash
      npm install && npm run build
      ```

      Set `VITE_API_BASE_URL` as a Render environment variable before deploying. Asset imports are case-sensitive in production, so filenames must match their imports exactly.
  },
