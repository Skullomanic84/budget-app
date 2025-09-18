# Budget Tracker — MVP Progress Tracker ✅

This checklist tracks the core deliverables and remaining tasks for the Budget Tracker project.

---

## **1. Backend**
- [x] Express server setup
- [x] Prisma schema + migrations
- [x] Zod validation
- [x] Centralized error handler
- [x] JWT authentication (stateless)
- [x] Categories CRUD
- [x] Transactions CRUD
- [x] Monthly summary endpoint
- [ ] API docs (Postman/OpenAPI)
- [ ] Unit + integration tests (auth, categories, transactions)
- [ ] Seed richer sample data for frontend integration

---

## **2. Frontend**
- [x] Vite + TS bootstrapped
- [x] Tailwind installed
- [ ] Install ShadCN UI components
- [ ] API client setup (`client/src/lib/api.ts`)
- [ ] Login + Register pages
- [ ] Dashboard:
    - [ ] Monthly income/expenses
    - [ ] Emergency savings
    - [ ] Transactions table

---

## **3. Database**
- [x] Postgres DB initialized
- [x] Prisma migrations applied
- [x] Verified seed data
- [ ] Add indexes `(orgId, date)` and `(orgId, type)`

---

## **4. CI/CD**
- [x] Husky pre-commit hooks
- [x] ESLint + Prettier integrated
- [ ] Finalize GitHub Actions:
    - [ ] Linting
    - [ ] Type checking
    - [ ] Unit tests
- [ ] Add `.env.example` for local + staging setup

---

## **5. Security & Performance**
- [x] Helmet + CORS configured
- [x] JWT short TTL enforced
- [ ] Add rate limiting on `/auth/*`
- [ ] Add request logging (`pino` or similar)

---

## **6. Deployment**
- [ ] Deploy backend (Render/Railway)
- [ ] Deploy frontend (Vercel)
- [ ] Configure staging env + test full flow

---

## **7. Stretch Goals (Phase 2)**
- [ ] Receipt uploads + file storage
- [ ] AI-powered expense categorization
- [ ] Currency conversion integration
- [ ] Tax deduction estimator

---

### **How to Use**
- As we complete tasks, mark checkboxes ✅.
- We'll review this before starting **Phase 2**.
