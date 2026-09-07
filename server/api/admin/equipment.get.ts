import { listEquipment } from '../../repositories/content.repository'

export default defineEventHandler(async () => ({ items: await listEquipment() }))
