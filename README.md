
# **Budget Tracker App** 🧾
> A personal financial management and tax reporting tool built with the **MERN + Prisma** stack, featuring **multi-tenant support**, **real-time expense tracking**, and **automated reporting**.

---

## **📌 Overview**
Budget Tracker is a **personal finance** and **tax assistant** designed to:
- Track **daily and monthly expenses**
- Manage **incomes, savings, and budgets**
- Upload **receipts and bank statements**
- Generate **reports for tax submissions**
- Provide **AI-powered insights** for financial decisions

---

## **🛠️ Tech Stack**

| **Layer**          | **Technology** |
|---------------------|----------------|
| **Frontend**       | React + TypeScript + Vite + ShadCN UI + TailwindCSS |
| **Backend**        | Node.js + Express + TypeScript |
| **Database**       | PostgreSQL + Prisma ORM |
| **Caching/Queue**  | Redis + BullMQ |
| **Authentication** | JWT + Refresh Tokens |
| **CI/CD**          | GitHub Actions + Vercel (client) + Render/Railway (server) |
| **AI Features**    | OpenAI / Local LLM integration (planned) |

---

## **📂 Project Structure**

\`\`\`
budget-app/
├── client/         # Frontend (React + Vite + TypeScript)
├── server/         # Backend (Node + Express + Prisma)
├── .github/        # GitHub Actions workflows
├── eslint.config.mjs   # Centralized ESLint config
├── package.json    # Root config (workspaces)
└── README.md       # You're here
\`\`\`

---

## **⚙️ Prerequisites**
Make sure you have these installed:
- **Node.js** \`>=20\`
- **npm** \`>=10\`
- **PostgreSQL** \`>=15\`
- **Redis** (optional for background jobs)
- **Git** & [GitHub Desktop](https://desktop.github.com/)

---

## **🚀 Getting Started**

### **1. Clone the Repository**
\`\`\`bash
git clone https://github.com/<your-username>/budget-app.git
cd budget-app
\`\`\`

### **2. Install Dependencies**
Since we’re using npm workspaces:
\`\`\`bash
npm install
\`\`\`

### **3. Set Up Environment Variables**

Create \`.env\` files in **root**, **server**, and **client**:

#### **Root \`.env\`**
\`\`\`ini
NODE_ENV=development
\`\`\`

#### **Server \`.env\`**
\`\`\`ini
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/budget_app
REDIS_URL=redis://localhost:6379
JWT_SECRET=super_secret_key
PORT=4000
\`\`\`

#### **Client \`.env\`**
\`\`\`ini
VITE_API_URL=http://localhost:4000
\`\`\`

---

## **💻 Running the Project**

### **Start Both Apps Together**
\`\`\`bash
npm run dev
\`\`\`

### **Start Individually**
**Server:**
\`\`\`bash
npm run dev -w server
\`\`\`
**Client:**
\`\`\`bash
npm run dev -w client
\`\`\`

---

## **🧪 Testing**
\`\`\`bash
npm run test
\`\`\`
- Uses **Vitest** for unit & integration tests.
- CI runs tests automatically on every pull request.

---

## **🧹 Linting & Type-Checking**

**Lint all workspaces:**
\`\`\`bash
npm run lint
\`\`\`
**Type-check both apps:**
\`\`\`bash
npm run typecheck
\`\`\`

---

## **🤖 CI/CD Pipeline**
Our CI/CD uses **GitHub Actions**:
- **Lint & Typecheck** → Ensures code quality
- **Run Tests** → Verifies functionality
- **Build Client** → Ensures frontend compiles
- **Security Scans** → Gitleaks + CodeQL
- **Deployments**:
  - **Client** → [Vercel](https://vercel.com/)
  - **Server** → [Render](https://render.com/) or [Railway](https://railway.app/)

---

## **🔐 Security**
- Environment variables stored securely in **GitHub Actions Secrets**.
- Gitleaks integrated to **detect accidental secrets** in commits.
- CodeQL (optional) provides static code security analysis.

---

## **📈 Roadmap**
- ✅ Monorepo setup  
- ✅ CI/CD integration  
- 🔄 Prisma + Postgres integration *(next)*  
- 🔄 Receipt OCR + AI insights  
- 🔄 Multi-tenant role-based dashboards  
- 🔄 Tax reporting module

---

## **🤝 Contributing**
We use **Husky** + **Lint-Staged** to enforce standards:
\`\`\`bash
npx husky install
\`\`\`
Before committing, code is **auto-linted**, **prettified**, and **type-checked**.

---

## **📜 License**
This project is licensed under the [MIT License](LICENSE).
