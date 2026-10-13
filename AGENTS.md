# Broadcast Graphics — project instructions

## Product scope

- Build a Tauri desktop app for one operator to create broadcast graphics for any niche.
- Keep the Editor, Ao Vivo controls, and HTML broadcast output as distinct surfaces in one project.
- Multi-operator collaboration is deferred beyond the initial release.
- Different components may be on air at once. Sending edited fields updates the matching active component instead of duplicating it.
- The HTML output connects over WebSocket and is used as a browser source in OBS or vMix.

## UI and graphics boundary

- Use Tailwind CSS and shadcn/ui to standardize the application's own interface, controls, panels, dialogs, and navigation.
- Do not impose shadcn/ui components or the application's Tailwind theme on graphics authored by operators. Broadcast graphics have their own composition, styling, and rendering model.
- Preserve a video-editor layout in the Editor: preview above the timeline, effect editing on the left, effect discovery on the right.

## Approved application stack

- Desktop: Tauri 2.
- Frontend: React, TypeScript, Vite.
- Application UI: Tailwind CSS and shadcn/ui.
- The Tauri/React/TypeScript/Vite scaffold lives in `app/` and uses npm. Exact versions are locked in `app/package-lock.json`; Vitest is the test runner.

## Project status

- The Tauri application scaffold lives in `app/`; use its package scripts rather than inventing commands.
- The frontend build command is `npm run build` from `app/`; Tauri development uses `npm run tauri dev`; tests use `npm test`.
- Tailwind CSS 4 and shadcn/ui source components are configured for application chrome in `app/`.
- Project-model decisions are recorded in `SPEC-project-model.md`; review that spec before implementing the model contract.
- See `docs/intent/broadcast-graphics.md` for the confirmed product intent and `CAPABILITY-MAP.md` for approved module boundaries and build order.
