import { startWarrantyCheckTask } from '../tasks/warranty-check'

export default defineNitroPlugin(() => {
  startWarrantyCheckTask()
})
