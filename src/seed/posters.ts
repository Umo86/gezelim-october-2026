import sharp from 'sharp'

/*
 * Fake posters for sample events, drawn as SVG and rendered to JPEG, so the
 * photo pipeline (upload → resize → /img) can be seen working. Not real artwork.
 */

type Poster = { bg: string; ink: string; accent: string; lines: string[]; sub: string; shape: 'sun' | 'waves' | 'stars' | 'circles' | 'stripes' | 'spiral' }

export const POSTERS: Record<string, Poster> = {
  rock: { bg: '#0F1A33', ink: '#F7F4EE', accent: '#FF5A3C', lines: ['ANADOLU', 'ROCK', 'GECESİ'], sub: 'LONDRA · CANLI', shape: 'sun' },
  kahvalti: { bg: '#F2C14E', ink: '#3A1F0F', accent: '#C0392B', lines: ['PAZAR', 'KAHVALTISI', '& FASIL'], sub: 'DALSTON', shape: 'circles' },
  pop: { bg: '#E84393', ink: '#FFFFFF', accent: '#2D1B69', lines: ['TÜRKÇE', 'POP', 'GECESİ'], sub: '21:00 – 03:00', shape: 'stars' },
  ebru: { bg: '#1B6CA8', ink: '#FFFFFF', accent: '#F5B041', lines: ['EBRU', 'ATÖLYESİ'], sub: 'BRISTOL', shape: 'spiral' },
  festival: { bg: '#FF5A3C', ink: '#0F1A33', accent: '#F7F4EE', lines: ['SOKAK', 'LEZZETLERİ', 'FESTİVALİ'], sub: '2 GÜN · ÜCRETSİZ', shape: 'stripes' },
  sema: { bg: '#2C2C54', ink: '#F7F1E3', accent: '#D4AF37', lines: ['TASAVVUF', 'MÜZİĞİ', 'VE SEMA'], sub: 'WOOD GREEN', shape: 'waves' },
}

function shapes(p: Poster): string {
  switch (p.shape) {
    case 'sun':
      return `<circle cx="760" cy="420" r="300" fill="${p.accent}"/>${Array.from({ length: 9 }, (_, i) => `<rect x="0" y="${620 + i * 36}" width="1080" height="14" fill="${p.bg}"/>`).join('')}`
    case 'circles':
      return Array.from({ length: 12 }, (_, i) => `<circle cx="${(i % 4) * 300 + 120}" cy="${Math.floor(i / 4) * 260 + 140}" r="${90 + (i % 3) * 20}" fill="none" stroke="${p.accent}" stroke-width="18"/>`).join('')
    case 'stars':
      return Array.from({ length: 26 }, (_, i) => {
        const x = (i * 197) % 1080
        const y = (i * 113) % 760
        return `<polygon points="${x},${y - 40} ${x + 12},${y - 12} ${x + 40},${y} ${x + 12},${y + 12} ${x},${y + 40} ${x - 12},${y + 12} ${x - 40},${y} ${x - 12},${y - 12}" fill="${p.accent}"/>`
      }).join('')
    case 'spiral':
      return Array.from({ length: 10 }, (_, i) => `<path d="M ${-100 + i * 40} ${200 + i * 60} C 300 ${-100 + i * 70}, 700 ${500 + i * 30}, 1200 ${100 + i * 70}" fill="none" stroke="${i % 2 ? p.accent : '#FFFFFF'}" stroke-opacity="0.85" stroke-width="22"/>`).join('')
    case 'stripes':
      return Array.from({ length: 14 }, (_, i) => `<rect x="${i * 90 - 200}" y="-100" width="40" height="1000" fill="${p.accent}" transform="rotate(20 540 400)"/>`).join('')
    case 'waves':
      return Array.from({ length: 8 }, (_, i) => `<ellipse cx="540" cy="380" rx="${80 + i * 55}" ry="${60 + i * 42}" fill="none" stroke="${p.accent}" stroke-width="6" stroke-opacity="${1 - i * 0.1}"/>`).join('')
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function renderPoster(name: string): Promise<Buffer> {
  const p = POSTERS[name]
  const lineHeight = 150
  const top = 1350 - 140 - p.lines.length * lineHeight
  const text = p.lines
    .map(
      (line, i) =>
        `<text x="70" y="${top + (i + 1) * lineHeight - 20}" font-family="Poppins, DejaVu Sans, sans-serif" font-weight="800" font-size="148" fill="${p.ink}" letter-spacing="-4">${esc(line)}</text>`,
    )
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
    <rect width="1080" height="1350" fill="${p.bg}"/>
    ${shapes(p)}
    ${text}
    <text x="74" y="1290" font-family="Poppins, DejaVu Sans, sans-serif" font-weight="600" font-size="44" fill="${p.ink}" letter-spacing="6">${esc(p.sub)}</text>
  </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toBuffer()
}
