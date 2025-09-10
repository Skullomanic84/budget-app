import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../src/server.js'
import { prisma } from '../src/db.js'

describe('auth (JWT access only)', () => {
  const email = `user_${Date.now()}@test.local`
  const password = 'Password123!'
  let access: string | undefined
  let orgId: string | undefined
  let userId: string | undefined

  beforeAll(async () => {
    await prisma.$queryRaw`SELECT 1`
  })

  afterAll(async () => {
    if (orgId) {
      await prisma.orgMember.deleteMany({ where: { orgId } }).catch(() => {})
      await prisma.category.deleteMany({ where: { orgId } }).catch(() => {})
      await prisma.transaction.deleteMany({ where: { orgId } }).catch(() => {})
      await prisma.receipt.deleteMany({ where: { orgId } }).catch(() => {})
      await prisma.report.deleteMany({ where: { orgId } }).catch(() => {})
      await prisma.org.deleteMany({ where: { id: orgId } }).catch(() => {})
    }
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } }).catch(() => {})
    }
    await prisma.$disconnect()
  })

  it('register → login → protected route → logout', async () => {
    const reg = await request(app)
      .post('/auth/register')
      .send({ email, password, name: 'User T' })
    expect(reg.status).toBe(201)
    expect(reg.body?.accessToken).toBeDefined()
    userId = reg.body?.user?.id

    const login = await request(app)
      .post('/auth/login')
      .send({ email, password })
    expect(login.status).toBe(200)
    access = login.body?.accessToken
    expect(access).toBeDefined()

    const org = await prisma.org.create({
      data: { name: 'T', slug: `t-${Date.now()}` },
    })
    orgId = org.id

    const listCats = await request(app)
      .get(`/org/${orgId}/categories`)
      .set('authorization', `Bearer ${access}`)
    expect(listCats.status).toBe(200)

    const logout = await request(app).post('/auth/logout')
    expect(logout.status).toBe(204)

    // client discards token → simulate missing token
    const noAuth = await request(app).get(`/org/${orgId}/categories`)
    expect([401, 400]).toContain(noAuth.status)
  })
})
