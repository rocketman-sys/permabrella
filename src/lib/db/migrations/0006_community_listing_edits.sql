CREATE TABLE "listing_edit_limits" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"attempts" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"editor_id" uuid NOT NULL,
	"editor_name" varchar(150) NOT NULL,
	"kind" varchar(20) NOT NULL,
	"summary" varchar(500) NOT NULL,
	"before" jsonb NOT NULL,
	"after" jsonb NOT NULL,
	"restored_from_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listing_edit_limits" ADD CONSTRAINT "listing_edit_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_revisions" ADD CONSTRAINT "listing_revisions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_revisions" ADD CONSTRAINT "listing_revisions_editor_id_users_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_revisions" ADD CONSTRAINT "listing_revisions_restored_from_id_listing_revisions_id_fk" FOREIGN KEY ("restored_from_id") REFERENCES "public"."listing_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_revisions_post_created_idx" ON "listing_revisions" USING btree ("post_id","created_at");