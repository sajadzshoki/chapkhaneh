import { listPortfolioCategories } from '../../repositories/content.repository'

export default defineEventHandler(async () => ({ items: await listPortfolioCategories() }))
