
# **Project Requirements Document (PRD)**  
**Project Name:** Budget Tracker App  
**Version:** 1.0.0  
**Author:** Jahmaine  
**Status:** Draft  
**Last Updated:** September 7, 2025  

---

## **1. Project Overview**
The Budget Tracker App is a **personal finance and tax assistant** designed to help individuals manage their income, track expenses, organize receipts, and prepare accurate reports for tax submission.

### **Goals**
- Provide a **personal accounting dashboard**
- Automate **expense tracking and categorization**
- Simplify **tax reporting** for South African regulations
- Support **multi-tenant users** (future scalability)
- Enable **AI-powered insights** and recommendations

---

## **2. Core Features (MVP)**

### **Phase 1: Foundation**
- Authentication (JWT + Refresh Tokens)
- Role-based user access:
  - **Admin/Superuser** → can add/manage users
  - **Standard User** → personal budget tracking
- Dashboard:
  - Monthly income tracking
  - Monthly & daily expense tracking
  - Emergency savings overview
  - Current expense table
- CI/CD pipelines with **GitHub Actions** + free-tier deployments.

### **Phase 2: Enhancements**
- Receipt & statement uploads (PDF, images)
- OCR integration for auto-reading receipts
- Multi-currency support with live conversion
- Budget notifications & alerts
- AI assistance for financial recommendations

### **Phase 3: Tax & Reporting**
- Tax-compliant reporting (SARS, South Africa)
- Track deductions (medical, retirement, education, donations)
- Export reports as **PDF**, **Excel**, and **CSV**

---

## **3. Non-Functional Requirements**
- **Performance:** <300ms API response times
- **Security:**
  - JWT authentication + refresh tokens
  - Secure password hashing (Argon2/Bcrypt)
  - HTTPS-only production environments
  - Environment secrets managed in **GitHub Actions Secrets**
- **Scalability:**
  - Designed for **multi-tenancy**
  - Background job queues for heavy operations (BullMQ + Redis)
- **Availability:** Target 99.9% uptime (free-tier friendly)
- **Observability:** Logging + monitoring with Sentry (free plan)

---

## **4. Technical Architecture**

### **Frontend**
- React + TypeScript + Vite
- ShadCN UI + TailwindCSS
- TanStack Query for data fetching
- Zod for form validation

### **Backend**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- BullMQ + Redis for background tasks

### **CI/CD**
- GitHub Actions for linting, type checks, tests, builds
- Vercel → Frontend deployment
- Render/Railway → Backend deployment
- Gitleaks + CodeQL for security scanning

---

## **5. Database Schema (Initial Draft)**
Key tables:
- **User** → authentication, roles, preferences
- **Expense** → daily & monthly tracking
- **Income** → salary, bonuses, and other earnings
- **Savings** → emergency fund + goals
- **Receipts** → uploads & OCR metadata
- **TaxReports** → reports, deductions, and filings

*(Final schema design will be completed during Prisma integration.)*

---

## **6. CI/CD Workflow**

### **Checks Run on Every PR**
- **Linting** → ESLint + Prettier
- **Type Checking** → TypeScript
- **Unit Tests** → Vitest
- **Client Build** → Ensures React compiles
- **Security Scans** → Gitleaks + optional CodeQL
- **Preview Deployments** → Vercel (frontend)

---

## **7. Security Strategy**
- Use **JWT + refresh tokens** for authentication.
- Apply **role-based authorization** (Admin, User).
- Store environment variables securely in GitHub Secrets.
- Integrate **Gitleaks** into CI to catch exposed keys.
- Enforce HTTPS in production.

---

## **8. Roadmap**

| **Phase** | **Goal**                                   | **Timeline** |
|-----------|-------------------------------------------|--------------|
| **Phase 1** | Setup monorepo, CI/CD, auth, dashboard     | Sept 2025 |
| **Phase 2** | Receipts, OCR, alerts, multi-currency      | Oct–Nov 2025 |
| **Phase 3** | Tax reporting, advanced analytics         | Dec 2025 |
| **Phase 4** | AI-powered recommendations               | Jan 2026 |

---

## **9. Next Steps**
- Finalize **database schema** during Prisma integration
- Extend CI/CD for automatic migrations
- Build core authentication and dashboard APIs
- Integrate AI-driven insights in later phases
