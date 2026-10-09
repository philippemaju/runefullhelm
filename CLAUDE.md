# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**runefullhelm** — licensed under MIT (see `LICENSE`).

## Layout

- `test_data/users.csv` — mock dataset: 100 users with `user_id, first_name, last_name, email, course, status` (status is `Pass` or `Fail`). Generated with a fixed seed; CRLF line endings.
- `dashboard/` — Course Completion Results dashboard (Vite + React + TypeScript) over that CSV.

## Dashboard commands

Run from `dashboard/`. `./run.sh <dev|check|test|typecheck|build|preview|setup|clean>` works with no Node installed: it downloads a pinned, checksum-verified Node.js into `dashboard/.node/` (gitignored), installs dependencies, and runs the npm script. This machine has no global Node, so use `./run.sh`, or put `dashboard/.node/bin` on PATH for direct `npm`/`npx` calls. The npm scripts:

- `npm install`
- `npm run dev` — dev server
- `npm test` — all vitest tests; single file: `npx vitest run src/data/stats.test.ts`
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — typecheck + production build into `dist/`

## Dashboard architecture

- `src/data/users.ts` imports `../../../test_data/users.csv?raw` at build time and parses it with `parseUsers` (`src/data/csv.ts`), which validates columns and the Pass/Fail status. `vite.config.ts` allows serving files from the parent directory for this.
- `src/data/stats.ts` holds pure aggregation (`summarize`, `byCourse`, `weakestCourse`); tests in `src/data/*.test.ts` assert the real dataset's numbers (73 pass / 27 fail, weakest course Workplace Safety Fundamentals at 33.3%). Update those tests if the CSV is regenerated.
- `src/App.tsx` owns the shared filter state (search, course, status). Clicking a bar in either chart toggles the course filter used by `UserTable`.
- Both charts are thin wrappers over the generic `components/CourseBarChart.tsx` (plain SVG, no chart library), sized by `useElementWidth` (ResizeObserver).
- Colors are CSS tokens in `src/styles.css`, with dark values under `prefers-color-scheme` and `[data-theme]`.

## Repository notes

- Default branch: `main`.
- `.DS_Store` is in `.gitignore` but still tracked; remove it from the index with `git rm --cached .DS_Store`.
