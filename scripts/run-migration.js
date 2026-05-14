const { Pool } = require("pg")
const fs = require("node:fs")
const path = require("node:path")

function loadEnv(filePath) {
  const content = fs.readFileSync(filePath, "utf-8")
  const env = {}
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1)
  }
  return env
}

const env = loadEnv(path.join(__dirname, "..", ".env.local"))
const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"]
const dbPassword = env["DATABASE_PASSWORD"]

if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local")
  process.exit(1)
}

if (!dbPassword) {
  console.error("Missing DATABASE_PASSWORD in .env.local")
  console.error("Get it from: Supabase Dashboard → Settings → Database → Connection string")
  console.error("The password is the part after 'postgresql://postgres.' and before '@' in the URI")
  console.error("Then run: DATABASE_PASSWORD=xxx node scripts/run-migration.js")
  process.exit(1)
}

const projectRef = new URL(supabaseUrl).hostname.split(".")[0]

const pool = new Pool({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: dbPassword,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  const sqlPath = path.join(__dirname, "..", "supabase", "migrations", "017_resume_quality_assessments.sql")
  const sql = fs.readFileSync(sqlPath, "utf-8")

  console.log("Running migration 017_resume_quality_assessments...")
  try {
    await pool.query(sql)
    console.log("Migration successful!")
  } catch (err) {
    console.error("Migration failed:", err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

run()
