import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

export async function hashPassword(pwd: string) {
  return argon2.hash(pwd)
}
export async function verifyPassword(hash: string, pwd: string) {
  return argon2.verify(hash, pwd)
}

// Use a concrete jwt.Secret so the right overload is chosen
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET ?? 'dev_secret'

// Build a non-nullable type for expiresIn
type ExpiresIn = NonNullable<jwt.SignOptions['expiresIn']>

function computeExpires(raw?: string): ExpiresIn {
  const v = raw ?? '15m'
  // If it's just digits, treat as seconds (number)
  if (/^\d+$/.test(v)) return Number(v) as ExpiresIn
  // Otherwise use duration string e.g. "15m", "1h", "7d"
  return v as ExpiresIn
}

const EXPIRES_IN: ExpiresIn = computeExpires(process.env.ACCESS_TOKEN_TTL)

export function signAccessToken(payload: { userId: string; orgId?: string }) {
  // EXPIRES_IN is guaranteed non-undefined, matching the SignOptions contract
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    userId: string
    orgId?: string
    iat: number
    exp: number
  }
}
