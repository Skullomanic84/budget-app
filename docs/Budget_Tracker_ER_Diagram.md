
# Budget Tracker App — ER Diagram (Markdown)

This document shows a **visual ER diagram** (Mermaid) of the current MVP data model, plus optional **Phase 2 extensions**.  
Paste into any Mermaid-enabled Markdown viewer (e.g., GitHub, Obsidian with Mermaid, or mermaid.live) to render.

---

## MVP Entities & Relationships

```mermaid
erDiagram
    %% =====================
    %% RELATIONSHIPS
    %% =====================
    Org ||--o{ OrgMember : has
    Org ||--o{ Category  : has
    Org ||--o{ Transaction : has
    Org ||--o{ Receipt   : has
    Org ||--o{ Report    : has

    User ||--o{ OrgMember : joins
    User ||--o{ Transaction : creates
    User ||--o{ Receipt   : uploads
    User ||--o{ Report    : requests

    Category ||--o{ Transaction : classifies
    Transaction ||--o{ Receipt : attaches

    %% =====================
    %% TABLES
    %% =====================
    Org {
      uuid id PK
      string name
      string slug "UNIQUE"
      datetime createdAt
      datetime updatedAt
    }

    User {
      uuid id PK
      string email "UNIQUE"
      string name
      string passwordHash
      datetime createdAt
      datetime updatedAt
    }

    OrgMember {
      uuid id PK
      uuid orgId FK
      uuid userId FK
      enum role "OWNER | ADMIN | ACCOUNTANT | USER"
      datetime createdAt
      unique orgId_userId
    }

    Category {
      uuid id PK
      uuid orgId FK
      string name
      string code "optional; map to SARS"
      datetime createdAt
      unique orgId_name
    }

    Transaction {
      uuid id PK
      uuid orgId FK
      uuid userId FK
      enum type "INCOME | EXPENSE"
      decimal amount "DECIMAL(14,2)"
      string currency "default ZAR"
      datetime date
      uuid categoryId FK "nullable"
      string notes "nullable"
      boolean isRecurring
      datetime nextDueDate "nullable"
      datetime createdAt
      datetime updatedAt
    }

    Receipt {
      uuid id PK
      uuid orgId FK
      uuid transactionId FK "nullable"
      uuid userId FK
      string fileKey "S3/Cloudinary key"
      string mimeType
      int sizeBytes
      string ocrText "nullable"
      string vendor "nullable"
      decimal detectedAmount "DECIMAL(14,2), nullable"
      datetime detectedDate "nullable"
      datetime createdAt
      index orgId_transactionId
    }

    Report {
      uuid id PK
      uuid orgId FK
      uuid userId FK
      int taxYear
      string url "nullable"
      string status "pending|processing|ready|failed"
      datetime createdAt
      unique orgId_taxYear
    }
```

---

## Field Notes
- **Multi-tenancy**: All domain tables carry `orgId` → hard tenant boundary.
- **Money**: Use `DECIMAL(14,2)` for `amount` to avoid float issues.
- **Soft delete**: Not in MVP. Add `deletedAt` later if needed.
- **Auditability**: Keep `createdAt/updatedAt` everywhere by default.
- **Attachments**: `Receipt.fileKey` should be unique if using immutable keys.

---

## Example Prisma Access Patterns

### Create a transaction (EXPENSE)
```ts
await prisma.transaction.create({
  data: {
    orgId,
    userId,
    type: 'EXPENSE',
    amount: 499.99,
    currency: 'ZAR',
    date: new Date(),
    categoryId,       // or null
    notes: 'Groceries at Checkers' // or null
  }
})
```

### This month’s totals
```ts
const start = new Date('2025-09-01')
const end = new Date('2025-10-01')

const grouped = await prisma.transaction.groupBy({
  by: ['type'],
  where: { orgId, date: { gte: start, lt: end } },
  _sum: { amount: true }
})
```

---

## Phase 2 — Optional Extensions (Preview)

```mermaid
erDiagram
    Org ||--o{ Budget : has
    Org ||--o{ AuditLog : captures

    Budget {
      uuid id PK
      uuid orgId FK
      string name
      decimal monthlyLimit "DECIMAL(14,2)"
      uuid categoryId FK "optional; category-specific ceilings"
      datetime createdAt
      datetime updatedAt
    }

    AuditLog {
      uuid id PK
      uuid orgId FK
      uuid userId FK "nullable for system events"
      string action "CREATE|UPDATE|DELETE|LOGIN|UPLOAD ..."
      string entity "Transaction|Category|Receipt|Report ..."
      string entityId "uuid/plain id as string"
      json   meta "diffs, IP, userAgent ..."
      datetime createdAt
    }
```

**Why these matter**
- **Budget**: power alerts (BullMQ), dashboards (remaining vs spent), category caps.
- **AuditLog**: compliance trail (who did what, when); crucial for accountant view.

---

## Quick Validation Tips
- Validate inputs with **Zod** (`z.coerce.date()`, enums, positive amounts).
- Always **filter by `orgId`** on queries.
- Use indexes for hot filters: `orgId`, `date`, `type` (add in Prisma if needed).
- Prefer **nullable columns** mapped to `null` (not `undefined`) in Prisma writes.

---

**Last updated:** 2025-09-08
