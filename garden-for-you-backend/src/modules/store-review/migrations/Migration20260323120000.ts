import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260323120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "store_review" add column if not exists "phone" text null;`,
    );
    this.addSql(
      `alter table if exists "store_review" add column if not exists "store_reply" text null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "store_review" drop column if exists "store_reply";`,
    );
    this.addSql(
      `alter table if exists "store_review" drop column if exists "phone";`,
    );
  }
}
