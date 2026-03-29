import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260328130000 extends Migration {

  override async up(): Promise<void> {
    // Переименовываем колонку spec_definition_id -> definition_id если она ещё существует.
    // На свежей БД Migration20260328120000 уже создаёт колонку с именем definition_id,
    // поэтому переименование нужно только для существующих БД со старой схемой.
    this.addSql(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'product_spec' AND column_name = 'spec_definition_id'
        ) THEN
          ALTER TABLE "product_spec" RENAME COLUMN "spec_definition_id" TO "definition_id";
        END IF;
      END $$;
    `)

    // Пересоздаём индексы с правильным именем колонки
    this.addSql(`DROP INDEX IF EXISTS "IDX_product_spec_product_definition";`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_spec_product_definition" ON "product_spec" ("product_id", "definition_id") WHERE deleted_at IS NULL;`)
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_product_spec_product_definition";`)
    this.addSql(`ALTER TABLE "product_spec" RENAME COLUMN "definition_id" TO "spec_definition_id";`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_spec_product_definition" ON "product_spec" ("product_id", "spec_definition_id") WHERE deleted_at IS NULL;`)
  }

}
