import type { ListEvent } from '@/lib/events'
import { EventArt } from './EventArt'

type Props = {
  event: Pick<ListEvent, 'image' | 'title' | 'motif' | 'slug'>
  /** "card": 4:5 poster with title panel; "thumb": small square-ish tile without text */
  variant: 'card' | 'thumb'
  sizes?: string
  priority?: boolean
  className?: string
}

/** The event's photo, or its generated çini poster when there is no photo. */
export function EventVisual({ event, variant, sizes, priority = false, className = '' }: Props) {
  const { image } = event
  if (image?.card) {
    const srcSet = [image.thumb && `${image.thumb} 320w`, image.card && `${image.card} 640w`].filter(Boolean).join(', ')
    return (
      <img
        src={variant === 'thumb' ? (image.thumb ?? image.card) : image.card}
        srcSet={srcSet || undefined}
        sizes={sizes ?? (variant === 'thumb' ? '96px' : '(min-width: 1024px) 300px, (min-width: 640px) 42vw, 72vw')}
        alt={image.alt}
        width={640}
        height={800}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{ objectPosition: image.position }}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    )
  }
  return (
    <EventArt
      seed={event.slug}
      motif={event.motif}
      title={variant === 'card' ? event.title : undefined}
      scale={variant === 'thumb' ? 2.2 : 1}
      className={`absolute inset-0 ${className}`}
    />
  )
}
