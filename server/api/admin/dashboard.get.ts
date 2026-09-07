import { getDashboardStats, listQuoteRequests } from '../../repositories/content.repository'

export default defineEventHandler(async () => {
  const [stats, recentQuoteRequests] = await Promise.all([
    getDashboardStats(),
    listQuoteRequests({ limit: 5 }),
  ])

  return { stats, recentQuoteRequests }
})
