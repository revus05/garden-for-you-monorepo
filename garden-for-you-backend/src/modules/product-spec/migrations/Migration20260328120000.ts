import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260328120000 extends Migration {

  override async up(): Promise<void> {
    // Справочник характеристик
    this.addSql(`
      create table if not exists "spec_definition" (
        "id" text not null,
        "name" text not null,
        "key" text not null,
        "unit" text null,
        "type" text not null default 'text',
        "options" jsonb null,
        "sort_order" integer not null default 0,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "spec_definition_pkey" primary key ("id")
      );
    `)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_spec_definition_key" ON "spec_definition" ("key") WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_spec_definition_deleted_at" ON "spec_definition" ("deleted_at") WHERE deleted_at IS NULL;`)

    // Значения характеристик для товаров
    this.addSql(`
      create table if not exists "product_spec" (
        "id" text not null,
        "product_id" text not null,
        "definition_id" text not null,
        "value" text not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "product_spec_pkey" primary key ("id"),
        constraint "product_spec_definition_fk" foreign key ("definition_id") references "spec_definition" ("id") on delete cascade
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_spec_product_id" ON "product_spec" ("product_id") WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_spec_deleted_at" ON "product_spec" ("deleted_at") WHERE deleted_at IS NULL;`)
    // Один товар — одно значение на каждую характеристику
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_spec_product_definition" ON "product_spec" ("product_id", "definition_id") WHERE deleted_at IS NULL;`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_spec" cascade;`)
    this.addSql(`drop table if exists "spec_definition" cascade;`)
  }

}
