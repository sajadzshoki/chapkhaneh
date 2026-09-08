import { listFaqs } from '../repositories/content.repository'

export default defineEventHandler(async () => await listFaqs({ activeOnly: true }))
