const TURKISH_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c',
  ğ: 'g', Ğ: 'g',
  ı: 'i', I: 'i', İ: 'i',
  ö: 'o', Ö: 'o',
  ş: 's', Ş: 's',
  ü: 'u', Ü: 'u',
  â: 'a', Â: 'a',
  î: 'i', Î: 'i',
  û: 'u', Û: 'u',
}

/**
 * URL-safe slug with Turkish transliteration:
 * "Kına Gecesi & Şölen" → "kina-gecesi-solen". Cuts at a word boundary.
 */
export function slugify(input: string, maxLength = 60): string {
  let s = (input || '').replace(/[çÇğĞıIİöÖşŞüÜâÂîÎûÛ]/g, (c) => TURKISH_MAP[c] ?? c)
  s = s.normalize('NFKD').replace(/[̀-ͯ]/g, '')
  s = s.toLowerCase()
  s = s.replace(/['’`]/g, '')
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (s.length > maxLength) {
    s = s.slice(0, maxLength)
    const cut = s.lastIndexOf('-')
    if (cut > maxLength * 0.5) s = s.slice(0, cut)
    s = s.replace(/-+$/g, '')
  }
  return s
}
