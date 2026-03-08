import { spawn, exec } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import log from 'electron-log'

const DOCKER_COMMON_PATHS: Record<string, string[]> = {
  win32: [
    'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe',
    'C:\\ProgramData\\DockerDesktop\\version-bin\\docker.exe',
  ],
  darwin: [
    '/usr/local/bin/docker',
    '/opt/homebrew/bin/docker',
    '/Applications/Docker.app/Contents/Resources/bin/docker',
  ],
  linux: ['/usr/bin/docker', '/usr/local/bin/docker'],
}

function findDockerBin(): string {
  const paths = DOCKER_COMMON_PATHS[process.platform] ?? []
  for (const p of paths) {
    if (fs.existsSync(p)) return p
  }
  // Fallback: rely on PATH
  return 'docker'
}

function execAsync(command: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 15_000 }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message))
      else resolve({ stdout, stderr })
    })
  })
}

export type StatusCallback = (message: string) => void

export class DockerManager {
  private readonly composeFile: string
  private readonly envFile: string
  private readonly docker: string

  constructor(composeFile: string, envFile: string) {
    this.composeFile = composeFile
    this.envFile = envFile
    this.docker = findDockerBin()
    log.info(`Docker binary: ${this.docker}`)
    log.info(`Compose file: ${this.composeFile}`)
    log.info(`Env file: ${this.envFile}`)
  }

  /**
   * Checks if Docker daemon is reachable.
   */
  async isDockerAvailable(): Promise<boolean> {
    try {
      await execAsync(`"${this.docker}" info`)
      return true
    } catch {
      try {
        // Also try via PATH without quotes
        await execAsync('docker info')
        return true
      } catch {
        return false
      }
    }
  }

  /**
   * Pulls latest images and starts all services in detached mode.
   */
  async start(onStatus?: StatusCallback): Promise<void> {
    onStatus?.('Démarrage des services TabibPro…')

    const args = [
      'compose',
      '-f', this.composeFile,
      '--env-file', this.envFile,
      'up',
      '--detach',
      '--remove-orphans',
    ]

    return new Promise((resolve, reject) => {
      log.info(`Running: ${this.docker} ${args.join(' ')}`)
      const child = spawn(this.docker, args, { stdio: ['ignore', 'pipe', 'pipe'] })

      child.stdout.on('data', (data: Buffer) => {
        const line = data.toString().trim()
        if (line) {
          log.info(`[compose] ${line}`)
          onStatus?.(line)
        }
      })

      child.stderr.on('data', (data: Buffer) => {
        const line = data.toString().trim()
        if (line) log.warn(`[compose stderr] ${line}`)
      })

      child.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`docker compose up exited with code ${code}`))
      })

      child.on('error', (err) => reject(err))
    })
  }

  /**
   * Stops and removes all desktop containers.
   */
  async stop(onStatus?: StatusCallback): Promise<void> {
    onStatus?.('Arrêt des services…')

    const args = [
      'compose',
      '-f', this.composeFile,
      '--env-file', this.envFile,
      'down',
    ]

    return new Promise((resolve, reject) => {
      const child = spawn(this.docker, args, { stdio: ['ignore', 'pipe', 'pipe'] })

      child.stdout.on('data', (data: Buffer) => {
        log.info(`[compose down] ${data.toString().trim()}`)
      })

      child.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`docker compose down exited with code ${code}`))
      })

      child.on('error', reject)
    })
  }

  /**
   * Returns logs for the given service (last N lines).
   */
  async logs(service: string, tail = 50): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `"${this.docker}" compose -f "${this.composeFile}" logs --tail=${tail} ${service}`,
      )
      return stdout
    } catch (e) {
      return String(e)
    }
  }
}
