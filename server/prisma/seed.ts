import { PrismaClient, Role, TxnType } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const org = await prisma.org.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { name: 'Demo Org', slug: 'demo' },
  })

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash: 'dev_only',
      name: 'Demo User',
    },
  })

  await prisma.orgMember.upsert({
    where: { orgId_userId: { orgId: org.id, userId: user.id } },
    update: {},
    create: { orgId: org.id, userId: user.id, role: Role.OWNER },
  })

  const groceries = await prisma.category.upsert({
    where: { orgId_name: { orgId: org.id, name: 'Groceries' } },
    update: {},
    create: { orgId: org.id, name: 'Groceries' },
  })

  await prisma.transaction.createMany({
    data: [
      {
        orgId: org.id,
        userId: user.id,
        type: TxnType.INCOME,
        amount: 25000.0,
        currency: 'ZAR',
        date: new Date(),
        notes: 'Salary (PAYE deducted)',
      },
      {
        orgId: org.id,
        userId: user.id,
        type: TxnType.EXPENSE,
        amount: 1200.5,
        currency: 'ZAR',
        date: new Date(),
        categoryId: groceries.id,
        notes: 'Monthly groceries',
      },
    ],
  })

  console.log('Seed complete:', { org: org.slug, user: user.email })
}
main().finally(() => prisma.$disconnect())
