import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260325091549 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "config" drop constraint if exists "config_key_unique";`);
    this.addSql(`create table if not exists "config" ("id" text not null, "key" text not null, "value" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "config_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_config_key_unique" ON "config" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_config_deleted_at" ON "config" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "config" cascade;`);
  }

}
