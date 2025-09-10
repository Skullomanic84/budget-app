import type { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db.js'
import { hashPassword, verifyPassword, signAccessToken } from '../lib/auth.js'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

/** POST /auth/register → { accessToken, user } */
export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() })
  }
  const { email, password, name } = parsed.data

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists)
    return res
      .status(409)
      .json({ error: 'CONFLICT', message: 'Email already in use.' })

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, passwordHash, name: name ?? null },
    select: { id: true, email: true, name: true },
  })

  const accessToken = signAccessToken({ userId: user.id })
  return res.status(201).json({ accessToken, user })
}

/** POST /auth/login → { accessToken, user } */
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: 'VALIDATION_ERROR', details: parsed.error.flatten() })
  }
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user)
    return res
      .status(401)
      .json({ error: 'AUTH_REQUIRED', message: 'Invalid credentials.' })

  const ok = await verifyPassword(user.passwordHash, password)
  if (!ok)
    return res
      .status(401)
      .json({ error: 'AUTH_REQUIRED', message: 'Invalid credentials.' })

  const accessToken = signAccessToken({ userId: user.id })
  return res.json({
    accessToken,
    user: { id: user.id, email: user.email, name: user.name },
  })
}

/** POST /auth/logout → 204 (stateless JWT; client discards token) */
export async function logout(_req: Request, res: Response) {
  return res.status(204).end()
}
