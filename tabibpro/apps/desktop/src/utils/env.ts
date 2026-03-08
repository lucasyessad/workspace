import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { app } from 'electron'

const ENV_FILENAME = '.env'

function generateSecret(length = 48): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Manages the .env file stored in the user's app data directory.
 * On first run, generates secure random credentials.
 */
export class EnvManager {
  private readonly dataDir: string
  private readonly envPath: string

  constructor() {
    this.dataDir = app.getPath('userData')
    this.envPath = path.join(this.dataDir, ENV_FILENAME)
  }

  /**
   * Returns the path to the .env file, creating it with random secrets if needed.
   */
  ensureEnv(): string {
    if (!fs.existsSync(this.envPath)) {
      this.createFromDefaults()
    }
    return this.envPath
  }

  isFirstRun(): boolean {
    return !fs.existsSync(this.envPath)
  }

  getDataDir(): string {
    return this.dataDir
  }

  private createFromDefaults(): void {
    const examplePath = path.join(process.resourcesPath, '.env.desktop.example')
    let template = ''

    if (fs.existsSync(examplePath)) {
      template = fs.readFileSync(examplePath, 'utf-8')
    } else {
      // Fallback minimal template
      template = fs.readFileSync(
        path.join(__dirname, '..', '..', '..', '..', '.env.desktop.example'),
        'utf-8',
      )
    }

    const dbMedicalPassword = generateSecret(24)
    const dbServicePassword = generateSecret(24)
    const redisPassword = generateSecret(24)
    const minioSecret = generateSecret(24)
    const meilisearchKey = generateSecret(32)
    const jwtSecret = generateSecret(48)
    const encryptionKey = generateSecret(32)

    let content = template
      .replace(/DB_MEDICAL_PASSWORD=.*/g, `DB_MEDICAL_PASSWORD=${dbMedicalPassword}`)
      .replace(/DB_SERVICE_PASSWORD=.*/g, `DB_SERVICE_PASSWORD=${dbServicePassword}`)
      .replace(/DB_MEDICAL_URL=.*/g, `DB_MEDICAL_URL=postgresql://tabibpro:${dbMedicalPassword}@localhost:5432/tabibpro_medical`)
      .replace(/DB_SERVICE_URL=.*/g, `DB_SERVICE_URL=postgresql://tabibpro:${dbServicePassword}@localhost:5433/tabibpro_service`)
      .replace(/REDIS_PASSWORD=.*/g, `REDIS_PASSWORD=${redisPassword}`)
      .replace(/MINIO_SECRET_KEY=.*/g, `MINIO_SECRET_KEY=${minioSecret}`)
      .replace(/MEILISEARCH_API_KEY=.*/g, `MEILISEARCH_API_KEY=${meilisearchKey}`)
      .replace(/JWT_SECRET=.*/g, `JWT_SECRET=${jwtSecret}`)
      .replace(/ENCRYPTION_KEY=.*/g, `ENCRYPTION_KEY=${encryptionKey}`)

    fs.mkdirSync(this.dataDir, { recursive: true })
    fs.writeFileSync(this.envPath, content, { encoding: 'utf-8', mode: 0o600 })
  }
}
