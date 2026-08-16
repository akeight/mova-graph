ALTER TABLE "student_workspaces" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "student_workspaces" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "student_workspaces" ADD COLUMN "onboarding_step" text;--> statement-breakpoint
CREATE UNIQUE INDEX "student_workspaces_user_id_unique" ON "student_workspaces" USING btree ("user_id") WHERE "student_workspaces"."user_id" is not null;