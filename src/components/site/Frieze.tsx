/** A thin band of çini stars, like the tile border along the top of a wall. */
export function Frieze({
  ground = '#1F3FBF',
  ink = '#F7F4EE',
  dot = '#FF5A3C',
  className = '',
}: {
  ground?: string
  ink?: string
  dot?: string
  className?: string
}) {
  const id = `frieze-${ground.slice(1)}-${ink.slice(1)}`
  const points: string[] = []
  for (let i = 0; i < 16; i++) {
    const a = ((i * 22.5 - 90) * Math.PI) / 180
    const r = i % 2 === 0 ? 9 : 4.2
    points.push(`${(14 + r * Math.cos(a)).toFixed(2)},${(14 + r * Math.sin(a)).toFixed(2)}`)
  }
  return (
    <svg className={`block h-7 w-full ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="28" fill={ground} />
          <polygon points={points.join(' ')} fill={ink} />
          <circle cx="14" cy="14" r="2" fill={dot} />
          <circle cx="0" cy="0" r="2.5" fill={ink} />
          <circle cx="28" cy="0" r="2.5" fill={ink} />
          <circle cx="0" cy="28" r="2.5" fill={ink} />
          <circle cx="28" cy="28" r="2.5" fill={ink} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
