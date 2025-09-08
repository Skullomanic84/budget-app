import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { z } from 'zod'
import { prisma } from './db.js' // ✅ ESM import

const app = express()
app.use(express.json())
app.use(cors())
app.use(helmet())

app.get('/health/db', async (_req, res) => {
  const orgs = await prisma.org.count()
  res.json({ ok: true, orgs })
})

const txnSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive(),
  currency: z.string().default('ZAR'),
  date: z.coerce.date(),
  categoryId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
})

app.post('/org/:orgId/transactions', async (req, res) => {
  const { orgId } = req.params
  const userId =
    req.header('x-mock-user') ?? '00000000-0000-0000-0000-000000000001'

  const parsed = txnSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json(parsed.error.flatten())

  const d = parsed.data
  const txn = await prisma.transaction.create({
    data: {
      orgId,
      userId,
      type: d.type,
      amount: d.amount,
      currency: d.currency,
      date: d.date,
      categoryId: d.categoryId ?? null, // ✅
      notes: d.notes ?? null, // ✅
    },
  })
  res.status(201).json(txn)
})

app.get('/org/:orgId/transactions', async (req, res) => {
  const { orgId } = req.params
  const { from, to, type } = req.query

  const dateFilter: Record<string, Date> = {}
  if (from) dateFilter.gte = new Date(String(from))
  if (to) dateFilter.lte = new Date(String(to))

  const where = {
    orgId,
    ...(type ? { type: type as any } : {}),
    ...(from || to ? { date: dateFilter } : {}),
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: 100,
  })
  res.json(transactions)
})

app.listen(process.env.PORT ?? 4000, () =>
  console.log('API up on', process.env.PORT ?? 4000)
)
export default app
