# ExecutiveOS — Client

A personal executive dashboard (Dashboard, Calendar, Tasks, Notes, Documents, Finance, AI Assistant) built with React + Vite.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Notes

- Data persists to the browser's `localStorage` (see `src/services/storage.js`), so everything you add/edit/delete survives a refresh — no backend required.
- Dark mode toggle lives in the top bar; theme is also saved to localStorage.
- The "Today's Focus" card on the Dashboard is live-derived from your Tasks — mark a task done (or star a task to pin it as the focus) on the Tasks page and the Dashboard updates immediately, because both pages read from the same shared app state (`src/context/AppContext.jsx`).
- The AI Assistant page calls the Anthropic API directly from the browser. That requires an API key, which should never be shipped in client-side code for a real deployed app — wire it through your own backend proxy before shipping. Out of the box, `src/pages/AIAssistant.jsx` shows a friendly explanation instead of making the raw call, with a single spot to plug in your proxy endpoint.
