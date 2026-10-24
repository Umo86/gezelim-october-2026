import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_events_performers_kind" AS ENUM('person', 'group');
  CREATE TYPE "public"."enum_events_category" AS ENUM('concerts', 'nightlife', 'comedy', 'theatre', 'festivals', 'family', 'community', 'ramadan-eid', 'arts-culture', 'film', 'food-drink', 'sport', 'business', 'talks-workshops');
  CREATE TYPE "public"."enum_events_event_language" AS ENUM('tr', 'en', 'both', 'none');
  CREATE TYPE "public"."enum_events_age_limit" AS ENUM('all', '16', '18');
  CREATE TYPE "public"."enum_events_startsat_tz" AS ENUM('Europe/London');
  CREATE TYPE "public"."enum_events_endsat_tz" AS ENUM('Europe/London');
  CREATE TYPE "public"."enum_events_city" AS ENUM('london', 'birmingham', 'manchester', 'leeds', 'liverpool', 'glasgow', 'edinburgh', 'bristol', 'cardiff', 'leicester', 'sheffield', 'nottingham', 'coventry', 'luton', 'milton-keynes', 'northampton', 'reading', 'oxford', 'cambridge', 'brighton', 'southampton', 'portsmouth', 'bournemouth', 'newcastle', 'bradford', 'stoke-on-trent', 'peterborough', 'norwich', 'swansea', 'aberdeen', 'dundee', 'belfast');
  CREATE TYPE "public"."enum_events_submission_written_in" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_events_event_status" AS ENUM('scheduled', 'cancelled', 'postponed', 'rescheduled');
  CREATE TYPE "public"."enum_events_source" AS ENUM('staff', 'form');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_performers_kind" AS ENUM('person', 'group');
  CREATE TYPE "public"."enum__events_v_version_category" AS ENUM('concerts', 'nightlife', 'comedy', 'theatre', 'festivals', 'family', 'community', 'ramadan-eid', 'arts-culture', 'film', 'food-drink', 'sport', 'business', 'talks-workshops');
  CREATE TYPE "public"."enum__events_v_version_event_language" AS ENUM('tr', 'en', 'both', 'none');
  CREATE TYPE "public"."enum__events_v_version_age_limit" AS ENUM('all', '16', '18');
  CREATE TYPE "public"."enum__events_v_version_startsat_tz" AS ENUM('Europe/London');
  CREATE TYPE "public"."enum__events_v_version_endsat_tz" AS ENUM('Europe/London');
  CREATE TYPE "public"."enum__events_v_version_city" AS ENUM('london', 'birmingham', 'manchester', 'leeds', 'liverpool', 'glasgow', 'edinburgh', 'bristol', 'cardiff', 'leicester', 'sheffield', 'nottingham', 'coventry', 'luton', 'milton-keynes', 'northampton', 'reading', 'oxford', 'cambridge', 'brighton', 'southampton', 'portsmouth', 'bournemouth', 'newcastle', 'bradford', 'stoke-on-trent', 'peterborough', 'norwich', 'swansea', 'aberdeen', 'dundee', 'belfast');
  CREATE TYPE "public"."enum__events_v_version_submission_written_in" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum__events_v_version_event_status" AS ENUM('scheduled', 'cancelled', 'postponed', 'rescheduled');
  CREATE TYPE "public"."enum__events_v_version_source" AS ENUM('staff', 'form');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_published_locale" AS ENUM('tr', 'en');
  CREATE TYPE "public"."enum_venues_city" AS ENUM('london', 'birmingham', 'manchester', 'leeds', 'liverpool', 'glasgow', 'edinburgh', 'bristol', 'cardiff', 'leicester', 'sheffield', 'nottingham', 'coventry', 'luton', 'milton-keynes', 'northampton', 'reading', 'oxford', 'cambridge', 'brighton', 'southampton', 'portsmouth', 'bournemouth', 'newcastle', 'bradford', 'stoke-on-trent', 'peterborough', 'norwich', 'swansea', 'aberdeen', 'dundee', 'belfast');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "events_performers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"kind" "enum_events_performers_kind" DEFAULT 'person'
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"category" "enum_events_category",
  	"event_language" "enum_events_event_language" DEFAULT 'tr',
  	"age_limit" "enum_events_age_limit" DEFAULT 'all',
  	"starts_at" timestamp(3) with time zone,
  	"startsat_tz" "enum_events_startsat_tz" DEFAULT 'Europe/London',
  	"ends_at" timestamp(3) with time zone,
  	"endsat_tz" "enum_events_endsat_tz" DEFAULT 'Europe/London',
  	"city" "enum_events_city",
  	"venue_id" integer,
  	"is_free" boolean DEFAULT false,
  	"price_from" numeric,
  	"price_to" numeric,
  	"ticket_url" varchar,
  	"sold_out" boolean DEFAULT false,
  	"submission_contact_name" varchar,
  	"submission_contact_email" varchar,
  	"submission_contact_phone" varchar,
  	"submission_organiser_link" varchar,
  	"submission_written_in" "enum_events_submission_written_in",
  	"submission_submitted_at" timestamp(3) with time zone,
  	"submission_image_rights_confirmed" boolean,
  	"submission_notes" varchar,
  	"slug" varchar,
  	"organiser_id" integer,
  	"event_status" "enum_events_event_status" DEFAULT 'scheduled',
  	"featured" boolean DEFAULT false,
  	"is_sample" boolean DEFAULT false,
  	"source" "enum_events_source" DEFAULT 'staff',
  	"active_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "events_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_events_v_version_performers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"kind" "enum__events_v_version_performers_kind" DEFAULT 'person',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_image_id" integer,
  	"version_category" "enum__events_v_version_category",
  	"version_event_language" "enum__events_v_version_event_language" DEFAULT 'tr',
  	"version_age_limit" "enum__events_v_version_age_limit" DEFAULT 'all',
  	"version_starts_at" timestamp(3) with time zone,
  	"version_startsat_tz" "enum__events_v_version_startsat_tz" DEFAULT 'Europe/London',
  	"version_ends_at" timestamp(3) with time zone,
  	"version_endsat_tz" "enum__events_v_version_endsat_tz" DEFAULT 'Europe/London',
  	"version_city" "enum__events_v_version_city",
  	"version_venue_id" integer,
  	"version_is_free" boolean DEFAULT false,
  	"version_price_from" numeric,
  	"version_price_to" numeric,
  	"version_ticket_url" varchar,
  	"version_sold_out" boolean DEFAULT false,
  	"version_submission_contact_name" varchar,
  	"version_submission_contact_email" varchar,
  	"version_submission_contact_phone" varchar,
  	"version_submission_organiser_link" varchar,
  	"version_submission_written_in" "enum__events_v_version_submission_written_in",
  	"version_submission_submitted_at" timestamp(3) with time zone,
  	"version_submission_image_rights_confirmed" boolean,
  	"version_submission_notes" varchar,
  	"version_slug" varchar,
  	"version_organiser_id" integer,
  	"version_event_status" "enum__events_v_version_event_status" DEFAULT 'scheduled',
  	"version_featured" boolean DEFAULT false,
  	"version_is_sample" boolean DEFAULT false,
  	"version_source" "enum__events_v_version_source" DEFAULT 'staff',
  	"version_active_until" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__events_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_events_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_events_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "venues" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"city" "enum_venues_city" NOT NULL,
  	"address" varchar,
  	"town" varchar,
  	"postcode" varchar,
  	"lat" numeric,
  	"lng" numeric,
  	"website" varchar,
  	"is_sample" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "organisers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"logo_id" integer,
  	"website" varchar,
  	"instagram" varchar,
  	"verified" boolean DEFAULT false,
  	"is_sample" boolean DEFAULT false,
  	"contact_name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "organisers_locales" (
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_poster_url" varchar,
  	"sizes_poster_width" numeric,
  	"sizes_poster_height" numeric,
  	"sizes_poster_mime_type" varchar,
  	"sizes_poster_filesize" numeric,
  	"sizes_poster_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"venues_id" integer,
  	"organisers_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "events_performers" ADD CONSTRAINT "events_performers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_organiser_id_organisers_id_fk" FOREIGN KEY ("organiser_id") REFERENCES "public"."organisers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_texts" ADD CONSTRAINT "events_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_performers" ADD CONSTRAINT "_events_v_version_performers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_venue_id_venues_id_fk" FOREIGN KEY ("version_venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_organiser_id_organisers_id_fk" FOREIGN KEY ("version_organiser_id") REFERENCES "public"."organisers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_locales" ADD CONSTRAINT "_events_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_texts" ADD CONSTRAINT "_events_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organisers" ADD CONSTRAINT "organisers_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "organisers_locales" ADD CONSTRAINT "organisers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organisers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organisers_fk" FOREIGN KEY ("organisers_id") REFERENCES "public"."organisers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_performers_order_idx" ON "events_performers" USING btree ("_order");
  CREATE INDEX "events_performers_parent_id_idx" ON "events_performers" USING btree ("_parent_id");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX "events_category_idx" ON "events" USING btree ("category");
  CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");
  CREATE INDEX "events_city_idx" ON "events" USING btree ("city");
  CREATE INDEX "events_venue_idx" ON "events" USING btree ("venue_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_organiser_idx" ON "events" USING btree ("organiser_id");
  CREATE INDEX "events_active_until_idx" ON "events" USING btree ("active_until");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE UNIQUE INDEX "events_locales_locale_parent_id_unique" ON "events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_locales_parent_id_idx" ON "events_locales" USING btree ("_parent_id");
  CREATE INDEX "events_texts_order_parent" ON "events_texts" USING btree ("order","parent_id");
  CREATE INDEX "events_texts_text_idx" ON "events_texts" USING btree ("text");
  CREATE INDEX "_events_v_version_performers_order_idx" ON "_events_v_version_performers" USING btree ("_order");
  CREATE INDEX "_events_v_version_performers_parent_id_idx" ON "_events_v_version_performers" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_image_idx" ON "_events_v" USING btree ("version_image_id");
  CREATE INDEX "_events_v_version_version_category_idx" ON "_events_v" USING btree ("version_category");
  CREATE INDEX "_events_v_version_version_starts_at_idx" ON "_events_v" USING btree ("version_starts_at");
  CREATE INDEX "_events_v_version_version_city_idx" ON "_events_v" USING btree ("version_city");
  CREATE INDEX "_events_v_version_version_venue_idx" ON "_events_v" USING btree ("version_venue_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_organiser_idx" ON "_events_v" USING btree ("version_organiser_id");
  CREATE INDEX "_events_v_version_version_active_until_idx" ON "_events_v" USING btree ("version_active_until");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_snapshot_idx" ON "_events_v" USING btree ("snapshot");
  CREATE INDEX "_events_v_published_locale_idx" ON "_events_v" USING btree ("published_locale");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_events_v_locales_locale_parent_id_unique" ON "_events_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_events_v_locales_parent_id_idx" ON "_events_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_events_v_texts_order_parent" ON "_events_v_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "venues_slug_idx" ON "venues" USING btree ("slug");
  CREATE INDEX "venues_updated_at_idx" ON "venues" USING btree ("updated_at");
  CREATE INDEX "venues_created_at_idx" ON "venues" USING btree ("created_at");
  CREATE UNIQUE INDEX "organisers_slug_idx" ON "organisers" USING btree ("slug");
  CREATE INDEX "organisers_logo_idx" ON "organisers" USING btree ("logo_id");
  CREATE INDEX "organisers_email_idx" ON "organisers" USING btree ("email");
  CREATE INDEX "organisers_updated_at_idx" ON "organisers" USING btree ("updated_at");
  CREATE INDEX "organisers_created_at_idx" ON "organisers" USING btree ("created_at");
  CREATE UNIQUE INDEX "organisers_locales_locale_parent_id_unique" ON "organisers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "organisers_locales_parent_id_idx" ON "organisers_locales" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_poster_sizes_poster_filename_idx" ON "media" USING btree ("sizes_poster_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_venues_id_idx" ON "payload_locked_documents_rels" USING btree ("venues_id");
  CREATE INDEX "payload_locked_documents_rels_organisers_id_idx" ON "payload_locked_documents_rels" USING btree ("organisers_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "events_performers" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_locales" CASCADE;
  DROP TABLE "events_texts" CASCADE;
  DROP TABLE "_events_v_version_performers" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_locales" CASCADE;
  DROP TABLE "_events_v_texts" CASCADE;
  DROP TABLE "venues" CASCADE;
  DROP TABLE "organisers" CASCADE;
  DROP TABLE "organisers_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_events_performers_kind";
  DROP TYPE "public"."enum_events_category";
  DROP TYPE "public"."enum_events_event_language";
  DROP TYPE "public"."enum_events_age_limit";
  DROP TYPE "public"."enum_events_startsat_tz";
  DROP TYPE "public"."enum_events_endsat_tz";
  DROP TYPE "public"."enum_events_city";
  DROP TYPE "public"."enum_events_submission_written_in";
  DROP TYPE "public"."enum_events_event_status";
  DROP TYPE "public"."enum_events_source";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_performers_kind";
  DROP TYPE "public"."enum__events_v_version_category";
  DROP TYPE "public"."enum__events_v_version_event_language";
  DROP TYPE "public"."enum__events_v_version_age_limit";
  DROP TYPE "public"."enum__events_v_version_startsat_tz";
  DROP TYPE "public"."enum__events_v_version_endsat_tz";
  DROP TYPE "public"."enum__events_v_version_city";
  DROP TYPE "public"."enum__events_v_version_submission_written_in";
  DROP TYPE "public"."enum__events_v_version_event_status";
  DROP TYPE "public"."enum__events_v_version_source";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum__events_v_published_locale";
  DROP TYPE "public"."enum_venues_city";
  DROP TYPE "public"."enum_users_role";`)
}
