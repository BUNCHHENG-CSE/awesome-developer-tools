# 🌐 DevAtlas — Global Discovery Directory for IT Tools

> **"Discover software tools from around the world — especially the ones 99% of developers haven't heard of."**

DevAtlas is a modern, production-ready discovery directory indexing famous and hidden gem software engineering tools, programming languages, web & backend frameworks, cloud engines, and DevOps utilities from 28+ countries across the globe.

---

## 🎯 Product Intent & Philosophy

While household tools (Docker, Kubernetes, React, PostgreSQL) anchor the industry baseline, engineering ecosystems across Japan, Germany, Ukraine, Poland, France, Brazil, India, and beyond produce exceptional, specialized software that remains under-the-radar.

DevAtlas is strictly the **information + discovery layer**:
- It never mirrors or hosts the software itself.
- Every tool profile has an unmistakable primary **"Visit official website →"** call to action linking directly to the real, official homepage.
- Every entry in our seed catalogue is a verified, real-world project with accurate country of origin, official URL, and licensing information.

---

## ⚡ Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Runtime & Package Manager:** [Bun](https://bun.sh) (`bun` & `bunx` exclusively)
- **Database & ORM:** Dual-schema Prisma setup (SQLite for local zero-dependency testing, PostgreSQL for production)
- **UI & Design:** Tailwind CSS v4 + `shadcn/ui` + `tailwindcss-animate`
- **Component Primitives:** `@radix-ui` / `@base-ui` + Lucide Icons (`lucide-react`)
- **Forms & Validation:** `react-hook-form` + `zod` + `@hookform/resolvers`
- **Theming & Alerts:** `next-themes` (Dark/Light/System) + `sonner` toasts

---

## 🗄️ Dual-Database Architecture (SQLite Local ⇄ Postgres Prod)

Prisma only allows a single `provider` per schema file. DevAtlas solves this with a cross-platform swapping architecture:

```
prisma/
├── schema.sqlite.prisma    # provider = "sqlite"
├── schema.postgres.prisma  # provider = "postgresql"
└── schema.prisma           # Active schema (symlink/copy target)
scripts/
└── swap-schema.mjs         # Cross-platform Node/Bun script using fs.copyFileSync
```

### Schema Rules & SQLite Compatibility
1. **Byte-Identical Models:** Everything below the `datasource db` block is 100% byte-identical between `schema.sqlite.prisma` and `schema.postgres.prisma`.
2. **No Native Enums:** `String` fields with documented comment constraints are used to ensure compatibility with SQLite.
3. **Relational Tags:** Tags are modeled via an implicit many-to-many `Tag` model instead of Postgres-only `String[]` scalar lists.
4. **No `mode: "insensitive"` in Prisma Queries:** SQLite `LIKE` is case-insensitive for ASCII by default, while Postgres `contains` without `mode: "insensitive"` runs safely across both engines.

---

## 🚀 Quickstart (Local Development with SQLite)

Clone the repository and run with Bun:

```bash
# 1. Install dependencies
bun install

# 2. Setup SQLite schema and seed the database
bun run db:sqlite:seed

# 3. Start the Next.js development server
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available Scripts

| Script | Command | Description |
|---|---|---|
| `bun run dev` | `next dev` | Start development server on port 3000 |
| `bun run build` | `next build` | Build production Next.js bundle |
| `bun run start` | `next start` | Run production server |
| `bun run typecheck` | `tsc --noEmit` | TypeScript type checking |
| `bun run lint` | `next lint` | Run ESLint checks |
| `bun run db:sqlite:generate` | `bun scripts/swap-schema.mjs sqlite && bunx prisma generate` | Generate Prisma client for SQLite |
| `bun run db:sqlite:push` | `bun scripts/swap-schema.mjs sqlite && bunx prisma generate && bunx prisma db push` | Push SQLite schema to `dev.db` |
| `bun run db:sqlite:seed` | `bun scripts/swap-schema.mjs sqlite && bunx prisma generate && bunx prisma db push && bun prisma/seed.ts` | Complete SQLite setup + seed |
| `bun run db:pg:generate` | `bun scripts/swap-schema.mjs postgres && bunx prisma generate` | Generate Prisma client for PostgreSQL |
| `bun run db:pg:migrate` | `bun scripts/swap-schema.mjs postgres && bunx prisma migrate dev` | Run PostgreSQL development migrations |
| `bun run db:pg:deploy` | `bun scripts/swap-schema.mjs postgres && bunx prisma migrate deploy` | Run PostgreSQL production migrations |
| `bun run db:seed` | `bun prisma/seed.ts` | Run native seed runner |

---

## 🚀 Production Deployment (PostgreSQL)

To deploy DevAtlas to Vercel, Railway, Render, or a custom VPS:

1. **Set Environment Variables:**
   ```env
   DATABASE_PROVIDER="postgresql"
   DATABASE_URL="postgresql://user:password@host:5432/devatlas?schema=public"
   ```

2. **Build and Migrate:**
   ```bash
   # Switch active schema to postgres and generate client
   bun run db:pg:generate

   # Apply migrations to live postgres instance
   bun run db:pg:deploy

   # Seed initial catalogue
   bun run db:seed

   # Build Next.js application
   bun run build
   ```

> **Note on Next.js Build Safety:** All database-backed App Router pages and API routes export `export const dynamic = "force-dynamic";`. This guarantees `bun run build` succeeds even in environments where no live database server is reachable during static build passes.

---

## 💎 Sample Curated Hidden Gems

| Tool Name | Country | Category | Official Website | Hidden Gem Reason |
|---|---|---|---|---|
| **Hono** | 🇯🇵 Japan | Web Frameworks | https://hono.dev | Ultrafast web framework built on Web Standards for Cloudflare Workers, Deno, Bun, and Node. |
| **Restic** | 🇩🇪 Germany | Developer Utilities | https://restic.net | Fast, secure, deduplicated backup program written in Go that backs up to any cloud or local storage. |
| **VictoriaMetrics** | 🇺🇦 Ukraine | Databases | https://victoriametrics.com | Ultra-fast, cost-effective time-series database and Prometheus monitoring drop-in started in Kyiv. |
| **DuckDB** | 🇳🇱 Netherlands | Databases | https://duckdb.org | Fast in-process analytical SQL database management system developed at CWI in Amsterdam. |
| **Meilisearch** | 🇫🇷 France | Databases | https://www.meilisearch.com | Lightning-fast, hyper-relevant open-source search engine built in Rust in Paris. |
| **Hoppscotch** | 🇮🇳 India | Developer Utilities | https://hoppscotch.io | Lightweight, web-based open-source API development ecosystem created in India as a fast Postman alternative. |
| **Elixir** | 🇧🇷 Brazil | Programming Languages | https://elixir-lang.org | Dynamic, functional language for scalable and maintainable applications created by Brazilian engineer José Valim. |
| **Coolify** | 🇩🇪 Germany | Cloud Platforms | https://coolify.io | Self-hostable, all-in-one PaaS alternative to Heroku, Netlify, and Vercel for any Linux server. |
| **Convoy** | 🇳🇬 Nigeria | Developer Utilities | https://getconvoy.io | Fast, secure open-source webhooks gateway for ingesting and delivering millions of events, built in Lagos, Nigeria. |
| **k6** | 🇸🇪 Sweden | Developer Utilities | https://k6.io | Modern developer-centric load testing tool written in Go with JavaScript test scripts, born in Stockholm. |
| **Woodpecker CI** | 🇩🇪 Germany | DevOps & CI/CD | https://woodpecker-ci.org | Community-driven, lightweight container-based CI/CD engine created as a pure community fork of Drone. |
| **Dragonfly** | 🇮🇱 Israel | Databases | https://www.dragonflydb.io | Modern multi-threaded in-memory datastore designed as a drop-in replacement for Redis with 25x throughput. |
| **Unleash** | 🇳🇴 Norway | DevOps & CI/CD | https://www.getunleash.io | Enterprise-ready open-source feature management and feature flag service started in Oslo. |
| **Lazygit** | 🇦🇺 Australia | Developer Utilities | https://github.com/jesseduffield/lazygit | Simple and intuitive terminal UI for git commands created by Jesse Duffield in Sydney. |
| **NocoDB** | 🇸🇬 Singapore | Databases | https://nocodb.com | Open-source Airtable alternative that turns any relational database into a smart collaborative spreadsheet. |

---

## 🌟 Interactive Discovery Features

DevAtlas provides a complete suite of discovery engines designed for engineers:

### 1. 🗺️ Interactive World Atlas (`/atlas`)
- **Geographic Ecosystem Explorer:** Interactive SVG vector map of the globe with active pin projections for all 28+ indexed software-producing nations.
- **Regional Filtering:** Filter by continents (Europe, Asia, LATAM, North America, Africa, Oceania, Middle East).
- **Country Drawer:** Instant inspection panel displaying tool counts, regional hidden gems, official website links, and full country profiles.

### 2. ⚖️ Side-by-Side Tool Comparison ("Versus Mode" — `/compare`)
- **Multi-Tool Matrix:** Compare up to 4 developer tools side-by-side on specifications, licenses, origin, pricing models, initial release year, and hidden gem scores.
- **Floating Compare Dock:** Click `+ Compare` anywhere on the site (cards or tool detail pages) to queue tools into a persistent bottom dock.
- **Shareable Matrix:** Direct URL query support (e.g. `/compare?tools=hono,express`) for one-click team sharing.

### 3. 🔄 Software Swaps & Alternatives (`/alternatives`)
- **Curated Replacement Pairs:** Match bloated or proprietary mainstream giants against lightweight, open-source, or self-hostable hidden gems (e.g., *Postman ➔ Hoppscotch*, *Redis ➔ Dragonfly*, *Vercel ➔ Coolify*, *Prometheus ➔ VictoriaMetrics*).
- **Inline Swaps:** Tool detail pages automatically surface intelligent alternative suggestions within the same category.

### 4. 🧰 Tech Stack Builder & User Bookmarks (`/stacks`)
- **Saved Tools:** Bookmark tools with one click; saved instantly to `localStorage` for guests and synced to user database accounts upon login.
- **Custom Stack Composer:** Build and name full-stack architectures by organizing tools into layers: **Frontend**, **Backend**, **Database**, **DevOps**, and **Utility**.
- **README Markdown Export:** Generate formatted GitHub README snippets with one click (e.g. `### 🛠️ Built with My Stack ...`).
- **Public Share Links:** Share curated stacks with the community at `/stacks/[slug]`.

### 5. 🎲 Random Hidden Gem Roulette
- **Instant Serendipitous Discovery:** Click the **"Surprise Me"** dice button in the header or hero to trigger a slot-machine style gem roulette modal.
- **Global Keyboard Shortcut:** Press `R` anywhere on the site to immediately open the Roulette dialog and spin for an under-the-radar tool.

### 6. 📊 Live GitHub Health & Activity Badges
- **Repository Metadata:** Automatically parses GitHub repository URLs to display formatted star counts (`★ 14.5k`), fork counts, and release recency.
- **Maintenance Indicator:** Highlights repositories with recent commits via **"Actively Maintained"** badges.

---

DevAtlas features built-in Role-Based Access Control (RBAC):

### User Roles
- **`admin`**: Full administrative privileges. Can access the **Admin Console** (`/admin`), approve/reject submissions, publish submitted tools directly into the live directory, manage all tools, and manage user roles.
- **`user` (Tool Submitter)**: Default role for registered users. Can log in, submit tools for editorial review, and track the status of their submitted tools under **My Submissions** (`/my-submissions`).

### 🛡️ Member-Only Submissions
- Submitting a tool is strictly restricted to authenticated users. Unauthenticated visitors are prompted to sign in or register before submitting.
- Submissions are automatically linked to the user account with a `pending` status.

### 🔑 Demo Accounts (Pre-Seeded)
The local database comes pre-seeded with two ready-to-use accounts:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Admin** | `admin@devatlas.com` | `admin123` | Full access to `/admin`, approve/reject tools, directory CRUD, role management |
| **Tool Submitter** (Normal User) | `user@devatlas.com` | `user123` | Submit tools, track status in `/my-submissions` |

To re-seed or add accounts:
```bash
bun scripts/seed-users.ts
```

---

## 🛠️ Admin Dashboard (`/admin`)

The Admin Dashboard provides:
1. **Overview & Analytics**: Live counts for total tools, pending submissions, approved tools, hidden gems, and registered users.
2. **Submissions Review**: Filter by `pending`, `approved`, or `rejected`. Approve submissions with an optional one-click publish directly into directory tables, or reject with custom editorial feedback notes.
3. **Tools Management**: Add, edit, or delete directory tools, with instant toggles for **Hidden Gem** status and homepage **Featured** badges.
4. **Users & Roles Management**: View all registered users, submission counts, and promote/demote between `admin` and `user` (Tool Submitter).

---

## 🤝 How to Submit a New Tool

1. Log in or create an account (Tool Submitter).
2. Click the **"Submit a Tool"** button in the header.
3. Provide the tool name, valid official website URL, category, and country of origin.
4. Submissions enter the review queue with `status: "pending"`.
5. Track review progress at any time under **My Submissions** (`/my-submissions`).
6. Administrators review and approve submissions via the **Admin Console** (`/admin`).

---

## 📜 License
MIT © DevAtlas Contributors
