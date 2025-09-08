// server/src/routes/transactions.ts
import type { Request, Response } from 'express'
import { prisma } from '../db.js'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

// ---------- Schemas ----------
const createTxnSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive(),
  currency: z.string().default('ZAR'),
  date: z.coerce.date(),
  categoryId: z.string().uuid().nullable().optional(), // allow null explicitly
  notes: z.string().max(500).nullable().optional(),
  isRecurring: z.boolean().optional(),
  nextDueDate: z.coerce.date().nullable().optional(),
})

const patchTxnSchema = createTxnSchema.partial()

const idParam = z.string().uuid()

// ---------- Handlers ----------
export async function createTransaction(req: Request, res: Response) {
  const orgId = req.orgId as string
  const userId = req.userId ?? '00000000-0000-0000-0000-000000000001' // replace once auth is fully wired

  const parsed = createTxnSchema.safeParse(req.body)
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() })
  }

  const d = parsed.data
  const txn = await prisma.transaction.create({
    data: {
      orgId,
      userId,
      type: d.type,
      amount: d.amount,
      currency: d.currency,
      date: d.date,
      // Prisma wants null for nullable fields, not undefined:
      categoryId: d.categoryId ?? null,
      notes: d.notes ?? null,
      isRecurring: d.isRecurring ?? false,
      nextDueDate: d.nextDueDate ?? null,
    },
  })
  res.status(201).json(txn)
}

export async function listTransactions(req: Request, res: Response) {
  const orgId = req.orgId as string
  const { from, to, type, categoryId } = req.query as Record<
    string,
    string | undefined
  >

  const qType: 'INCOME' | 'EXPENSE' | undefined =
    type === 'INCOME' || type === 'EXPENSE'
      ? (type as 'INCOME' | 'EXPENSE')
      : undefined

  const dateFilter: Record<string, Date> = {}
  if (from) dateFilter.gte = new Date(from)
  if (to) dateFilter.lte = new Date(to)

  const where: Prisma.TransactionWhereInput = {
    orgId,
    ...(qType ? { type: qType } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(from || to ? { date: dateFilter } : {}),
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: 100,
  })
  res.json(transactions)
}

export async function updateTransaction(req: Request, res: Response) {
  const orgId = req.orgId as string
  const txnId = idParam.parse(req.params.id)

  const parsed = patchTxnSchema.safeParse(req.body)
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() })
  }
  const d = parsed.data

  // Build data object with correct null/undefined semantics.
  // - If a field is omitted, leave it undefined (won't change).
  // - If provided as null (for nullable fields), set to null.
  const data: Prisma.TransactionUpdateInput = {
    ...(d.type !== undefined ? { type: d.type } : {}),
    ...(d.amount !== undefined ? { amount: d.amount } : {}),
    ...(d.currency !== undefined ? { currency: d.currency } : {}),
    ...(d.date !== undefined ? { date: d.date } : {}),
    ...(d.categoryId !== undefined ? { categoryId: d.categoryId } : {}), // can be string or null
    ...(d.notes !== undefined ? { notes: d.notes } : {}), // can be string or null
    ...(d.isRecurring !== undefined ? { isRecurring: d.isRecurring } : {}),
    ...(d.nextDueDate !== undefined ? { nextDueDate: d.nextDueDate } : {}), // can be Date or null
  }

  // Safer multi-tenant update:
  const result = await prisma.transaction.updateMany({
    where: { id: txnId, orgId }, // scoped to tenant
    data,
  })

  if (result.count === 0) {
    return res
      .status(404)
      .json({ error: 'NOT_FOUND', message: 'Transaction not found' })
  }

  // Return the updated row
  const updated = await prisma.transaction.findUnique({ where: { id: txnId } })
  res.json(updated)
}

export async function deleteTransaction(req: Request, res: Response) {
  const orgId = req.orgId as string
  const txnId = idParam.parse(req.params.id)

  const result = await prisma.transaction.deleteMany({
    where: { id: txnId, orgId },
  })

  if (result.count === 0) {
    return res
      .status(404)
      .json({ error: 'NOT_FOUND', message: 'Transaction not found' })
  }

  res.status(204).end()
}
