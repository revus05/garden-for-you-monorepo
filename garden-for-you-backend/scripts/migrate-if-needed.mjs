/**
 * Runs `medusa db:migrate` only when there are pending migrations.
 * Avoids the cost of loading the full Medusa runtime on every deploy
 * when no migration files have changed.
 */

import { execSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { join, basename } from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const require = createRequire(import.meta.url)

// Load .env for local development (no-op in Railway where vars are injected)
try {
  const dotenv = require("dotenv")
  dotenv.config({ path: join(__dirname, "../.env") })
} catch {
  // dotenv not available — rely on environment variables
}

const { Client } = require("pg")

// Find all compiled migration files in .medusa/server
function getMigrationFiles() {
  const serverDir = join(__dirname, "../.medusa/server/src")
  const names = []

  function walk(dir) {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (
        entry.isFile() &&
        entry.name.startsWith("Migration") &&
        entry.name.endsWith(".js") &&
        full.replace(/\\/g, "/").includes("/migrations/")
      ) {
        names.push(basename(entry.name, ".js"))
      }
    }
  }

  walk(serverDir)
  return names
}

const migrationFiles = getMigrationFiles()

if (migrationFiles.length === 0) {
  console.log("No migration files found, skipping db:migrate.")
  process.exit(0)
}

const client = new Client({ connectionString: process.env.DATABASE_URL })

try {
  await client.connect()

  // Check if the migrations table exists (fresh DB)
  const { rows: tableExists } = await client.query(`
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'mikro_orm_migrations'
  `)

  if (tableExists.length === 0) {
    console.log("Fresh database detected, running all migrations...")
    execSync("npx medusa db:migrate", { stdio: "inherit" })
    process.exit(0)
  }

  const { rows } = await client.query(
    "SELECT name FROM mikro_orm_migrations"
  )
  const applied = new Set(rows.map((r) => r.name))
  const pending = migrationFiles.filter((name) => !applied.has(name))

  if (pending.length === 0) {
    console.log(
      `All ${migrationFiles.length} migrations already applied, skipping db:migrate.`
    )
  } else {
    console.log(
      `Found ${pending.length} pending migration(s): ${pending.join(", ")}`
    )
    execSync("npx medusa db:migrate", { stdio: "inherit" })
  }
} finally {
  await client.end()
}
