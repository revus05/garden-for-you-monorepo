import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260322205002 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "store_review" ("id" text not null, "customer_id" text null, "author_name" text not null, "rating" integer not null, "message" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_store_review_deleted_at" ON "store_review" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store_review" cascade;`);
  }

}
