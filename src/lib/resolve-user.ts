import { prisma } from '@/lib/prisma'

/**
 * Resolve a user by session data.
 * JWT tokens can carry a stale `id` after a DB reset/migration,
 * so we fall back to looking up by email.
 */
export async function resolveUser(sessionUser: { id?: string; email?: string | null }) {
  if (sessionUser.id) {
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (user) return user
  }
  if (sessionUser.email) {
    return prisma.user.findUnique({ where: { email: sessionUser.email } })
  }
  return null
}
