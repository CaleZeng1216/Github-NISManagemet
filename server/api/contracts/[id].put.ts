
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: '缺少合同ID' })

  const body = await readBody(event)
  const { contractNo, startDate, endDate, amount, description, status } = body

  const data: any = {}
  if (contractNo) data.contractNo = contractNo
  if (startDate) data.startDate = new Date(startDate)
  if (endDate) data.endDate = new Date(endDate)
  if (amount !== undefined) data.amount = amount ? Number(amount) : null
  if (description !== undefined) data.description = description || null
  if (status) data.status = status

  const contract = await prisma.maintenanceContract.update({
    where: { id: Number(id) },
    data,
    include: {
      project: { select: { id: true, name: true, hospitalName: true } },
    },
  })

  return contract
})
