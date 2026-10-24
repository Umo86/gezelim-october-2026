'use client'

import { HoverLink as Link } from './HoverLink'
import Script from 'next/script'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useId, useRef, useState, useTransition, type ReactNode } from 'react'
import { CATEGORIES } from '@/config/categories'
import { citiesForPicker, getCity } from '@/config/places'
import type { Lang } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionary'
import { paths } from '@/i18n/paths'
import { submitEvent, type SubmitResult } from '@/app/(frontend)/[place]/[lang]/add-event/actions'
import { CheckIcon } from './icons'

const MAX_EDGE = 2000

/** Shrinks big photos in the browser before upload: faster for phones, and under hosting limits. */
async function resizeImage(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86))
    return blob ?? file
  } catch {
    return file
  }
}

function CityDefault({ onCity }: { onCity: (c: string) => void }) {
  const params = useSearchParams()
  useEffect(() => {
    const c = params.get('city')
    if (c && getCity(c)) onCity(c)
  }, [params, onCity])
  return null
}

type FieldProps = {
  name: string
  label: string
  required?: boolean
  help?: string
  error?: string
  children: (a11y: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string; required?: boolean }) => ReactNode
  requiredLabel: string
}

function Field({ name, label, required, help, error, children, requiredLabel }: FieldProps) {
  const id = `f-${name}`
  const helpId = help ? `${id}-help` : undefined
  const errorId = error ? `${id}-error` : undefined
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? (
          <span className="text-mercan" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> ({requiredLabel})</span> : null}
      </label>
      {children({
        id,
        ...(error ? { 'aria-invalid': true as const } : {}),
        ...(helpId || errorId ? { 'aria-describedby': [helpId, errorId].filter(Boolean).join(' ') } : {}),
        ...(required ? { required: true } : {}),
      })}
      {help ? (
        <span id={helpId} className="field-help">
          {help}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="field-error">
          {error}
        </span>
      ) : null}
    </div>
  )
}

export function SubmitEventForm({ lang, turnstileSiteKey }: { lang: Lang; turnstileSiteKey?: string }) {
  const t = getDictionary(lang).form
  const formRef = useRef<HTMLFormElement>(null)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [pending, startTransition] = useTransition()
  const [writtenIn, setWrittenIn] = useState<Lang>(lang)
  const [city, setCity] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [image, setImage] = useState<{ blob: Blob; name: string; preview: string } | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  // When the form appeared; very fast submissions are bots.
  const startedAt = useRef(0)
  const [summaryLength, setSummaryLength] = useState(0)
  const summaryId = useId()

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])
  useEffect(() => () => {
    if (image) URL.revokeObjectURL(image.preview)
  }, [image])

  const errors = result && !result.ok ? result.errors : {}
  const cities = citiesForPicker(lang)
  const otherName = writtenIn === 'tr' ? 'English' : 'Türkçe'
  const today = new Date().toISOString().slice(0, 10)

  const onFile = async (file: File | undefined) => {
    setImageError(null)
    if (!file) return setImage(null)
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setImage(null)
      return setImageError(t.errors.imageType)
    }
    const blob = await resizeImage(file)
    if (blob.size > 4 * 1024 * 1024) {
      setImage(null)
      return setImageError(t.errors.imageSize)
    }
    setImage({ blob, name: file.name.replace(/\.(png|webp|jpe?g)$/i, '') + '.jpg', preview: URL.createObjectURL(blob) })
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    data.delete('imageFile')
    data.set('startedAt', String(startedAt.current))
    if (image) data.set('image', new File([image.blob], image.name, { type: image.blob.type || 'image/jpeg' }))
    startTransition(async () => {
      try {
        const res = await submitEvent(data)
        setResult(res)
        if (res.ok) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          requestAnimationFrame(() => {
            const first = form.querySelector<HTMLElement>('[aria-invalid="true"]')
            ;(first ?? document.getElementById('form-status'))?.focus()
          })
        }
      } catch {
        setResult({ ok: false, errors: {}, message: t.errors.server })
      }
    })
  }

  if (result?.ok) {
    return (
      <div className="mt-8 rounded-[8px] bg-fistik p-8 text-gece md:p-12" role="status">
        <CheckIcon width={40} height={40} />
        <h2 className="display mt-4 text-[2.4rem] md:text-[3.2rem]">{t.successTitle}</h2>
        <p className="mt-3 max-w-[52ch] text-[1.1rem]">{t.successText}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setResult(null)
              setImage(null)
              startedAt.current = Date.now()
            }}
            className="ui rounded-full bg-gece px-5 py-2.5 text-ayran"
          >
            {t.addAnother}
          </button>
          <Link href={paths.home('uk', lang)} className="ui rounded-full border-2 border-gece px-5 py-2 text-gece">
            Gezelim
          </Link>
        </div>
      </div>
    )
  }

  const section = 'grid gap-5 border-t-2 border-gece pt-6 md:grid-cols-[14rem_1fr] md:gap-10'
  const sectionTitle = 'display text-[1.8rem] md:text-[2.1rem]'

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8 space-y-12" encType="multipart/form-data">
      <Suspense fallback={null}>
        <CityDefault onCity={setCity} />
      </Suspense>
      <input type="hidden" name="lang" value={lang} />
      {/* Bots fill in every field; people never see this one. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website_confirm" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div id="form-status" tabIndex={-1} aria-live="assertive" className="outline-none">
        {result && !result.ok ? (
          <p role="alert" className="ui rounded-[6px] bg-mercan px-4 py-3 text-gece">
            {result.message}
          </p>
        ) : null}
      </div>

      <section className={section}>
        <h2 className={sectionTitle}>1. {t.sections.event}</h2>
        <div className="grid gap-5">
          <fieldset>
            <legend className="field-label">{t.writtenIn}</legend>
            <div className="flex gap-2">
              {(['tr', 'en'] as const).map((l) => (
                <label
                  key={l}
                  className={`ui cursor-pointer rounded-full border-[1.5px] px-4 py-2 ${
                    writtenIn === l ? 'border-gece bg-gece text-ayran' : 'border-gece/25 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="writtenIn"
                    value={l}
                    checked={writtenIn === l}
                    onChange={() => setWrittenIn(l)}
                    className="sr-only"
                  />
                  {l === 'tr' ? 'Türkçe' : 'English'}
                </label>
              ))}
            </div>
          </fieldset>
          <Field name="title" label={t.title_} required error={errors.title} requiredLabel={t.required}>
            {(a) => <input {...a} name="title" type="text" maxLength={140} className="control" lang={writtenIn} />}
          </Field>
          <Field name="summary" label={t.summary} help={t.summaryHelp} error={errors.summary} requiredLabel={t.required}>
            {(a) => (
              <>
                <textarea
                  {...a}
                  name="summary"
                  maxLength={200}
                  rows={2}
                  className="control !min-h-[4.5rem]"
                  lang={writtenIn}
                  onChange={(e) => setSummaryLength(e.target.value.length)}
                />
                <span id={summaryId} className="field-help text-right" aria-live="polite">
                  {summaryLength}/200
                </span>
              </>
            )}
          </Field>
          <Field
            name="description"
            label={t.description}
            help={t.descriptionHelp}
            required
            error={errors.description}
            requiredLabel={t.required}
          >
            {(a) => <textarea {...a} name="description" maxLength={5000} rows={7} className="control" lang={writtenIn} />}
          </Field>
          <Field name="performers" label={t.performers} help={t.performersHelp} error={errors.performers} requiredLabel={t.required}>
            {(a) => <input {...a} name="performers" type="text" maxLength={400} className="control" autoComplete="off" />}
          </Field>
          <details className="rounded-[6px] border-[1.5px] border-dashed border-gece/25 px-4 py-3">
            <summary className="ui cursor-pointer">{t.translation}</summary>
            <p className="field-help">{t.translationHelp}</p>
            <div className="mt-4 grid gap-5">
              <Field name="titleOther" label={t.titleOther(otherName)} error={errors.titleOther} requiredLabel={t.required}>
                {(a) => (
                  <input {...a} name="titleOther" type="text" maxLength={140} className="control" lang={writtenIn === 'tr' ? 'en' : 'tr'} />
                )}
              </Field>
              <Field name="summaryOther" label={t.summaryOther(otherName)} error={errors.summaryOther} requiredLabel={t.required}>
                {(a) => (
                  <textarea
                    {...a}
                    name="summaryOther"
                    maxLength={200}
                    rows={2}
                    className="control !min-h-[4.5rem]"
                    lang={writtenIn === 'tr' ? 'en' : 'tr'}
                  />
                )}
              </Field>
            </div>
          </details>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field name="category" label={t.category} required error={errors.category} requiredLabel={t.required}>
              {(a) => (
                <select {...a} name="category" defaultValue="" className="control">
                  <option value="" disabled>
                    …
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.name[lang]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field name="spoken" label={t.spoken} requiredLabel={t.required}>
              {(a) => (
                <select {...a} name="spoken" defaultValue="tr" className="control">
                  <option value="tr">{getDictionary(lang).spoken.tr}</option>
                  <option value="en">{getDictionary(lang).spoken.en}</option>
                  <option value="both">{getDictionary(lang).spoken.both}</option>
                  <option value="none">{getDictionary(lang).spoken.none}</option>
                </select>
              )}
            </Field>
            <Field name="age" label={t.age} requiredLabel={t.required}>
              {(a) => (
                <select {...a} name="age" defaultValue="all" className="control">
                  <option value="all">{getDictionary(lang).age.all}</option>
                  <option value="16">16+</option>
                  <option value="18">18+</option>
                </select>
              )}
            </Field>
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={sectionTitle}>2. {t.sections.when}</h2>
        <div className="grid gap-5">
          <Field name="city" label={t.city} help={t.cityHelp} required error={errors.city} requiredLabel={t.required}>
            {(a) => (
              <select {...a} name="city" value={city} onChange={(e) => setCity(e.target.value)} className="control">
                <option value="" disabled>
                  …
                </option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name[lang]}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="date" label={t.date} required error={errors.date} requiredLabel={t.required}>
              {(a) => <input {...a} name="date" type="date" min={today} className="control" />}
            </Field>
            <Field name="startTime" label={t.startTime} required error={errors.startTime} requiredLabel={t.required}>
              {(a) => <input {...a} name="startTime" type="time" step={300} className="control" />}
            </Field>
            <Field name="endDate" label={t.endDate} help={t.endHelp} error={errors.endDate} requiredLabel={t.required}>
              {(a) => <input {...a} name="endDate" type="date" min={today} className="control" />}
            </Field>
            <Field name="endTime" label={t.endTime} error={errors.endTime} requiredLabel={t.required}>
              {(a) => <input {...a} name="endTime" type="time" step={300} className="control" />}
            </Field>
          </div>
          <Field name="venueName" label={t.venueName} required error={errors.venueName} requiredLabel={t.required}>
            {(a) => <input {...a} name="venueName" type="text" maxLength={120} className="control" autoComplete="off" />}
          </Field>
          <Field name="address" label={t.address} error={errors.address} requiredLabel={t.required}>
            {(a) => <input {...a} name="address" type="text" maxLength={200} className="control" autoComplete="off" />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="town" label={t.town} error={errors.town} requiredLabel={t.required}>
              {(a) => <input {...a} name="town" type="text" maxLength={80} className="control" autoComplete="off" />}
            </Field>
            <Field name="postcode" label={t.postcode} required error={errors.postcode} requiredLabel={t.required}>
              {(a) => (
                <input {...a} name="postcode" type="text" maxLength={9} className="control uppercase" autoComplete="off" />
              )}
            </Field>
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={sectionTitle}>3. {t.sections.tickets}</h2>
        <div className="grid gap-5">
          <label className="ui flex cursor-pointer items-center gap-3 text-[1.05rem]">
            <input
              type="checkbox"
              name="isFree"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-5 w-5 accent-cini"
            />
            {t.isFree}
          </label>
          {!isFree ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="priceFrom" label={t.priceFrom} error={errors.priceFrom} requiredLabel={t.required}>
                {(a) => <input {...a} name="priceFrom" type="text" inputMode="decimal" className="control" />}
              </Field>
              <Field name="priceTo" label={t.priceTo} error={errors.priceTo} requiredLabel={t.required}>
                {(a) => <input {...a} name="priceTo" type="text" inputMode="decimal" className="control" />}
              </Field>
            </div>
          ) : null}
          <Field name="ticketUrl" label={t.ticketUrl} help={t.ticketUrlHelp} error={errors.ticketUrl} requiredLabel={t.required}>
            {(a) => <input {...a} name="ticketUrl" type="url" inputMode="url" placeholder="https://" className="control" />}
          </Field>
        </div>
      </section>

      <section className={section}>
        <h2 className={sectionTitle}>4. {t.sections.image}</h2>
        <div className="grid gap-4">
          <Field name="imageFile" label={t.image} help={t.imageHelp} error={imageError ?? errors.image} requiredLabel={t.required}>
            {(a) => (
              <input
                {...a}
                name="imageFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onFile(e.target.files?.[0])}
                className="block w-full text-[0.95rem] file:mr-4 file:rounded-full file:border-0 file:bg-gece file:px-4 file:py-2 file:font-semibold file:text-ayran"
              />
            )}
          </Field>
          {image ? (
            <div className="flex items-start gap-4">
              <img src={image.preview} alt="" className="h-40 w-32 rounded-[6px] object-cover" />
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" name="imageRights" className="mt-1 h-5 w-5 accent-cini" aria-invalid={errors.imageRights ? true : undefined} />
                  <span>{t.imageRights}</span>
                </label>
                {errors.imageRights ? <span className="field-error">{errors.imageRights}</span> : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={section}>
        <h2 className={sectionTitle}>5. {t.sections.contact}</h2>
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="organiserName" label={t.organiserName} help={t.organiserHelp} required error={errors.organiserName} requiredLabel={t.required}>
              {(a) => <input {...a} name="organiserName" type="text" maxLength={120} className="control" autoComplete="organization" />}
            </Field>
            <Field name="organiserLink" label={t.organiserLink} error={errors.organiserLink} requiredLabel={t.required}>
              {(a) => <input {...a} name="organiserLink" type="text" maxLength={300} className="control" placeholder="https://" />}
            </Field>
          </div>
          <p className="field-help !mt-0">{t.contactHelp}</p>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field name="contactName" label={t.contactName} required error={errors.contactName} requiredLabel={t.required}>
              {(a) => <input {...a} name="contactName" type="text" maxLength={120} className="control" autoComplete="name" />}
            </Field>
            <Field name="email" label={t.email} required error={errors.email} requiredLabel={t.required}>
              {(a) => <input {...a} name="email" type="email" className="control" autoComplete="email" />}
            </Field>
            <Field name="phone" label={t.phone} error={errors.phone} requiredLabel={t.required}>
              {(a) => <input {...a} name="phone" type="tel" className="control" autoComplete="tel" />}
            </Field>
          </div>
        </div>
      </section>

      <div className="space-y-4 border-t-2 border-gece pt-6">
        <label className="flex cursor-pointer items-start gap-3 text-[1.05rem]">
          <input
            type="checkbox"
            name="consent"
            id="f-consent"
            className="mt-1 h-5 w-5 shrink-0 accent-cini"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'f-consent-error' : undefined}
          />
          <span>{t.consent}</span>
        </label>
        {errors.consent ? (
          <span id="f-consent-error" className="field-error">
            {errors.consent}
          </span>
        ) : null}
        <p className="text-[0.95rem] text-muted">
          <Link href={paths.privacy(lang)} className="underline underline-offset-4">
            {t.privacyNote}
          </Link>
        </p>
        {turnstileSiteKey ? (
          <>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
            <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language={lang} />
          </>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="ui rounded-full bg-cini px-7 py-3.5 text-[1.1rem] text-ayran hover:bg-cini-deep disabled:opacity-60"
        >
          {pending ? t.submitting : t.submit}
        </button>
      </div>
    </form>
  )
}
