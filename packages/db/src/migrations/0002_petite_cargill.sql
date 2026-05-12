ALTER TABLE "review_request_submission" ADD COLUMN "notes" text;--> statement-breakpoint
UPDATE "review_request_submission"
SET "notes" = concat_ws(
	E'\n\n',
	nullif(trim("description"), ''),
	nullif(trim("security_notes"), '')
);--> statement-breakpoint
ALTER TABLE "review_request_submission" ALTER COLUMN "notes" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "review_request_submission" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "review_request_submission" DROP COLUMN "security_notes";
