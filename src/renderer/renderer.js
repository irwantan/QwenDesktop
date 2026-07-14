// Qwen Code Desktop - Renderer Script

// State
let currentPath = '';
let sandboxFolders = [];
let selectedFolder = null;

// DOM Elements
const views = {
  sandbox: document.getElementById('view-sandbox'),
  files: document.getElementById('view-files'),
  terminal: document.getElementById('view-terminal'),
  settings: document.getElementById('view-settings')
};

const navBtns = document.querySelectorAll('.nav-btn');
const toast = document.getElementById('toast');

// Initialize
async function init() {
  await loadSandboxConfig();
  await checkQwenCLI();
  await loadAppInfo();
  setupEventListeners();
}

// Show toast notification
function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Switch view
function showView(viewName) {
  // Hide all views
  Object.values(views).forEach(view => view.classList.remove('active'));
  navBtns.forEach(btn => btn.classList.remove('active'));
  
  // Show selected view
  views[viewName].classList.add('active');
  
  // Update nav button
  const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  // Load data for view
  if (viewName === 'files') {
    loadFileBrowser();
  } else if (viewName === 'terminal') {
    updateTerminalCwdOptions();
  }
}

// Setup event listeners
function setupEventListeners() {
  // Navigation
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewName = btn.dataset.view;
      showView(viewName);
    });
  });
  
  // Add folder button
  document.getElementById('btn-add-folder').addEventListener('click', addSandboxFolder);
  
  // Terminal
  document.getElementById('btn-run-command').addEventListener('click', runQwenCommand);
  document.getElementById('terminal-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      runQwenCommand();
    }
  });
}

// Load sandbox configuration
async function loadSandboxConfig() {
  try {
    const config = await window.qwenAPI.getSandboxConfig();
    sandboxFolders = config.allowedFolders || [];
    renderSandboxFolders();
  } catch (err) {
    showToast('Failed to load sandbox config', 'error');
  }
}

// Render sandbox folders list
function renderSandboxFolders() {
  const container = document.getElementById('sandbox-folder-list');
  
  if (sandboxFolders.length === 0) {
    container.innerHTML = '<p class="empty-state">No sandbox folders configured. Click "Add Sandbox Folder" to get started.</p>';
    return;
  }
  
  container.innerHTML = sandboxFolders.map(folder => {
    const folderName = folder.split('\\').pop() || folder;
    return `
      <div class="folder-item">
        <div class="folder-path">
          <span class="folder-icon">📁</span>
          <div>
            <div class="folder-name">${escapeHtml(folderName)}</div>
            <div class="folder-full-path">${escapeHtml(folder)}</div>
          </div>
        </div>
        <div class="folder-actions">
          <button class="btn-icon" onclick="browseFolder('${escapeHtml(folder)}')" title="Browse">📂</button>
          <button class="btn-icon" onclick="openInExplorer('${escapeHtml(folder)}')" title="Open in Explorer">🔗</button>
          <button class="btn-icon btn-danger" onclick="removeSandboxFolder('${escapeHtml(folder)}')" title="Remove">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// Add sandbox folder
async function addSandboxFolder() {
  try {
    const result = await window.qwenAPI.addAllowedFolder();
    
    if (result.success) {
      sandboxFolders.push(result.path);
      renderSandboxFolders();
      showToast('Folder added to sandbox', 'success');
    } else {
      showToast(result.error, 'error');
    }
  } catch (err) {
    showToast('Failed to add folder', 'error');
  }
}

// Remove sandbox folder
async function removeSandboxFolder(folderPath) {
  if (!confirm(`Remove ${folderPath} from sandbox?`)) {
    return;
  }
  
  try {
    const result = await window.qwenAPI.removeAllowedFolder(folderPath);
    
    if (result.success) {
      sandboxFolders = sandboxFolders.filter(f => f !== folderPath);
      renderSandboxFolders();
      showToast('Folder removed from sandbox', 'success');
    } else {
      showToast(result.error, 'error');
    }
  } catch (err) {
    showToast('Failed to remove folder', 'error');
  }
}

// Browse folder
function browseFolder(folderPath) {
  currentPath = folderPath;
  selectedFolder = folderPath;
  showView('files');
}

// Open in explorer
async function openInExplorer(folderPath) {
  try {
    const result = await window.qwenAPI.openInExplorer(folderPath);
    if (!result.success) {
      showToast(result.error, 'error');
    }
  } catch (err) {
    showToast('Failed to open folder', 'error');
  }
}

// Load file browser
async function loadFileBrowser() {
  const container = document.getElementById('file-list');
  const breadcrumb = document.getElementById('breadcrumb');
  
  if (!selectedFolder) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Select a sandbox folder to browse files</p>
        <button class="btn-secondary" onclick="showView('sandbox')">Go to Sandbox Settings</button>
      </div>
    `;
    breadcrumb.innerHTML = '<button class="breadcrumb-btn" data-path="">🏠 Home</button>';
    return;
  }
  
  // Update breadcrumb
  updateBreadcrumb();
  
  try {
    const result = await window.qwenAPI.listFiles(currentPath || selectedFolder);
    
    if (result.success) {
      renderFileList(result.files);
    } else {
      container.innerHTML = `<div class="empty-state"><p>${result.error}</p></div>`;
    }
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Error loading files</p></div>`;
  }
}

// Update breadcrumb
function updateBreadcrumb() {
  const breadcrumb = document.getElementById('breadcrumb');
  const parts = (currentPath || selectedFolder).split('\\');
  
  let html = '<button class="breadcrumb-btn" onclick="navigateTo(selectedFolder)">🏠 Home</button>';
  
  let pathSoFar = '';
  parts.forEach((part, index) => {
    if (index === 0 && part.includes(':')) {
      pathSoFar = part;
    } else {
      pathSoFar += '\\' + part;
    }
    
    html += `<button class="breadcrumb-btn" onclick="navigateTo('${pathSoFar}')">${escapeHtml(part)}</button>`;
  });
  
  breadcrumb.innerHTML = html;
}

// Navigate to folder
function navigateTo(folderPath) {
  currentPath = folderPath;
  loadFileBrowser();
}

// Render file list
function renderFileList(files) {
  const container = document.getElementById('file-list');
  
  if (files.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>This folder is empty</p></div>';
    return;
  }
  
  container.innerHTML = files.map(file => {
    const icon = file.isDirectory ? '📁' : getFileIcon(file.name);
    const size = file.isDirectory ? '' : formatFileSize(file.size);
    
    return `
      <div class="file-item" ondblclick="${file.isDirectory ? `navigateTo('${file.path}')` : ''}">
        <span class="file-icon">${icon}</span>
        <span class="file-name">${escapeHtml(file.name)}</span>
        ${size ? `<span class="file-size">${size}</span>` : ''}
        <div class="file-actions">
          ${!file.isDirectory ? `
            <button class="btn-icon" onclick="viewFile('${file.path}')" title="View">👁️</button>
            <button class="btn-icon" onclick="editFile('${file.path}')" title="Edit">✏️</button>
          ` : ''}
          <button class="btn-icon btn-danger" onclick="deleteItem('${file.path}')" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// Get file icon based on extension
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    js: '📄', jsx: '⚛️', ts: '📘', tsx: '⚛️',
    py: '🐍', rb: '💎', php: '🐘',
    html: '🌐', css: '🎨', scss: '🎨',
    json: '📋', xml: '📋', yaml: '📋', yml: '📋',
    md: '📝', txt: '📄',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️',
    zip: '📦', rar: '📦', tar: '📦', gz: '📦',
    exe: '⚙️', msi: '⚙️', bat: '⚙️', sh: '⚙️'
  };
  return icons[ext] || '📄';
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// View file
async function viewFile(filePath) {
  try {
    const result = await window.qwenAPI.readFile(filePath);
    if (result.success) {
      // Open in simple modal or new window
      const content = result.content;
      alert(content.substring(0, 500) + (content.length > 500 ? '\n\n...(truncated)' : ''));
    } else {
      showToast(result.error, 'error');
    }
  } catch (err) {
    showToast('Failed to read file', 'error');
  }
}

// Edit file
async function editFile(filePath) {
  try {
    const result = await window.qwenAPI.readFile(filePath);
    if (result.success) {
      const newContent = prompt('Edit file content:', result.content);
      if (newContent !== null) {
        const writeResult = await window.qwenAPI.writeFile(filePath, newContent);
        if (writeResult.success) {
          showToast('File saved', 'success');
          loadFileBrowser();
        } else {
          showToast(writeResult.error, 'error');
        }
      }
    } else {
      showToast(result.error, 'error');
    }
  } catch (err) {
    showToast('Failed to edit file', 'error');
  }
}

// Delete item
async function deleteItem(itemPath) {
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }
  
  try {
    const result = await window.qwenAPI.deleteItem(itemPath);
    if (result.success) {
      showToast('Item deleted', 'success');
      loadFileBrowser();
    } else {
      showToast(result.error, 'error');
    }
  } catch (err) {
    showToast('Failed to delete item', 'error');
  }
}

// Check Qwen CLI
async function checkQwenCLI() {
  const statusEl = document.getElementById('qwen-status');
  const statusDot = document.querySelector('.status-dot');
  
  statusEl.textContent = 'Checking...';
  statusDot.classList.add('checking');
  
  try {
    const result = await window.qwenAPI.checkQwenCLI();
    
    if (result.installed) {
      statusEl.textContent = `Qwen CLI: ${result.version}`;
      statusDot.classList.remove('checking');
      statusDot.classList.add('ready');
    } else {
      statusEl.textContent = 'Qwen CLI not installed';
      statusDot.classList.remove('checking');
      showToast('Qwen CLI is not installed. Install with: npm install -g @qwen-code/qwen-code', 'warning');
    }
  } catch (err) {
    statusEl.textContent = 'Error checking Qwen CLI';
    statusDot.classList.remove('checking');
  }
}

// Update terminal CWD options
function updateTerminalCwdOptions() {
  const select = document.getElementById('terminal-cwd');
  
  select.innerHTML = '<option value="">Select working directory...</option>';
  
  sandboxFolders.forEach(folder => {
    const option = document.createElement('option');
    option.value = folder;
    option.textContent = folder;
    select.appendChild(option);
  });
}

// Run Qwen command
async function runQwenCommand() {
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  const cwdSelect = document.getElementById('terminal-cwd');
  
  const args = input.value.trim();
  if (!args) {
    showToast('Please enter a command', 'warning');
    return;
  }
  
  const cwd = cwdSelect.value;
  const argsArray = args.split(' ');
  
  // Add command to output
  output.innerHTML += `
    <div class="command-entry">
      <span class="command">$ qwen ${escapeHtml(args)}</span>
    </div>
  `;
  
  input.value = '';
  output.scrollTop = output.scrollHeight;
  
  try {
    const result = await window.qwenAPI.runQwenCommand(argsArray, cwd);
    
    if (result.success) {
      if (result.stdout) {
        output.innerHTML += `<div class="command-output">${escapeHtml(result.stdout)}</div>`;
      }
      if (result.stderr) {
        output.innerHTML += `<div class="command-error">${escapeHtml(result.stderr)}</div>`;
      }
    } else {
      output.innerHTML += `<div class="command-error">${escapeHtml(result.error || 'Command failed')}</div>`;
    }
  } catch (err) {
    output.innerHTML += `<div class="command-error">${escapeHtml(err.message)}</div>`;
  }
  
  output.scrollTop = output.scrollHeight;
}

// Load app info
async function loadAppInfo() {
  try {
    const info = await window.qwenAPI.getAppInfo();
    
    document.getElementById('app-version').textContent = `v${info.version}`;
    document.getElementById('setting-version').textContent = `v${info.version}`;
    document.getElementById('setting-platform').textContent = info.platform;
    document.getElementById('setting-arch').textContent = info.arch;
    document.getElementById('setting-folders').textContent = info.sandboxFolders;
  } catch (err) {
    console.error('Failed to load app info:', err);
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions global
window.showView = showView;
window.browseFolder = browseFolder;
window.openInExplorer = openInExplorer;
window.removeSandboxFolder = removeSandboxFolder;
window.navigateTo = navigateTo;
window.viewFile = viewFile;
window.editFile = editFile;
window.deleteItem = deleteItem;

// Initialize app
init();
