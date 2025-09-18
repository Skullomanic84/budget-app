import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

import { prisma } from './db.js'
import { requireAuth } from './middleware/requireAuth.js'
import { orgContext } from './middleware/org.js'
import { errorHandler } from './middleware/error.js'

// Routes
import { register, login, logout } from './routes/auth.js'
import {
  listCategories,
  createCategory,
  deleteCategory,
} from './routes/categories.js'
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from './routes/transactions.js'
import { getMonthlySummary } from './routes/summary.js'

// CORS config: allow credentials (cookies) from your frontend origin
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? true

const app = express()
app.use(helmet())
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true, // <-- allow cookies over CORS
  })
)
app.use(express.json())
app.use(cookieParser()) // <-- enables req.cookies.rt, etc.

// Health
app.get('/health/db', async (_req, res) => {
  const orgs = await prisma.org.count()
  res.json({ ok: true, orgs })
})

// Auth
app.post('/auth/register', register)
app.post('/auth/login', login)
app.post('/auth/logout', logout)

// Protected org routes
app.use('/org/:orgId', requireAuth, orgContext)

app.get('/org/:orgId/categories', listCategories)
app.post('/org/:orgId/categories', createCategory)
app.delete('/org/:orgId/categories/:id', deleteCategory)

app.get('/org/:orgId/transactions', listTransactions)
app.post('/org/:orgId/transactions', createTransaction)
app.patch('/org/:orgId/transactions/:id', updateTransaction)
app.delete('/org/:orgId/transactions/:id', deleteTransaction)

app.get('/org/:orgId/summary', getMonthlySummary)

// Errors last
app.use(errorHandler)

const port = Number(process.env.PORT ?? 4000)
app.listen(port, () => {

  console.log('API up on', port)
})

export default app
