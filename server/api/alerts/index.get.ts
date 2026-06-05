
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const query = getQuery(event)
  const isRead = query.isRead as string | undefined

  const where: any = {}

  // 非管理员只能看自己负责项目的提醒
  if (session.role !== 'ADMIN') {
    where.project = { managerId: session.userId }
  }

  if (isRead !== undefined) where.isRead = isRead === 'true'

  const alerts = await prisma.warrantyAlert.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          hospitalName: true,
          warrantyEndDate: true,
          manager: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return alerts
})
