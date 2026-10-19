CREATE TABLE "message_acknowledgements" (
	"target_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "message_acknowledgements_target_id_user_id_pk" PRIMARY KEY("target_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "thread_acknowledgements" (
	"target_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "thread_acknowledgements_target_id_user_id_pk" PRIMARY KEY("target_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "message_acknowledgements" ADD CONSTRAINT "message_acknowledgements_target_id_messages_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_acknowledgements" ADD CONSTRAINT "message_acknowledgements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_acknowledgements" ADD CONSTRAINT "thread_acknowledgements_target_id_threads_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "thread_acknowledgements" ADD CONSTRAINT "thread_acknowledgements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;