# Repository Guidelines

## Project Structure & Module Organization
- React + TypeScript app bootstrapped with Vite; entrypoint `index.tsx` renders `App.tsx` (tabbed layout for dólar quotes, calculators, and charts).
- UI modules live in `components/` (cards, converter, chart, arbitrage alerts, tab selector). Keep new views small and focused.
- Data access is in `services/`: `dolarService.ts` fetches from dolarapi.com and CryptoYa; `geminiService.ts` calls Google GenAI for market summaries. Extend APIs here, not inside components.
- Domain models sit in `types.ts`; shared formatters/styles in `utils.ts`; tooling in `vite.config.ts` and `tsconfig.json` (bundler resolution with `@/*` alias). Static shell is `index.html`.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start Vite dev server (hot reload, default port 5173).
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the built app locally for smoke testing.
- Set `GEMINI_API_KEY` (or `API_KEY` matching `geminiService`) in `.env.local`; restart the dev server after changes.

## Coding Style & Naming Conventions
- Use functional React components with hooks; keep stateful logic near `App.tsx` and pass typed props (`DolarQuote`, `QuoteType`).
- Prefer single quotes, semicolons, and 2-space indentation as in existing files; favor named exports.
- Style via Tailwind utility classes embedded in JSX; avoid inline styles unless necessary.
- Components and files: `PascalCase.tsx`; utility and service helpers: `camelCase.ts`; types/enums: `PascalCase`.
- Keep API calls `async/await` with guarded error handling; reuse helpers like `formatCurrency`, `formatDate`, and `getCardStyle`.

## Testing Guidelines
- No automated tests are wired yet. If adding them, use Vitest + React Testing Library; place specs as `*.test.tsx` near the code under test.
- Minimum manual check before merging: `npm run preview` and verify the four tabs (`dolares`, `cotizaciones`, `cripto`, `bandas`) load data, conversions work, and charts render without console errors.
- Cover data transforms (sorting, naming, formatting) and API fallbacks when you add tests; aim to exercise error paths in `dolarService`.

## Commit & Pull Request Guidelines
- Git history uses conventional-style prefixes (e.g., `feat: ...`). Follow `<type>: <summary>` with types like `feat`, `fix`, `chore`, `docs`.
- Keep PRs small and scoped. Include: short summary, linked issue if applicable, screenshots/GIFs for UI changes, noted env var/API updates, and testing notes (manual steps or test commands).
- Avoid committing secrets or `.env.local`; prefer `.env.example` updates when new config is needed.

## Security & Configuration Tips
- API keys must stay in `.env.local`; never log or commit them. Network calls run client-side, so handle failures gracefully (show fallback messaging and avoid crashing renders).
- External endpoints (dolarapi.com, CryptoYa, Google GenAI) can rate limit or fail; keep retries/timeouts in services and sanitize payloads before prompting the model.
