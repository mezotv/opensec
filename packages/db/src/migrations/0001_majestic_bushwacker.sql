ALTER TABLE "repository" ADD COLUMN "repo_slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "repository" ADD CONSTRAINT "repository_repo_slug_unique" UNIQUE("repo_slug");