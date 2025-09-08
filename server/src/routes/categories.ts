// server/src/routes/categories.ts
import type { Request, Response } from 'express'
import { prisma } from '../db.js'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().max(50).optional(),
})

// for /:id param
const idParamSchema = z.string().uuid()

export async function listCategories(req: Request, res: Response) {
  const orgId = req.orgId as string
  const categories = await prisma.category.findMany({
    where: { orgId },
    orderBy: { name: 'asc' },
  })
  res.json(categories)
}

export async function createCategory(req: Request, res: Response) {
  const orgId = req.orgId as string

  const parsed = createCategorySchema.safeParse(req.body)
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() })
  }

  const cat = await prisma.category.create({
    data: {
      orgId,
      name: parsed.data.name,
      code: parsed.data.code ?? null, // Prisma wants null, not undefined
    },
  })
  res.status(201).json(cat)
}

export async function deleteCategory(req: Request, res: Response) {
  const orgId = req.orgId as string
  const catId = idParamSchema.parse(req.params.id) // ensures defined & valid UUID

  // Enforce tenant boundary and avoid unique-union typing issues
  const result = await prisma.category.deleteMany({
    where: { id: catId, orgId },
  })

  if (result.count === 0) {
    return res
      .status(404)
      .json({ error: 'NOT_FOUND', message: 'Category not found' })
  }

  res.status(204).end()
}

