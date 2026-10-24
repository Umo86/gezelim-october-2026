import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "submission_ip_hash" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_submission_ip_hash" varchar;
  ALTER TABLE "venues" ADD COLUMN "pending" boolean DEFAULT false;
  ALTER TABLE "organisers" ADD COLUMN "pending" boolean DEFAULT false;
  ALTER TABLE "media" ADD COLUMN "pending" boolean DEFAULT false;
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'media';
  ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;
  CREATE INDEX "events_submission_submission_ip_hash_idx" ON "events" USING btree ("submission_ip_hash");
  CREATE INDEX "_events_v_version_submission_version_submission_ip_hash_idx" ON "_events_v" USING btree ("version_submission_ip_hash");
  CREATE INDEX "venues_pending_idx" ON "venues" USING btree ("pending");
  CREATE INDEX "organisers_pending_idx" ON "organisers" USING btree ("pending");
  CREATE INDEX "media_pending_idx" ON "media" USING btree ("pending");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "events_submission_submission_ip_hash_idx";
  DROP INDEX "_events_v_version_submission_version_submission_ip_hash_idx";
  DROP INDEX "venues_pending_idx";
  DROP INDEX "organisers_pending_idx";
  DROP INDEX "media_pending_idx";
  ALTER TABLE "events" DROP COLUMN "submission_ip_hash";
  ALTER TABLE "_events_v" DROP COLUMN "version_submission_ip_hash";
  ALTER TABLE "venues" DROP COLUMN "pending";
  ALTER TABLE "organisers" DROP COLUMN "pending";
  ALTER TABLE "media" DROP COLUMN "pending";
  ALTER TABLE "media" DROP COLUMN "prefix";
  ALTER TABLE "media" DROP COLUMN "_objectkey";`)
}
