# Frontend Collaboration Guide

## Shared components (Header/Footer/Layout)
- Shared components live in `src/components`: `Header.jsx`, `Footer.jsx`, and `Layout.jsx`.
- Do **not** duplicate header/footer in pages. Use the existing layout.
- All pages should be routed under `Layout` so header/footer appear automatically.

## Add a new page
1) Create a page file in `src/pages`:

```jsx
export default function YourPage() {
  return <div>Your content</div>
}
```

2) Register the route in `src/App.jsx` **inside** the `Layout` route:

```jsx
<Route path="yourpage" element={<YourPage />} />
```

## Rules to avoid conflicts
- Keep changes to `Header.jsx` / `Footer.jsx` in a single PR and notify the team.
- Use small, focused branches and PRs.
- Avoid editing the same files simultaneously.

## Quick check
- Run the app and verify the header/footer appear on your route.
