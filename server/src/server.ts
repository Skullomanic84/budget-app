import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { orgContext } from './middleware/org.js'
import { errorHandler } from './middleware/error.js'
import {
  createTransaction,
  listTransactions,
  updateTransaction,
  deleteTransaction,
} from './routes/transactions.js'
import {
  listCategories,
  createCategory,
  deleteCategory,
} from './routes/categories.js'
import { getMonthlySummary } from './routes/summary.js'
import { prisma } from './db.js'

const app = express()
app.use(express.json())
app.use(cors())
app.use(helmet())

app.get('/health/db', async (_req, res) => {
  const orgs = await prisma.org.count()
  res.json({ ok: true, orgs })
})

// All org routes share org context
app.use('/org/:orgId', orgContext)

// categories
app.get('/org/:orgId/categories', listCategories)
app.post('/org/:orgId/categories', createCategory)
app.delete('/org/:orgId/categories/:id', deleteCategory)

// transactions
app.get('/org/:orgId/transactions', listTransactions)
app.post('/org/:orgId/transactions', createTransaction)
app.patch('/org/:orgId/transactions/:id', updateTransaction)
app.delete('/org/:orgId/transactions/:id', deleteTransaction)

// monthly summary
app.get('/org/:orgId/summary', getMonthlySummary)

// error handler last
app.use(errorHandler)

app.listen(process.env.PORT ?? 4000, () =>
  console.log('API up on', process.env.PORT ?? 4000)
)
export default app
