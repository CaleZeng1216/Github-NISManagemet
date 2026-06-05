
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const projectId = query.projectId as string | undefined

  const where: any = {}
  if (projectId) where.projectId = Number(projectId)

  const contracts = await prisma.maintenanceContract.findMany({
    where,
    include: {
      project: { select: { id: true, name: true, hospitalName: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return contracts
})
