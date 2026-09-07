import { adminListPortfolioCategories } from '../../../repositories/admin.repository'

export default defineEventHandler(async () => ({ items: await adminListPortfolioCategories() }))
