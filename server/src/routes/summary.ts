// server/src/routes/summary.ts
import type { Request, Response } from 'express'
import { prisma } from '../db.js'

// Helper to safely coerce nullable decimals to numbers
function toNumber(value: unknown): number {
  return typeof value === 'number'
    ? value
    : value !== null && value !== undefined
      ? Number(value)
      : 0
}

export async function getMonthlySummary(req: Request, res: Response) {
  const orgId = req.orgId as string // ✅ uses Express type augmentation
  const month = String(req.query.month ?? '')

  // Validate YYYY-MM format
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'INVALID_MONTH_FORMAT' })
  }

  const start = new Date(`${month}-01`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)

  // Group transactions by type for the month
  const grouped = await prisma.transaction.groupBy({
    by: ['type'],
    where: {
      orgId,
      date: { gte: start, lt: end },
    },
    _sum: { amount: true },
  })

  // Coerce Prisma.Decimal | null → number safely
  const incomeTotal = toNumber(
    grouped.find((g) => g.type === 'INCOME')?._sum.amount
  )
  const expenseTotal = toNumber(
    grouped.find((g) => g.type === 'EXPENSE')?._sum.amount
  )

  return res.json({ month, incomeTotal, expenseTotal })
}
