import { contextBridge, ipcRenderer, shell } from 'electron'

contextBridge.exposeInMainWorld('tabibpro', {
  // App metadata
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  getDataPath: (): Promise<string> => ipcRenderer.invoke('app:dataPath'),

  // Shell
  openExternal: (url: string): void => {
    // Only allow http/https URLs
    if (/^https?:\/\//.test(url)) {
      shell.openExternal(url)
    }
  },

  // Service health
  onStatus: (callback: (message: string, progress: number) => void): (() => void) => {
    const handler = (_: unknown, message: string, progress: number): void =>
      callback(message, progress)
    ipcRenderer.on('status', handler)
    return () => ipcRenderer.removeListener('status', handler)
  },
})
