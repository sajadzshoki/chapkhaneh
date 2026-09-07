import { services } from '~~/shared/data/services'

/**
 * Content is currently served from typed mock data. Exposing it through a
 * server route now means the switch to a database-backed source in a later
 * phase requires no change on the client side.
 */
export default defineEventHandler(() => services)
