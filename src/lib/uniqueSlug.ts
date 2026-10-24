import type { CollectionSlug, PayloadRequest } from 'payload'

/** Appends -2, -3… until no other document in the collection uses the slug. */
export async function uniqueSlug(args: {
  req: PayloadRequest
  collection: CollectionSlug
  slug: string
  id?: number | string
}): Promise<string> {
  const { req, collection, slug, id } = args
  let candidate = slug
  for (let n = 2; n < 200; n++) {
    const found = await req.payload.find({
      collection,
      where: {
        and: [{ slug: { equals: candidate } }, ...(id !== undefined ? [{ id: { not_equals: id } }] : [])],
      },
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: true,
      req,
    })
    if (found.docs.length === 0) return candidate
    candidate = `${slug}-${n}`
  }
  return `${slug}-${Date.now().toString(36)}`
}
