import { listPortfolioCategories, listPortfolioItems } from '../../repositories/content.repository'

export default defineEventHandler(async () => {
  const [categories, items] = await Promise.all([
    listPortfolioCategories(),
    listPortfolioItems({ activeOnly: true }),
  ])
  return { categories, items }
})
