# Contributing Guide

Welcome! This guide explains how to set up the project locally, make changes, and submit high‑quality pull requests.

> Repo: **Budget Tracker App** (monorepo: `client/` + `server/`)

---

## Table of Contents
1. [Project setup](#project-setup)
2. [Branching & workflow](#branching--workflow)
3. [Commit messages (Conventional Commits)](#commit-messages-conventional-commits)
4. [Coding standards](#coding-standards)
5. [Running and testing](#running-and-testing)
6. [Database & Prisma](#database--prisma)
7. [Queues (Redis + BullMQ)](#queues-redis--bullmq)
8. [CI expectations](#ci-expectations)
9. [Security & secrets](#security--secrets)
10. [Code review checklist](#code-review-checklist)
11. [Common tasks](#common-tasks)
12. [Windows & line endings](#windows--line-endings)

---

## Project setup

### Prerequisites
- Node.js **>= 20**, npm **>= 10**
- Git
- PostgreSQL **>= 15**
- (Optional) Redis for background jobs

### Clone & install
```bash
git clone https://github.com/<your-username>/budget-app.git
cd budget-app

# Install all deps at the root (workspaces + root dev deps)
npm install

# Set up Husky locally (only once per clone)
npx husky init
```

### Environment variables
Create `.env` files:

**server/.env**
```ini
DATABASE_URL=postgresql://<user>:<pass>@localhost:5432/budget_app
REDIS_URL=redis://localhost:6379
JWT_SECRET=replace_with_a_strong_secret
PORT=4000
```

**client/.env**
```ini
VITE_API_URL=http://localhost:4000
```

---

## Branching & workflow
- Default branch: **main**
- Feature branches: `feat/<short-name>` (e.g., `feat/transactions-crud`)
- Fix branches: `fix/<short-name>`
- Chore branches: `chore/<short-name>`
- Open a **PR** to `main` and request review.

Suggested flow:
```bash
git checkout -b feat/your-feature
# ...commit changes...
git push -u origin feat/your-feature
# open PR
```

---

## Commit messages (Conventional Commits)
Use **Conventional Commits** to keep history clean and enable changelogs.

**Format**: `type(scope): short description`

**Types**:
- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation only
- `style`: formatting, no code change
- `refactor`: code change that neither fixes a bug nor adds a feature
- `perf`: performance improvements
- `test`: add/update tests
- `build`: build system or dependencies
- `ci`: CI config, scripts
- `chore`: misc maintenance

**Examples**:
```
feat(auth): add refresh token rotation
fix(api): handle 400 when zod parse fails
docs(readme): add setup instructions
ci(github-actions): install root + workspaces in one step
```

---

## Coding standards
- **ESLint v9 flat config** at repo root: `eslint.config.mjs`
- **Prettier** for formatting
- **TypeScript** everywhere
- Prefer small, focused PRs
- Keep functions < ~50 lines where practical

### Lint & format pre-commit
Husky runs **lint-staged**:
```jsonc
// package.json (root)
"lint-staged": {
  "*.{js,ts,jsx,tsx,json,css,md}": ["prettier --write"],
  "*.{js,ts,jsx,tsx}": ["eslint --fix"]
}
```

---

## Running and testing

### Run both apps
```bash
# From repo root
npm run dev
```

### Run individually
```bash
# server
npm run dev -w server
# client
npm run dev -w client
```

### Lint / typecheck / tests
```bash
npm run lint
npm run typecheck
npm run test     # currently runs server tests
```

> Add client tests as the app grows (Vitest + React Testing Library).

---

## Database & Prisma
> Applied when Prisma is introduced.

**Initial setup**
```bash
# Generate client
npm -w server exec prisma generate

# Create & run migrations
npm -w server exec prisma migrate dev --name init
```

**Useful commands**
```bash
# Apply migrations in CI/Prod
npm -w server exec prisma migrate deploy

# Open Prisma Studio
npm -w server exec prisma studio
```

**Schema changes**
1. Edit `server/prisma/schema.prisma`
2. Run `prisma migrate dev -w server`
3. Update seed or fixtures if needed
4. Commit migration files

---

## Queues (Redis + BullMQ)
Used for: reports, recurring transactions, notifications, OCR.

**Dev Redis (docker)**
```bash
docker run -p 6379:6379 --name redis -d redis:7-alpine
```

**Enqueue example (server)**
```ts
// queues/report.ts
await reportQueue.add('tax-year', { orgId, userId, taxYear }, {
  attempts: 5, backoff: { type: 'exponential', delay: 2000 }
})
```

**Worker**
```bash
npm run worker -w server
```

---

## CI expectations
GitHub Actions enforces:
- **Install** (root + workspaces)
- **Lint** (`npm run lint`)
- **Typecheck** (`npm run typecheck`)
- **Tests** (server Vitest)
- **Build client**

PRs must be **green** and have **1 approval** before merge.

---

## Security & secrets
- Never commit `.env*` files or secrets
- Secrets go into **GitHub Actions → Secrets**
- Gitleaks runs on PRs to catch exposed keys
- Use strong `JWT_SECRET`; rotate if leaked
- HTTPS in production

---

## Code review checklist
- [ ] Clear feature scope and small diff
- [ ] Lint + typecheck pass locally
- [ ] Tests added/updated
- [ ] No secrets or credentials
- [ ] Error handling + logging present
- [ ] Tenant context respected (when applicable)
- [ ] UX: loading, empty state, error states covered
- [ ] Docs/README updated if needed

---

## Common tasks

### Add a dependency
```bash
# server
npm i <pkg> -w server
# client
npm i <pkg> -w client
```

### Remove a dependency
```bash
npm uninstall <pkg> -w server  # or -w client
```

### Update ESLint/Prettier rules
- Modify `eslint.config.mjs` (root)
- Prettier in `.prettierrc` (root)

### Generate build
```bash
npm run ci
```

---

## Windows & line endings

To avoid LF/CRLF warnings and keep CI consistent:
1. Add `.gitattributes` in repo root:
   ```gitattributes
   * text=auto eol=lf
   ```
2. Normalize once:
   ```bash
   git add --renormalize .
   git commit -m "chore: normalize line endings to LF"
   ```

---

Thanks for contributing! 🚀
