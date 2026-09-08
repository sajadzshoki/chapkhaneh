import type { ServiceDto } from '~~/server/database/mappers'

/**
 * ---------------------------------------------------------------------------
 * Public content access
 * ---------------------------------------------------------------------------
 * The database is the source of truth. These composables wrap `useAsyncData`
 * so each dataset is fetched once per request and shared across every
 * component that asks for it (payload-transferred to the client, no refetch).
 *
 * Keys are stable strings so Nuxt dedupes concurrent callers — the home page
 * asking for services and the footer asking for services issue one query.
 */

export interface PortfolioItemDto {
  id: string
  slug: string
  categoryId: string
  categorySlug: string
  title: Record<'fa' | 'en', string>
  client: Record<'fa' | 'en', string>
  description: Record<'fa' | 'en', string>
  details: { label: Record<'fa' | 'en', string>, value: Record<'fa' | 'en', string> }[]
  image: { src: string, alt: Record<'fa' | 'en', string> }
  gallery: { src: string, alt: Record<'fa' | 'en', string> }[]
  serviceSlugs: string[]
  year: number
  featured: boolean
  order: number
}

export interface PortfolioCategoryDto {
  id: string
  slug: string
  title: Record<'fa' | 'en', string>
  description?: Record<'fa' | 'en', string>
  order: number
}

export interface ImageDto {
  src: string
  alt: Record<'fa' | 'en', string>
  width?: number
  height?: number
}

export interface EquipmentDto {
  id: string
  slug: string
  type: string
  name: string
  manufacturer: string
  model: string
  installedYear?: number
  title: Record<'fa' | 'en', string>
  typeLabel: Record<'fa' | 'en', string>
  description: Record<'fa' | 'en', string>
  specs: { label: Record<'fa' | 'en', string>, value: Record<'fa' | 'en', string> }[]
  image?: { src: string, alt: Record<'fa' | 'en', string> }
  order: number
}

export interface FaqDto {
  id: string
  category: string
  question: Record<'fa' | 'en', string>
  answer: Record<'fa' | 'en', string>
  order: number
}

export interface PricingGroupDto {
  id: string
  serviceSlug: string
  title: Record<'fa' | 'en', string>
  rows: {
    id: string
    title: Record<'fa' | 'en', string>
    quantity: number
    quantityLabel: Record<'fa' | 'en', string>
    specification: Record<'fa' | 'en', string>
    unit: Record<'fa' | 'en', string>
    price: number
    currency: string
    turnaround?: Record<'fa' | 'en', string>
    note?: Record<'fa' | 'en', string>
    order: number
  }[]
}

/**
 * Each helper returns the `useAsyncData` handle and must be awaited in
 * `<script setup>` (`const { data } = await useServices()`), so that during SSR
 * the data is present before the component renders. Without the await, a page
 * that resolves a slug against the list would see an empty array and render a
 * false "not found".
 */
export function useServices() {
  return useAsyncData('services', () => $fetch<ServiceDto[]>('/api/services'), {
    default: () => [] as ServiceDto[],
  })
}

export function useEquipment() {
  return useAsyncData('equipment', () => $fetch<EquipmentDto[]>('/api/equipment'), {
    default: () => [] as EquipmentDto[],
  })
}

export function useFaqs() {
  return useAsyncData('faqs', () => $fetch<FaqDto[]>('/api/faqs'), {
    default: () => [] as FaqDto[],
  })
}

export function usePricing() {
  return useAsyncData('pricing', () => $fetch<PricingGroupDto[]>('/api/pricing'), {
    default: () => [] as PricingGroupDto[],
  })
}

export function usePortfolio() {
  return useAsyncData(
    'portfolio',
    () => $fetch<{ categories: PortfolioCategoryDto[], items: PortfolioItemDto[] }>('/api/portfolio'),
    { default: () => ({ categories: [] as PortfolioCategoryDto[], items: [] as PortfolioItemDto[] }) },
  )
}

export type { ServiceDto }
