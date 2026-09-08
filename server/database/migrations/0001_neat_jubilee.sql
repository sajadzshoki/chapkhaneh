ALTER TABLE "quote_requests" ADD COLUMN "file_size" integer;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD COLUMN "file_mime_type" text;--> statement-breakpoint
CREATE INDEX "quote_requests_service_idx" ON "quote_requests" USING btree ("service_id");