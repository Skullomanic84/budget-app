// server/src/middleware/org.ts
import type { Request, Response, NextFunction } from 'express'

export function orgContext(req: Request, res: Response, next: NextFunction) {
  const { orgId } = req.params

  if (!orgId) {
    return res.status(400).json({ error: 'ORG_ID_REQUIRED' })
  }

  req.orgId = orgId

  next()
}
