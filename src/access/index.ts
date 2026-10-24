import type { Access, FieldAccess } from 'payload'

type StaffUser = { id: number | string; role?: 'admin' | 'editor' | null } | null | undefined

const userOf = (req: { user?: unknown }): StaffUser => req.user as StaffUser

/** Anyone signed in to the admin panel (admins and editors). */
export const isStaff: Access = ({ req }) => Boolean(userOf(req))

export const isAdmin: Access = ({ req }) => userOf(req)?.role === 'admin'

export const anyone: Access = () => true

/** The public sees published documents only; staff see drafts too. */
export const publishedOrStaff: Access = ({ req }) => {
  if (userOf(req)) return true
  return { _status: { equals: 'published' } }
}

/** For private fields such as an organiser's phone number. */
export const staffOnlyField: FieldAccess = ({ req }) => Boolean(userOf(req))

export const adminOnlyField: FieldAccess = ({ req }) => userOf(req)?.role === 'admin'

/**
 * Organisers, venues and images that arrived with a public submission stay hidden
 * from visitors (and the public API) until staff publish the event they came with.
 */
export const approvedOrStaff: Access = ({ req }) => {
  if (userOf(req)) return true
  return { pending: { not_equals: true } }
}
