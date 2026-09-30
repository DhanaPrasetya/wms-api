CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- do not remove this line, it is required for the migration to work properly

CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"operation" varchar(20) NOT NULL,
	"ai_agent" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requested_by" uuid NOT NULL,
	"reviewer_role_id" uuid NOT NULL,
	"approval_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"reviewed_by" uuid NOT NULL,
	"rejection_reason" text,
	"reviewed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "inventory_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"batch_number" varchar(100) NOT NULL,
	"exp_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "inventory_batches_product_id_batch_number_unique" UNIQUE("product_id","batch_number")
);
--> statement-breakpoint
CREATE TABLE "inventory_stocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"quantity_on_hand" integer DEFAULT 0 NOT NULL,
	"reserved_quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	CONSTRAINT "inventory_stock_location_id_batch_id_unique" UNIQUE("location_id","batch_id"),
	CONSTRAINT "quantity_on_hand_check" CHECK ("inventory_stocks"."quantity_on_hand" >= 0),
	CONSTRAINT "reserved_quantity_check" CHECK ("inventory_stocks"."reserved_quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"recipient" varchar(255) NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"status" varchar(30) DEFAULT 'PENDING' NOT NULL,
	"deadline" date NOT NULL,
	"order_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ordered_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"price_per_quantity" numeric(12, 2) NOT NULL,
	"total_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar(30) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"ean_code" varchar(20) NOT NULL,
	"description" text,
	"photo" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "products_ean_code_unique" UNIQUE("ean_code")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"from_location_id" uuid NOT NULL,
	"to_location_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"movement_type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uom_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"itf_14" varchar(14) NOT NULL,
	"uom_name" varchar(50) NOT NULL,
	"multiplier" integer DEFAULT 1 NOT NULL,
	"metric_name" varchar(50) NOT NULL,
	"is_base_uom" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "uom_metrics_itf_14_unique" UNIQUE("itf_14")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "warehouse_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_code" varchar(50) NOT NULL,
	"zone" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "warehouse_locations_location_code_unique" UNIQUE("location_code")
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_reviewer_role_id_roles_id_fk" FOREIGN KEY ("reviewer_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stocks" ADD CONSTRAINT "inventory_stocks_location_id_warehouse_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."warehouse_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stocks" ADD CONSTRAINT "inventory_stocks_batch_id_inventory_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."inventory_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordered_items" ADD CONSTRAINT "ordered_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordered_items" ADD CONSTRAINT "ordered_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_batch_id_inventory_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."inventory_batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_from_location_id_warehouse_locations_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."warehouse_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_to_location_id_warehouse_locations_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."warehouse_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uom_metrics" ADD CONSTRAINT "uom_metrics_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_id_n_ai_agent" ON "activity_logs" USING btree ("user_id","ai_agent");--> statement-breakpoint
CREATE INDEX "idx_operation_timestamp" ON "activity_logs" USING btree ("operation","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_approvals_status_type" ON "approvals" USING btree ("status","approval_type");--> statement-breakpoint
CREATE INDEX "idx_inventory_batches_product_id" ON "inventory_batches" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_batch_number" ON "inventory_batches" USING btree ("batch_number");--> statement-breakpoint
CREATE INDEX "idx_exp_date" ON "inventory_batches" USING btree ("exp_date");--> statement-breakpoint
CREATE INDEX "idx_inventory_stock_location_id" ON "inventory_stocks" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_stock_batch_id" ON "inventory_stocks" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "idx_order_id" ON "invoices" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "recipient_lowercase_trgm" ON "invoices" USING gin (LOWER("recipient") gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_ordered_items_order_id" ON "ordered_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_ordered_items_product_id" ON "ordered_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_pending_orders" ON "orders" USING btree ("created_at") WHERE "orders"."status" = 'PENDING';--> statement-breakpoint
CREATE INDEX "idx_products_lower_name_trgm" ON "products" USING gin (LOWER("name") gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_ean_code" ON "products" USING btree ("ean_code");--> statement-breakpoint
CREATE INDEX "idx_stock_movements_batch_id" ON "stock_movements" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "idx_stock_movements_created_at" ON "stock_movements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_product_id" ON "uom_metrics" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_users_name_trgm" ON "users" USING gin (LOWER("name") gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_role_id" ON "users" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "idx_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "location_code_lowercase_trgm" ON "warehouse_locations" USING gin (LOWER("location_code") gin_trgm_ops);