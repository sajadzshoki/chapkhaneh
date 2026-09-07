import { listFaqs } from '../../repositories/content.repository'

export default defineEventHandler(async () => ({ items: await listFaqs() }))
