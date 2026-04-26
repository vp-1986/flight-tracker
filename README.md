# Flight Price Tracker

A static React + Vite + TypeScript app that searches live flight prices via the
[Google Flights Data API](https://rapidapi.com/vibapidev/api/google-flights-data)
on RapidAPI. Deployable to GitHub Pages.

## Local setup

```bash
cp .env.example .env
# Open .env and paste your RapidAPI key as VITE_RAPIDAPI_KEY
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>.

## GitHub Pages deployment

1. Push the repo to GitHub.
2. In the repo settings → Secrets and variables → Actions, add a secret named
   `VITE_RAPIDAPI_KEY` with your RapidAPI key.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` will build
   and publish to the `gh-pages` branch.
4. In repo settings → Pages, set the source to the `gh-pages` branch.

If you deploy to a project subdirectory (e.g.
`https://username.github.io/flight-tracker/`), change `base: "/"` in
`vite.config.ts` to `base: "/flight-tracker/"` and rebuild.

> **Warning:** The RapidAPI key is bundled into the static JS at build time,
> so anyone who can read the deployed site can extract it. This is acceptable
> for a personal tool — but **keep the repo private** if you want to keep the
> key private.

## API quota

Each search call counts as one RapidAPI request. Results are cached in memory
for 10 minutes per unique combination of search params; identical re-searches
during that window do not call the API.

## Implementation notes

The integration is built directly against the live schema of
`google-flights-data.p.rapidapi.com`:

- `GET /flights/search-roundtrip` and `/flights/search-oneway` are wired up in
  [`src/api/client.ts`](src/api/client.ts).
- The roundtrip endpoint returns outbound options each carrying a
  `returningToken`. Each outbound card has a "View return flights" button
  that calls `GET /flights/roundtrip-returning?returningToken=...` and
  renders the return options inline.
- The API does not return a usable booking URL (`bookingToken` was `null` in
  all sampled responses, and `/flights/booking-details` returned no booking
  link either). Instead, each result card offers three deep-link buttons —
  Google Flights and Skyscanner pre-filled with the route/dates/passengers,
  plus a Google search for the operating airline's own site. The URL builders
  live in [`src/utils/format.ts`](src/utils/format.ts).
- Airport input is plain IATA-code text (the API does have an
  `/auto-complete` endpoint — could be wired into `SearchForm.tsx` with a
  300ms debounce if desired).

## Project structure

```
src/
  api/
    client.ts     # fetch + cache + timeout
    types.ts      # API response types
  components/
    SearchForm.tsx
    SummaryBar.tsx
    ResultsList.tsx
    FlightCard.tsx
  utils/
    cache.ts      # 10-min in-memory cache
    cookies.ts    # 90-day prefs cookie
    format.ts
  App.tsx
  main.tsx
  index.css
```
