import { listEquipment } from '../repositories/content.repository'

export default defineEventHandler(async () => await listEquipment({ activeOnly: true }))
