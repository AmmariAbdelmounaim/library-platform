-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."card_status" AS ENUM('FREE', 'IN_USE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('ONGOING', 'RETURNED', 'LATE');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USER');--> statement-breakpoint
CREATE TABLE "books" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"isbn_10" varchar(10),
	"isbn_13" varchar(13),
	"genre" varchar(100),
	"publication_date" date,
	"description" text,
	"cover_image_url" text,
	"external_source" varchar(100),
	"external_id" varchar(255),
	"external_metadata" jsonb,
	"search_vector" "tsvector",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "books" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "loans" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"book_id" bigint NOT NULL,
	"status" "loan_status" DEFAULT 'ONGOING' NOT NULL,
	"borrowed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone,
	"returned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "loans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "membership_cards" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"serial_number" varchar(20) NOT NULL,
	"status" "card_status" DEFAULT 'FREE' NOT NULL,
	"user_id" bigint,
	"assigned_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_cards_serial_number_key" UNIQUE("serial_number")
);
--> statement-breakpoint
ALTER TABLE "membership_cards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "authors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"birth_date" date,
	"death_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'USER' NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "book_authors" (
	"book_id" bigint NOT NULL,
	"author_id" bigint NOT NULL,
	CONSTRAINT "book_authors_pkey" PRIMARY KEY("book_id","author_id")
);
--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_cards" ADD CONSTRAINT "membership_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_books_genre" ON "books" USING btree ("genre" text_ops);--> statement-breakpoint
CREATE INDEX "idx_books_search_vector" ON "books" USING gin ("search_vector" tsvector_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_books_isbn_13" ON "books" USING btree ("isbn_13" text_ops) WHERE (isbn_13 IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_loans_book_id" ON "loans" USING btree ("book_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_loans_user_id" ON "loans" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_loans_book_ongoing" ON "loans" USING btree ("book_id" int8_ops) WHERE (returned_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_membership_cards_status_serial" ON "membership_cards" USING btree ("status" text_ops,"serial_number" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_membership_cards_user_active" ON "membership_cards" USING btree ("user_id" int8_ops) WHERE (status = 'IN_USE'::card_status);--> statement-breakpoint
CREATE INDEX "idx_authors_last_name" ON "authors" USING btree ("last_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role" enum_ops);--> statement-breakpoint
CREATE POLICY "books_admin_delete" ON "books" AS PERMISSIVE FOR DELETE TO "library_app" USING ((current_setting('app.current_user_role'::text, true) = 'ADMIN'::text));--> statement-breakpoint
CREATE POLICY "books_admin_update" ON "books" AS PERMISSIVE FOR UPDATE TO "library_app";--> statement-breakpoint
CREATE POLICY "books_admin_insert" ON "books" AS PERMISSIVE FOR INSERT TO "library_app";--> statement-breakpoint
CREATE POLICY "books_select_all" ON "books" AS PERMISSIVE FOR SELECT TO "library_app";--> statement-breakpoint
CREATE POLICY "loans_admin_delete" ON "loans" AS PERMISSIVE FOR DELETE TO "library_app" USING ((current_setting('app.current_user_role'::text, true) = 'ADMIN'::text));--> statement-breakpoint
CREATE POLICY "loans_user_or_admin_update" ON "loans" AS PERMISSIVE FOR UPDATE TO "library_app";--> statement-breakpoint
CREATE POLICY "loans_user_or_admin_insert" ON "loans" AS PERMISSIVE FOR INSERT TO "library_app";--> statement-breakpoint
CREATE POLICY "loans_user_or_admin_select" ON "loans" AS PERMISSIVE FOR SELECT TO "library_app";--> statement-breakpoint
CREATE POLICY "membership_cards_admin_delete" ON "membership_cards" AS PERMISSIVE FOR DELETE TO "library_app" USING ((current_setting('app.current_user_role'::text, true) = 'ADMIN'::text));--> statement-breakpoint
CREATE POLICY "membership_cards_admin_update" ON "membership_cards" AS PERMISSIVE FOR UPDATE TO "library_app";--> statement-breakpoint
CREATE POLICY "membership_cards_admin_insert" ON "membership_cards" AS PERMISSIVE FOR INSERT TO "library_app";--> statement-breakpoint
CREATE POLICY "membership_cards_select_all" ON "membership_cards" AS PERMISSIVE FOR SELECT TO "library_app";--> statement-breakpoint
CREATE POLICY "users_admin_delete" ON "users" AS PERMISSIVE FOR DELETE TO "library_app" USING ((current_setting('app.current_user_role'::text, true) = 'ADMIN'::text));--> statement-breakpoint
CREATE POLICY "users_admin_insert" ON "users" AS PERMISSIVE FOR INSERT TO "library_app";--> statement-breakpoint
CREATE POLICY "users_update_self_or_admin" ON "users" AS PERMISSIVE FOR UPDATE TO "library_app";--> statement-breakpoint
CREATE POLICY "users_select_self_or_admin" ON "users" AS PERMISSIVE FOR SELECT TO "library_app";
*/