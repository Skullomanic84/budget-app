import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    orgId?: string
    userId?: string
  }
}
