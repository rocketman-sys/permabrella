CREATE TABLE "network_enquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar(20) NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(254) NOT NULL,
	"area" varchar(80) NOT NULL,
	"interests" jsonb NOT NULL,
	"message" text NOT NULL,
	"submission_key" varchar(64) NOT NULL,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "network_enquiries_submission_key_unique" UNIQUE("submission_key")
);
--> statement-breakpoint
CREATE TABLE "network_enquiry_limits" (
	"key" varchar(64) PRIMARY KEY NOT NULL,
	"attempts" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "network_enquiries_status_created_idx" ON "network_enquiries" USING btree ("status","created_at");