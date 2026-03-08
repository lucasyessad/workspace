import { app, BrowserWindow, Tray, Menu, shell, dialog, ipcMain, nativeImage } from 'electron'
import * as path from 'path'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import { DockerManager } from './utils/docker'
import { EnvManager } from './utils/env'
import { HealthChecker } from './utils/health'

// ── Constants ──────────────────────────────────────────────────────────────
const APP_URL = 'http://localhost:3000'
const API_URL = 'http://localhost:3001'

// ── State ──────────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null
let tray: Tray | null = null
let dockerManager: DockerManager
let isQuitting = false

// ── Logging ────────────────────────────────────────────────────────────────
log.transports.file.level = 'info'
log.transports.console.level = 'debug'
log.initialize()

// ── Single instance lock ───────────────────────────────────────────────────
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
})

// ── IPC handlers ──────────────────────────────────────────────────────────
ipcMain.handle('app:version', () => app.getVersion())
ipcMain.handle('app:dataPath', () => app.getPath('userData'))

// ── Window helpers ────────────────────────────────────────────────────────
function createSplashWindow(): void {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 320,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  splashWindow.loadFile(path.join(__dirname, 'splash.html'))
  splashWindow.once('ready-to-show', () => splashWindow?.show())
}

function sendStatus(message: string, progress: number): void {
  splashWindow?.webContents.send('status', message, progress)
  log.info(`[status] ${message} (${progress}%)`)
}

async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    title: 'TabibPro',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.loadURL(APP_URL)

  mainWindow.once('ready-to-show', () => {
    splashWindow?.close()
    splashWindow = null
    mainWindow?.show()
    log.info('Main window ready')
  })

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Intercept close → hide to tray instead
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createTray(): void {
  // Use a blank icon as placeholder; replace resources/icon.ico / icon.icns with real assets
  const iconPath = path.join(
    process.resourcesPath,
    process.platform === 'win32' ? 'icon.ico' : 'icon.icns',
  )
  const icon = nativeImage.createFromPath(iconPath).isEmpty()
    ? nativeImage.createEmpty()
    : nativeImage.createFromPath(iconPath)

  tray = new Tray(icon)

  const menu = Menu.buildFromTemplate([
    {
      label: 'Ouvrir TabibPro',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      },
    },
    { type: 'separator' },
    {
      label: 'Portail Patient',
      click: () => shell.openExternal('http://localhost:3002'),
    },
    {
      label: 'MinIO (Fichiers)',
      click: () => shell.openExternal('http://localhost:9001'),
    },
    { type: 'separator' },
    {
      label: 'État des services',
      click: () => shell.openExternal(`${API_URL}/api/health`),
    },
    {
      label: 'Journaux',
      click: () => shell.openPath(app.getPath('logs')),
    },
    { type: 'separator' },
    {
      label: 'Quitter TabibPro',
      click: () => gracefulShutdown(),
    },
  ])

  tray.setContextMenu(menu)
  tray.setToolTip('TabibPro — Gestion médicale')
  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}

// ── Graceful shutdown ─────────────────────────────────────────────────────
async function gracefulShutdown(): Promise<void> {
  const { response } = await dialog.showMessageBox({
    type: 'question',
    title: 'Quitter TabibPro',
    message: 'Comment voulez-vous quitter TabibPro ?',
    detail:
      'Arrêter les services libère les ressources mais les données seront préservées.\n' +
      'Laisser en arrière-plan permet un redémarrage plus rapide.',
    buttons: ['Arrêter les services', 'Laisser en arrière-plan', 'Annuler'],
    defaultId: 0,
    cancelId: 2,
  })

  if (response === 2) return

  isQuitting = true

  if (response === 0) {
    try {
      await dockerManager?.stop((msg) => log.info(msg))
    } catch (e) {
      log.error('Error stopping services:', e)
    }
  }

  tray?.destroy()
  mainWindow?.destroy()
  app.quit()
}

// ── Bootstrap ─────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  createSplashWindow()

  // Give splash time to render
  await new Promise((r) => setTimeout(r, 500))

  // Resolve paths
  const envManager = new EnvManager()
  const isFirstRun = envManager.isFirstRun()
  const envFile = envManager.ensureEnv()

  const composeFile = (() => {
    const bundled = path.join(process.resourcesPath, 'docker-compose.desktop.yml')
    const dev = path.join(__dirname, '..', '..', '..', '..', 'docker-compose.desktop.yml')
    const { existsSync } = require('fs') as typeof import('fs')
    return existsSync(bundled) ? bundled : dev
  })()

  log.info(`First run: ${isFirstRun}`)
  log.info(`Env file: ${envFile}`)
  log.info(`Compose file: ${composeFile}`)

  dockerManager = new DockerManager(composeFile, envFile)

  // Check Docker Desktop
  sendStatus('Vérification de Docker Desktop…', 5)
  const dockerAvailable = await dockerManager.isDockerAvailable()

  if (!dockerAvailable) {
    splashWindow?.close()
    const { response } = await dialog.showMessageBox({
      type: 'error',
      title: 'Docker Desktop requis',
      message: 'Docker Desktop n\'est pas détecté.',
      detail:
        'TabibPro nécessite Docker Desktop pour fonctionner.\n\n' +
        'Veuillez :\n' +
        '1. Télécharger Docker Desktop depuis docker.com\n' +
        '2. L\'installer et le démarrer\n' +
        '3. Relancer TabibPro',
      buttons: ['Télécharger Docker Desktop', 'Quitter'],
      defaultId: 0,
    })

    if (response === 0) {
      shell.openExternal('https://www.docker.com/products/docker-desktop/')
    }
    app.quit()
    return
  }

  // Start services
  sendStatus('Démarrage des services…', 15)
  try {
    await dockerManager.start((msg) => {
      sendStatus(msg.slice(0, 80), 30)
    })
  } catch (e) {
    log.error('Failed to start services:', e)
    splashWindow?.close()

    const { response } = await dialog.showMessageBox({
      type: 'error',
      title: 'Erreur de démarrage',
      message: 'Impossible de démarrer les services TabibPro.',
      detail: String(e),
      buttons: ['Voir les journaux', 'Quitter'],
    })

    if (response === 0) shell.openPath(app.getPath('logs'))
    app.quit()
    return
  }

  // Wait for services to be healthy
  sendStatus('Attente que les services soient prêts…', 40)
  const checker = new HealthChecker(API_URL, APP_URL)
  const ready = await checker.waitForReady((msg, progress) => {
    sendStatus(msg, 40 + Math.floor(progress * 0.55))
  })

  if (!ready) {
    log.warn('Services took too long to start — opening anyway')
  }

  createTray()
  await createMainWindow()

  if (isFirstRun) {
    log.info('First run: showing welcome notification')
    tray?.displayBalloon?.({
      iconType: 'info',
      title: 'TabibPro est prêt !',
      content: 'Vos données sont stockées localement et sécurisées.',
    })
  }

  // Check for updates
  autoUpdater.checkForUpdatesAndNotify().catch((e) => log.warn('Auto-update check failed:', e))
}

// ── App lifecycle ─────────────────────────────────────────────────────────
app.whenReady().then(bootstrap).catch((e) => {
  log.error('Fatal error during bootstrap:', e)
  dialog.showErrorBox('Erreur fatale', String(e))
  app.quit()
})

app.on('window-all-closed', () => {
  // Do not quit — managed by tray
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('activate', () => {
  // macOS: re-open window when clicking dock icon
  if (mainWindow) {
    mainWindow.show()
  }
})
