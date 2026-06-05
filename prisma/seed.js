import pkg from '@prisma/client'
const { PrismaClient } = pkg
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

async function main() {
  console.log('🌱 开始播种数据...')

  // 创建管理员
  const admin = await prisma.user.upsert({
    where: { email: 'admin@weigao.com' },
    update: {},
    create: {
      name: '系统管理员',
      email: 'admin@weigao.com',
      role: 'ADMIN',
      password: hashPassword('admin123'),
    },
  })
  console.log(`  ✓ 管理员: ${admin.email} / admin123`)

  // 创建项目经理
  const pm1 = await prisma.user.upsert({
    where: { email: 'zhangsan@weigao.com' },
    update: {},
    create: {
      name: '张三',
      email: 'zhangsan@weigao.com',
      phone: '13800138001',
      role: 'PM',
      password: hashPassword('123456'),
    },
  })

  const pm2 = await prisma.user.upsert({
    where: { email: 'lisi@weigao.com' },
    update: {},
    create: {
      name: '李四',
      email: 'lisi@weigao.com',
      phone: '13800138002',
      role: 'PM',
      password: hashPassword('123456'),
    },
  })
  console.log(`  ✓ 项目经理: ${pm1.email} / 123456`)
  console.log(`  ✓ 项目经理: ${pm2.email} / 123456`)

  // 创建示例项目
  const today = new Date()
  const project1 = await prisma.project.create({
    data: {
      name: '市中心医院NIS系统',
      hospitalName: '市中心医院',
      description: '护理信息系统实施项目',
      status: 'ACTIVE',
      warrantyStartDate: new Date('2024-01-15'),
      warrantyEndDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000), // 45天后到期
      managerId: pm1.id,
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: '省人民医院NIS系统',
      hospitalName: '省人民医院',
      description: '护理信息系统实施项目',
      status: 'ACTIVE',
      warrantyStartDate: new Date('2023-06-01'),
      warrantyEndDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10天前已过期
      managerId: pm2.id,
    },
  })

  const project3 = await prisma.project.create({
    data: {
      name: '区第一医院NIS系统',
      hospitalName: '区第一医院',
      description: '护理信息系统实施项目',
      status: 'IMPLEMENTING',
      warrantyStartDate: new Date('2025-01-01'),
      warrantyEndDate: new Date('2026-01-01'),
      managerId: pm1.id,
    },
  })

  const project4 = await prisma.project.create({
    data: {
      name: '市第二医院移动护理系统',
      hospitalName: '市第二医院',
      status: 'ACTIVE',
      warrantyStartDate: new Date('2023-03-01'),
      warrantyEndDate: new Date(today.getTime() + 75 * 24 * 60 * 60 * 1000), // 75天后到期
      managerId: pm2.id,
    },
  })

  console.log(`  ✓ 创建了4个示例项目`)

  // 创建示例运维合同（已过期项目的续签合同）
  const contract1 = await prisma.maintenanceContract.create({
    data: {
      projectId: project2.id,
      contractNo: 'YW-2024-001',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-06-01'),
      amount: 120000,
      description: '年度运维服务合同',
    },
  })

  console.log(`  ✓ 创建了示例合同`)

  // 创建提醒
  await prisma.warrantyAlert.createMany({
    data: [
      { projectId: project1.id, alertDate: new Date(), alertType: 'ONE_MONTH', isRead: false },
      { projectId: project2.id, alertDate: new Date(), alertType: 'EXPIRED', isRead: false },
      { projectId: project4.id, alertDate: new Date(), alertType: 'THREE_MONTH', isRead: false },
    ],
  })

  console.log(`  ✓ 创建了示例提醒`)
  console.log('🌱 数据播种完成！')
}

main()
  .catch((e) => {
    console.error('播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
