/**
 * Route guard for the admin area.
 *
 * Applied via `definePageMeta({ middleware: 'admin-auth' })` on admin pages.
 * Runs on both server and client so a direct URL hit or a refresh is guarded
 * before any admin markup is rendered.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { fetchUser } = useAdminAuth()
  const user = await fetchUser()

  const isLoginPage = to.path === '/admin/login'

  if (!user && !isLoginPage) {
    return navigateTo({ path: '/admin/login', query: { redirect: to.fullPath } })
  }

  if (user && isLoginPage) {
    return navigateTo('/admin')
  }
})
