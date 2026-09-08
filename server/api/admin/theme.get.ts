import { adminGetTheme } from '../../repositories/admin.repository'

export default defineEventHandler(async () => {
  return await adminGetTheme()
})
