import * as http from 'http'
import log from 'electron-log'

export type HealthStatusCallback = (message: string, progress: number) => void

const TIMEOUT_MS = 180_000 // 3 minutes max
const POLL_INTERVAL_MS = 3_000

function checkUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      resolve(res.statusCode !== undefined && res.statusCode < 500)
    })
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
  })
}

export class HealthChecker {
  private readonly apiUrl: string
  private readonly appUrl: string

  constructor(apiUrl: string, appUrl: string) {
    this.apiUrl = apiUrl
    this.appUrl = appUrl
  }

  /**
   * Polls API and App health endpoints until both respond or timeout.
   * @returns true if both services became healthy, false on timeout.
   */
  async waitForReady(onStatus?: HealthStatusCallback): Promise<boolean> {
    const deadline = Date.now() + TIMEOUT_MS
    let apiReady = false
    let appReady = false

    log.info(`Waiting for services: API=${this.apiUrl} App=${this.appUrl}`)

    while (Date.now() < deadline) {
      const elapsed = Date.now() - (deadline - TIMEOUT_MS)
      const progress = Math.min(90, Math.floor((elapsed / TIMEOUT_MS) * 100))

      if (!apiReady) {
        apiReady = await checkUrl(`${this.apiUrl}/api/health`)
        if (apiReady) {
          log.info('API is ready')
          onStatus?.('API prête ✓', progress)
        } else {
          onStatus?.("Démarrage de l'API…", progress)
        }
      }

      if (apiReady && !appReady) {
        appReady = await checkUrl(`${this.appUrl}/api/health`)
        if (appReady) {
          log.info('App is ready')
          onStatus?.('Application prête ✓', progress)
        } else {
          onStatus?.("Démarrage de l'application…", progress)
        }
      }

      if (apiReady && appReady) {
        onStatus?.('TabibPro est prêt !', 100)
        return true
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    }

    log.warn('Health check timed out')
    return false
  }
}
