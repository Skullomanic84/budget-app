// server/src/middleware/requireAuth.ts
import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../lib/auth.js'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? ''
  const match = header.match(/^Bearer (.+)$/)
  const token = match?.[1] // string | undefined

  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED' })
  }

  try {
    const decoded = verifyAccessToken(token) // token is now string
    req.userId = decoded.userId
    // If you include orgId in the token later, you can set req.orgId = decoded.orgId
    next()
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED' })
  }
}
