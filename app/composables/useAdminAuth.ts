interface AdminUser {
  id: string
  email: string
}

/**
 * Admin session state.
 *
 * The session itself lives in an httpOnly cookie the browser cannot read, so
 * this composable only mirrors the *identity* returned by `/api/admin/me` into
 * shared state. Nothing sensitive is stored client-side, and a page refresh
 * re-verifies against the server.
 */
export function useAdminAuth() {
  const user = useState<AdminUser | null>('admin-user', () => null)
  const checked = useState<boolean>('admin-user-checked', () => false)

  /** Verifies the cookie with the server. Cached per request/navigation. */
  async function fetchUser(force = false): Promise<AdminUser | null> {
    if (checked.value && !force) return user.value

    try {
      const { user: me } = await $fetch<{ user: AdminUser }>('/api/admin/me', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      user.value = me
    }
    catch {
      user.value = null
    }
    finally {
      checked.value = true
    }

    return user.value
  }

  async function login(email: string, password: string): Promise<void> {
    const { user: me } = await $fetch<{ user: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = me
    checked.value = true
  }

  async function logout(): Promise<void> {
    await $fetch('/api/admin/logout', { method: 'POST' })
    user.value = null
    checked.value = true
  }

  return {
    user,
    isAuthenticated: computed(() => Boolean(user.value)),
    fetchUser,
    login,
    logout,
  }
}
