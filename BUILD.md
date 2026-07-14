# Qwen Code Desktop - Build Instructions for Windows

## 📋 Prerequisites

Pastikan laptop Windows Anda sudah terinstall:

1. **Node.js** (versi 18 atau lebih baru)
   - Download: https://nodejs.org/
   - Pilih versi LTS

2. **Git** (opsional, untuk clone dari GitHub)
   - Download: https://git-scm.com/

---

## 🚀 Cara Build

### Opsi A: Build dari Source Code (Recommended)

#### Step 1: Install Dependencies

Buka **PowerShell** atau **Command Prompt** di folder project:

```powershell
cd C:\path\to\qwen-desktop-app
npm install
```

#### Step 2: Build Aplikasi Windows

```powershell
# Build installer (.exe)
npm run build

# ATAU build portable version (tidak perlu install)
npm run build:portable
```

#### Step 3: Hasil Build

Setelah build selesai, file akan ada di:

```
build/dist/
├── Qwen Code Desktop Setup x64.exe    # Installer
└── Qwen Code Desktop-1.0.0.exe         # Portable (jika build:portable)
```

---

### Opsi B: Download Pre-built (Jika Available)

Jika saya sudah push ke GitHub, Anda bisa download langsung:

1. Buka repository GitHub
2. Download file `.exe` dari **Releases**
3. Install/run langsung

---

## 📦 Install Aplikasi

### Untuk Installer (.exe):
1. Double-click `Qwen Code Desktop Setup x64.exe`
2. Follow installation wizard
3. Pilih install location (default: `C:\Program Files\Qwen Code Desktop`)
4. Finish - aplikasi akan muncul di Start Menu

### Untuk Portable Version:
1. Copy file `.exe` ke folder yang Anda mau
2. Double-click untuk run
3. Done!

---

## 🔧 Cara Pakai

1. **Buka Qwen Code Desktop**
2. **Add Sandbox Folder** - pilih folder mana yang boleh diakses
3. **Browse Files** - lihat dan edit files dalam sandbox
4. **Terminal** - jalankan Qwen CLI commands
5. **Done!** 🎉

---

## 🛠️ Troubleshooting

### Error: "Qwen CLI not installed"

Install Qwen Code CLI dulu:

```powershell
npm install -g @qwen-code/qwen-code
```

### Build Gagal: "electron-builder not found"

Install ulang dependencies:

```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Aplikasi Tidak Bisa Akses Folder

Pastikan folder sudah ditambahkan ke **Sandbox Folders** di aplikasi.

---

## 📁 Project Structure

```
qwen-desktop-app/
├── src/
│   ├── main/
│   │   ├── main.js       # Electron main process
│   │   └── preload.js    # Security bridge
│   └── renderer/
│       ├── index.html    # UI
│       ├── styles.css    # Styling
│       └── renderer.js   # Frontend logic
├── assets/               # Icons & images
├── build/                # Build output
├── package.json          # Dependencies & build config
└── README.md             # This file
```

---

## 🎯 Fitur

✅ **Sandbox System** - Batasi akses hanya ke folder yang dipilih
✅ **File Browser** - Browse, edit, delete files dalam sandbox
✅ **Terminal Integration** - Jalankan Qwen CLI langsung dari app
✅ **Security** - System folders (Windows, Program Files) selalu diblokir
✅ **Modern UI** - Dark theme, responsive design
✅ **Portable Option** - Tidak perlu install

---

## 📝 Notes

- Aplikasi ini menggunakan **Electron** framework
- Sandbox security ada di level aplikasi, bukan OS-level
- Untuk production use, pertimbangkan untuk sign aplikasi dengan certificate

---

**Happy Coding!** 🚀
