import 'server-only'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

/** Uploaded files live under this folder in the R2 bucket (matches the s3Storage prefix). */
export const MEDIA_PREFIX = 'media'

export function r2Configured(): boolean {
  return Boolean(
    process.env.R2_BUCKET &&
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY,
  )
}

let client: S3Client | null = null

function r2(): S3Client {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
      },
      forcePathStyle: true,
    })
  }
  return client
}

export async function getR2Object(key: string, range?: string) {
  return r2().send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Range: range }))
}
