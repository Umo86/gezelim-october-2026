import type { Field, FieldHook, Option } from 'payload'
import { CATEGORIES } from '@/config/categories'
import { CITIES } from '@/config/places'
import { slugify } from '@/lib/slugify'

export const cityOptions: Option[] = CITIES.map((c) => ({
  label: { tr: c.name.tr, en: c.name.en },
  value: c.slug,
}))

export const categoryOptions: Option[] = CATEGORIES.map((c) => ({
  label: { tr: c.name.tr, en: c.name.en },
  value: c.value,
}))

export const spokenOptions: Option[] = [
  { label: { tr: 'Türkçe', en: 'Turkish' }, value: 'tr' },
  { label: { tr: 'İngilizce', en: 'English' }, value: 'en' },
  { label: { tr: 'Türkçe ve İngilizce', en: 'Turkish and English' }, value: 'both' },
  { label: { tr: 'Dil gerekmiyor (müzik vb.)', en: 'No language needed (music etc.)' }, value: 'none' },
]

export const ageOptions: Option[] = [
  { label: { tr: 'Her yaş', en: 'All ages' }, value: 'all' },
  { label: '16+', value: '16' },
  { label: '18+', value: '18' },
]

/** A slug field that fills itself from another field when left empty. */
export function slugField(sourceField: string, opts: { unique?: boolean } = {}): Field {
  const formatSlug: FieldHook = ({ value, data, originalDoc, operation }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    if (operation === 'update' && originalDoc?.slug) return originalDoc.slug
    const source = data?.[sourceField] ?? originalDoc?.[sourceField]
    const text = typeof source === 'string' ? source : (source?.tr ?? source?.en ?? '')
    return text ? slugify(String(text)) : value
  }
  return {
    name: 'slug',
    type: 'text',
    index: true,
    unique: opts.unique ?? true,
    label: { tr: 'Adres (slug)', en: 'URL slug' },
    admin: {
      position: 'sidebar',
      description: {
        tr: 'Boş bırakırsan otomatik oluşur. Yayından sonra değiştirmek eski bağlantıları bozar.',
        en: 'Fills itself if left empty. Changing it after publishing breaks old links.',
      },
    },
    hooks: { beforeValidate: [formatSlug] },
  }
}

export const isSampleField: Field = {
  name: 'isSample',
  type: 'checkbox',
  defaultValue: false,
  label: { tr: 'Örnek kayıt', en: 'Sample record' },
  admin: {
    position: 'sidebar',
    description: {
      tr: 'Tasarımı göstermek için eklenen sahte kayıt. Sitede "Örnek" etiketiyle görünür.',
      en: 'Made-up record used to show the design. Shown with a "Sample" label on the site.',
    },
  },
}
