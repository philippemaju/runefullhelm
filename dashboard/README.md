# Course Completion Results dashboard

A React + TypeScript dashboard over `../test_data/users.csv`: overall pass rate, pass rate and pass/fail counts per course, and a searchable, filterable user table. Clicking a course bar filters the table.

## Run

`./run.sh` needs no global installs. If there is no Node.js 18+ on your PATH, it downloads Node.js 22.11.0 from nodejs.org into `.node/` and checks it against the official checksum. It installs dependencies on first use.

```sh
./run.sh            # dev server (same as ./run.sh dev)
./run.sh check      # typecheck, test and build
./run.sh test       # vitest
./run.sh build      # production build into dist/
./run.sh preview    # build, then serve dist/
./run.sh clean      # remove .node, node_modules and dist
```

With Node.js 18+ already installed, the npm scripts work directly:

```sh
npm install
npm run dev        # local dev server
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run build      # production build into dist/
```

The CSV is imported at build time (`?raw`), so edits to it show up on reload in dev and need a rebuild for `dist/`.
