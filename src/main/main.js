const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Sandbox configuration
let sandboxConfig = {
  allowedFolders: [],
  blockedPaths: [
    'C:\\Windows',
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    'C:\\$Recycle.Bin',
    'C:\\System Volume Information',
    'C:\\Recovery',
    'C:\\ProgramData'
  ]
};

// Load sandbox config from file
const sandboxConfigPath = path.join(app.getPath('userData'), 'sandbox-config.json');

function loadSandboxConfig() {
  try {
    if (fs.existsSync(sandboxConfigPath)) {
      const saved = JSON.parse(fs.readFileSync(sandboxConfigPath, 'utf-8'));
      sandboxConfig = { ...sandboxConfig, ...saved };
    }
  } catch (err) {
    console.error('Error loading sandbox config:', err);
  }
}

function saveSandboxConfig() {
  try {
    fs.writeFileSync(sandboxConfigPath, JSON.stringify(sandboxConfig, null, 2));
  } catch (err) {
    console.error('Error saving sandbox config:', err);
  }
}

// Check if path is within allowed folders
function isPathAllowed(filePath) {
  // Normalize paths
  const normalizedPath = path.normalize(filePath).toLowerCase();
  
  // Check if path is blocked
  for (const blocked of sandboxConfig.blockedPaths) {
    if (normalizedPath.startsWith(blocked.toLowerCase())) {
      return false;
    }
  }
  
  // Check if path is within allowed folders
  if (sandboxConfig.allowedFolders.length === 0) {
    return false;
  }
  
  for (const allowed of sandboxConfig.allowedFolders) {
    if (normalizedPath.startsWith(allowed.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

// Create main window
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icon.png'),
    titleBarStyle: 'default',
    frame: true
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ready
app.whenReady().then(() => {
  loadSandboxConfig();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ============================================
// IPC Handlers for Sandbox Operations
// ============================================

// Get sandbox configuration
ipcMain.handle('get-sandbox-config', () => {
  return sandboxConfig;
});

// Add allowed folder
ipcMain.handle('add-allowed-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const folderPath = result.filePaths[0];
    
    // Check if not blocked
    const normalizedPath = folderPath.toLowerCase();
    let isBlocked = false;
    
    for (const blocked of sandboxConfig.blockedPaths) {
      if (normalizedPath.startsWith(blocked.toLowerCase())) {
        isBlocked = true;
        break;
      }
    }
    
    if (isBlocked) {
      return { success: false, error: 'Folder ini adalah system folder dan tidak dapat ditambahkan ke sandbox.' };
    }
    
    // Add if not already exists
    if (!sandboxConfig.allowedFolders.includes(folderPath)) {
      sandboxConfig.allowedFolders.push(folderPath);
      saveSandboxConfig();
    }
    
    return { success: true, path: folderPath };
  }
  
  return { success: false, error: 'No folder selected' };
});

// Remove allowed folder
ipcMain.handle('remove-allowed-folder', (event, folderPath) => {
  const index = sandboxConfig.allowedFolders.indexOf(folderPath);
  if (index > -1) {
    sandboxConfig.allowedFolders.splice(index, 1);
    saveSandboxConfig();
    return { success: true };
  }
  return { success: false, error: 'Folder not found' };
});

// List files in allowed folder
ipcMain.handle('list-files', async (event, folderPath) => {
  if (!isPathAllowed(folderPath)) {
    return { success: false, error: 'Akses ditolak: Folder ini tidak berada dalam sandbox.' };
  }
  
  try {
    const items = await fs.promises.readdir(folderPath, { withFileTypes: true });
    const files = [];
    
    for (const item of items) {
      // Skip hidden and system files
      if (item.name.startsWith('.') && item.name !== '.qwen') {
        continue;
      }
      
      const fullPath = path.join(folderPath, item.name);
      
      // Only allow if within sandbox
      if (!isPathAllowed(fullPath)) {
        continue;
      }
      
      let stats;
      try {
        stats = await fs.promises.stat(fullPath);
      } catch (err) {
        continue;
      }
      
      files.push({
        name: item.name,
        path: fullPath,
        isDirectory: item.isDirectory(),
        size: stats.size,
        modified: stats.mtime.toISOString()
      });
    }
    
    // Sort: directories first, then files
    files.sort((a, b) => {
      if (a.isDirectory === b.isDirectory) {
        return a.name.localeCompare(b.name);
      }
      return a.isDirectory ? -1 : 1;
    });
    
    return { success: true, files };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Read file content
ipcMain.handle('read-file', async (event, filePath) => {
  if (!isPathAllowed(filePath)) {
    return { success: false, error: 'Akses ditolak: File ini tidak berada dalam sandbox.' };
  }
  
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Write file content
ipcMain.handle('write-file', async (event, filePath, content) => {
  if (!isPathAllowed(filePath)) {
    return { success: false, error: 'Akses ditolak: File ini tidak berada dalam sandbox.' };
  }
  
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Create directory
ipcMain.handle('create-directory', async (event, dirPath) => {
  if (!isPathAllowed(dirPath)) {
    return { success: false, error: 'Akses ditolak: Folder ini tidak berada dalam sandbox.' };
  }
  
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Delete file/folder
ipcMain.handle('delete-item', async (event, itemPath) => {
  if (!isPathAllowed(itemPath)) {
    return { success: false, error: 'Akses ditolak: Item ini tidak berada dalam sandbox.' };
  }
  
  try {
    const stats = await fs.promises.stat(itemPath);
    if (stats.isDirectory()) {
      await fs.promises.rm(itemPath, { recursive: true, force: true });
    } else {
      await fs.promises.unlink(itemPath);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Check if Qwen CLI is installed
ipcMain.handle('check-qwen-cli', async () => {
  return new Promise((resolve) => {
    const check = spawn('qwen', ['--version'], { shell: true });
    let output = '';
    
    check.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    check.on('close', (code) => {
      if (code === 0) {
        resolve({ installed: true, version: output.trim() });
      } else {
        resolve({ installed: false, error: 'Qwen CLI tidak terinstall' });
      }
    });
    
    check.on('error', () => {
      resolve({ installed: false, error: 'Qwen CLI tidak ditemukan' });
    });
    
    // Timeout after 3 seconds
    setTimeout(() => {
      resolve({ installed: false, error: 'Timeout checking Qwen CLI' });
    }, 3000);
  });
});

// Run Qwen CLI command
ipcMain.handle('run-qwen-command', async (event, args, cwd) => {
  if (cwd && !isPathAllowed(cwd)) {
    return { success: false, error: 'Akses ditolak: Working directory tidak dalam sandbox.' };
  }
  
  return new Promise((resolve) => {
    const qwen = spawn('qwen', args, {
      cwd: cwd || undefined,
      shell: true,
      env: { ...process.env }
    });
    
    let stdout = '';
    let stderr = '';
    
    qwen.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    qwen.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    qwen.on('close', (code) => {
      resolve({
        success: code === 0,
        code,
        stdout,
        stderr
      });
    });
    
    qwen.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });
    
    // Timeout after 5 minutes
    setTimeout(() => {
      qwen.kill();
      resolve({ success: false, error: 'Command timeout' });
    }, 300000);
  });
});

// Open folder in system file explorer
ipcMain.handle('open-in-explorer', async (event, folderPath) => {
  if (!isPathAllowed(folderPath)) {
    return { success: false, error: 'Akses ditolak.' };
  }
  
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Get app info
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    sandboxFolders: sandboxConfig.allowedFolders.length
  };
});
