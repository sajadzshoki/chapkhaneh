import { adminDashboard } from '../../repositories/admin.repository'

export default defineEventHandler(async () => await adminDashboard())
