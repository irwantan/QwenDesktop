const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('qwenAPI', {
  // Sandbox configuration
  getSandboxConfig: () => ipcRenderer.invoke('get-sandbox-config'),
  addAllowedFolder: () => ipcRenderer.invoke('add-allowed-folder'),
  removeAllowedFolder: (path) => ipcRenderer.invoke('remove-allowed-folder', path),
  
  // File operations
  listFiles: (path) => ipcRenderer.invoke('list-files', path),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, content) => ipcRenderer.invoke('write-file', path, content),
  createDirectory: (path) => ipcRenderer.invoke('create-directory', path),
  deleteItem: (path) => ipcRenderer.invoke('delete-item', path),
  
  // Qwen CLI
  checkQwenCLI: () => ipcRenderer.invoke('check-qwen-cli'),
  runQwenCommand: (args, cwd) => ipcRenderer.invoke('run-qwen-command', args, cwd),
  
  // System
  openInExplorer: (path) => ipcRenderer.invoke('open-in-explorer', path),
  getAppInfo: () => ipcRenderer.invoke('get-app-info')
});
