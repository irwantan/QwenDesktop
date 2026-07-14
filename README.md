# 🤖 Qwen Code Desktop

Qwen Code Desktop adalah aplikasi desktop untuk Windows yang menyediakan interface modern untuk Qwen Code CLI dengan fitur **Sandbox Security** untuk membatasi akses file system.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🔒 Sandbox Security
- **Folder-level Access Control** - Pilih folder mana yang boleh diakses
- **System Folder Protection** - Windows, Program Files selalu diblokir
- **Visual Feedback** - Lihat folder mana yang sudah diizinkan

### 📂 File Browser
- **Browse Files** - Navigasi folder dalam sandbox
- **Edit Files** - Edit file langsung dari aplikasi
- **Delete Management** - Hapus files/folders dengan konfirmasi
- **Open in Explorer** - Buka folder di Windows Explorer

### 💻 Terminal Integration
- **Qwen CLI Ready** - Jalankan perintah Qwen langsung
- **Working Directory** - Pilih folder kerja dari sandbox
- **Output Display** - Lihat hasil command dengan jelas

### 🎨 Modern UI
- **Dark Theme** - Nyaman di mata untuk coding lama
- **Responsive Design** - Adaptif di berbagai ukuran layar
- **Intuitive Navigation** - Mudah digunakan

---

## 📸 Screenshots

*(Placeholder - akan diisi setelah build)*

---

## 🚀 Quick Start

### Install Qwen Code CLI (Required)

```powershell
npm install -g @qwen-code/qwen-code
```

### Build from Source

```powershell
# Install dependencies
npm install

# Build installer
npm run build

# Build portable version
npm run build:portable
```

### Download Pre-built

Lihat [Releases](https://github.com/yourusername/qwen-code-desktop/releases) untuk download installer siap pakai.

---

## 📖 Usage Guide

### 1. First Time Setup

1. Buka aplikasi
2. Klik **"Add Sandbox Folder"**
3. Pilih folder yang ingin Anda berikan akses ke Qwen Code
4. Folder akan muncul di daftar **"Allowed Folders"**

### 2. Browse Files

1. Klik menu **"File Browser"** di sidebar
2. Pilih folder dari sandbox
3. Double-click folder untuk navigasi
4. Click icon untuk edit/delete files

### 3. Run Qwen Commands

1. Klik menu **"Terminal"** di sidebar
2. Pilih working directory dari dropdown
3. Ketik command (tanpa "qwen" prefix)
4. Contoh: `init my-project` atau `--help`
5. Click **"Run"** atau tekan Enter

---

## 🛡️ Security

### Blocked Folders (Always)
- `C:\Windows`
- `C:\Program Files`
- `C:\Program Files (x86)`
- `C:\$Recycle.Bin`
- `C:\System Volume Information`
- `C:\Recovery`
- `C:\ProgramData`

### Allowed Folders (User Defined)
- Hanya folder yang Anda tambahkan secara eksplisit
- Bisa dihapus kapan saja dari sandbox
- Perubahan tersimpan di app data

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Electron Main Process       │
│  - Window Management                │
│  - IPC Handlers                     │
│  - Sandbox Validation               │
│  - File System Access               │
└──────────────┬──────────────────────┘
               │ IPC Bridge
┌──────────────▼──────────────────────┐
│      Electron Renderer Process      │
│  - UI (HTML/CSS/JS)                 │
│  - User Interactions                │
│  - Display Logic                    │
└─────────────────────────────────────┘
```

---

## 📁 Project Structure

```
qwen-desktop-app/
├── src/
│   ├── main/
│   │   ├── main.js         # Main process, sandbox logic
│   │   └── preload.js      # Secure IPC bridge
│   └── renderer/
│       ├── index.html      # App structure
│       ├── styles.css      # Dark theme styling
│       └── renderer.js     # UI interactions
├── assets/
│   └── icon.png            # App icon
├── build/
│   └── dist/               # Build output
├── package.json            # Dependencies & build config
├── BUILD.md                # Detailed build instructions
└── README.md               # This file
```

---

## 🛠️ Development

### Run in Development Mode

```powershell
npm install
npm start
```

### Build for Production

```powershell
# Full installer
npm run build

# Portable executable
npm run build:portable
```

---

## 📋 Requirements

### Build Requirements
- Node.js 18+
- npm or yarn
- Windows 10/11 (untuk build)

### Runtime Requirements
- Windows 10/11
- Qwen Code CLI (optional, untuk full functionality)
- .NET Framework 4.5+ (biasanya sudah ada di Windows)

---

## 🤝 Contributing

Contributions are welcome! Silakan:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📝 Changelog

### v1.0.0 (2026)
- Initial release
- Sandbox folder management
- File browser with edit capabilities
- Terminal integration for Qwen CLI
- Dark theme UI
- Security: System folder blocking

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Powered by [Qwen Code](https://github.com/qwen-code/qwen-code)
- Icons by various open source projects

---

## 📬 Support

Untuk pertanyaan atau issue:
- GitHub Issues: [Create new issue](https://github.com/yourusername/qwen-code-desktop/issues)
- Email: your.email@example.com

---

**Happy Coding with Qwen Code Desktop!** 🎉
