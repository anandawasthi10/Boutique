CREATE TABLE "product_variant_images" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"product_id" varchar(64) NOT NULL,
	"signature" text NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variant_images_product_id_signature_unique" UNIQUE("product_id","signature")
);
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_order_id_orders_id_fk";
--> statement-breakpoint
DROP INDEX "idx_categories_slug";--> statement-breakpoint
DROP INDEX "idx_products_slug";--> statement-breakpoint
DROP INDEX "idx_sessions_hash";--> statement-breakpoint
DROP INDEX "idx_users_email";--> statement-breakpoint
ALTER TABLE "option_groups" ADD COLUMN "affects_image" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variant_images" ADD CONSTRAINT "product_variant_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_product_id_group_id_option_groups_product_id_id_fk" FOREIGN KEY ("product_id","group_id") REFERENCES "public"."option_groups"("product_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_contact_messages_created_at" ON "contact_messages" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "option_compatibility_rules" ADD CONSTRAINT "option_compatibility_rules_product_id_primary_option_id_incompatible_option_id_unique" UNIQUE("product_id","primary_option_id","incompatible_option_id");