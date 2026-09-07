CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_fa" text NOT NULL,
	"name_en" text NOT NULL,
	"manufacturer_fa" text NOT NULL,
	"manufacturer_en" text NOT NULL,
	"model" text NOT NULL,
	"type_fa" text NOT NULL,
	"type_en" text NOT NULL,
	"type_key" text NOT NULL,
	"installed_year" integer,
	"description_fa" text NOT NULL,
	"description_en" text NOT NULL,
	"image" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "equipment_type_valid" CHECK ("equipment"."type_key" IN ('offset', 'digital', 'prepress', 'finishing'))
);
--> statement-breakpoint
CREATE TABLE "equipment_specs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"label_fa" text NOT NULL,
	"label_en" text NOT NULL,
	"value_fa" text NOT NULL,
	"value_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text DEFAULT 'orders' NOT NULL,
	"question_fa" text NOT NULL,
	"question_en" text NOT NULL,
	"answer_fa" text NOT NULL,
	"answer_en" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "faqs_category_valid" CHECK ("faqs"."category" IN ('orders', 'technical', 'delivery', 'pricing'))
);
--> statement-breakpoint
CREATE TABLE "portfolio_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_fa" text NOT NULL,
	"name_en" text NOT NULL,
	"description_fa" text,
	"description_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"label_fa" text NOT NULL,
	"label_en" text NOT NULL,
	"value_fa" text NOT NULL,
	"value_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portfolio_id" uuid NOT NULL,
	"image" text NOT NULL,
	"alt_fa" text NOT NULL,
	"alt_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title_fa" text NOT NULL,
	"title_en" text NOT NULL,
	"description_fa" text NOT NULL,
	"description_en" text NOT NULL,
	"cover_image" text NOT NULL,
	"year" integer,
	"client_fa" text,
	"client_en" text,
	"category_id" uuid NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_services" (
	"portfolio_id" uuid NOT NULL,
	"service_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"title_fa" text NOT NULL,
	"title_en" text NOT NULL,
	"quantity" integer NOT NULL,
	"specification_fa" text NOT NULL,
	"specification_en" text NOT NULL,
	"turnaround_fa" text,
	"turnaround_en" text,
	"note_fa" text,
	"note_en" text,
	"unit_fa" text NOT NULL,
	"unit_en" text NOT NULL,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'IRT' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_rows_price_positive" CHECK ("pricing_rows"."price" >= 0),
	CONSTRAINT "pricing_rows_quantity_positive" CHECK ("pricing_rows"."quantity" > 0),
	CONSTRAINT "pricing_rows_currency_valid" CHECK ("pricing_rows"."currency" IN ('IRT', 'IRR'))
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"company" text,
	"phone" text NOT NULL,
	"email" text,
	"service_id" uuid,
	"quantity" integer,
	"description" text NOT NULL,
	"needed_by" text,
	"file_url" text,
	"file_name" text,
	"locale" text DEFAULT 'fa' NOT NULL,
	"status" text DEFAULT 'NEW' NOT NULL,
	"internal_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quote_requests_status_valid" CHECK ("quote_requests"."status" IN ('NEW', 'REVIEWING', 'CONTACTED', 'COMPLETED')),
	CONSTRAINT "quote_requests_locale_valid" CHECK ("quote_requests"."locale" IN ('fa', 'en'))
);
--> statement-breakpoint
CREATE TABLE "service_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"value_fa" text NOT NULL,
	"value_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_specifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"label_fa" text NOT NULL,
	"label_en" text NOT NULL,
	"values_fa" text NOT NULL,
	"values_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title_fa" text NOT NULL,
	"title_en" text NOT NULL,
	"short_description_fa" text NOT NULL,
	"short_description_en" text NOT NULL,
	"description_fa" text NOT NULL,
	"description_en" text NOT NULL,
	"image" text,
	"minimum_order_fa" text,
	"minimum_order_en" text,
	"turnaround_fa" text,
	"turnaround_en" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"company_name_fa" text NOT NULL,
	"company_name_en" text NOT NULL,
	"legal_name_fa" text,
	"legal_name_en" text,
	"tagline_fa" text NOT NULL,
	"tagline_en" text NOT NULL,
	"description_fa" text,
	"description_en" text,
	"founded_year" integer,
	"phone" text NOT NULL,
	"phone_secondary" text,
	"fax" text,
	"email" text NOT NULL,
	"sales_email" text,
	"address_fa" text NOT NULL,
	"address_en" text NOT NULL,
	"city_fa" text,
	"city_en" text,
	"postal_code" text,
	"map_url" text,
	"working_hours_fa" text NOT NULL,
	"working_hours_en" text NOT NULL,
	"working_hours_days_fa" text,
	"working_hours_days_en" text,
	"logo" text,
	"mark" text,
	"favicon" text,
	"og_image" text,
	"instagram_url" text,
	"linkedin_url" text,
	"telegram_url" text,
	"whatsapp_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"primary" text NOT NULL,
	"secondary" text NOT NULL,
	"accent" text NOT NULL,
	"background" text NOT NULL,
	"surface" text NOT NULL,
	"foreground" text NOT NULL,
	"muted" text NOT NULL,
	"border" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipment_specs" ADD CONSTRAINT "equipment_specs_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_details" ADD CONSTRAINT "portfolio_details_portfolio_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_images" ADD CONSTRAINT "portfolio_images_portfolio_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_category_id_portfolio_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."portfolio_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_services" ADD CONSTRAINT "portfolio_services_portfolio_id_portfolio_items_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_services" ADD CONSTRAINT "portfolio_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rows" ADD CONSTRAINT "pricing_rows_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_features" ADD CONSTRAINT "service_features_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_specifications" ADD CONSTRAINT "service_specifications_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "equipment_slug_key" ON "equipment" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "equipment_active_order_idx" ON "equipment" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE INDEX "equipment_specs_equipment_idx" ON "equipment_specs" USING btree ("equipment_id","sort_order");--> statement-breakpoint
CREATE INDEX "faqs_active_order_idx" ON "faqs" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_categories_slug_key" ON "portfolio_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "portfolio_details_portfolio_idx" ON "portfolio_details" USING btree ("portfolio_id","sort_order");--> statement-breakpoint
CREATE INDEX "portfolio_images_portfolio_idx" ON "portfolio_images" USING btree ("portfolio_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_items_slug_key" ON "portfolio_items" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "portfolio_items_category_idx" ON "portfolio_items" USING btree ("category_id","sort_order");--> statement-breakpoint
CREATE INDEX "portfolio_items_active_order_idx" ON "portfolio_items" USING btree ("is_active","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_services_pk" ON "portfolio_services" USING btree ("portfolio_id","service_id");--> statement-breakpoint
CREATE INDEX "pricing_rows_service_idx" ON "pricing_rows" USING btree ("service_id","sort_order");--> statement-breakpoint
CREATE INDEX "quote_requests_status_idx" ON "quote_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "quote_requests_created_idx" ON "quote_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "service_features_service_idx" ON "service_features" USING btree ("service_id","sort_order");--> statement-breakpoint
CREATE INDEX "service_specifications_service_idx" ON "service_specifications" USING btree ("service_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_key" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_active_order_idx" ON "services" USING btree ("is_active","sort_order");