# 🚀 Quick Start Guide - Qwen Code Desktop

## ✅ Yang Sudah Saya Buat

Saya sudah membuat **Qwen Code Desktop App** lengkap dengan:

```
qwen-desktop-app/
├── src/main/main.js          # Core app + Sandbox security
├── src/main/preload.js       # Security bridge
├── src/renderer/*            # UI (HTML/CSS/JS)
├── package.json              # Config & dependencies
├── build.bat                 # Easy build script
├── BUILD.md                  # Detailed build guide
└── README.md                 # Full documentation
```

---

## 📋 Langkah Selanjutnya (Di Laptop Windows Anda)

### Step 1: Enable SSH Dulu! ⚠️

Sebelum lanjut, **enable SSH** di Windows Anda dulu:

```powershell
# Jalankan di PowerShell (Run as Administrator)
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

Tunggu sampai **State: Installed**

---

### Step 2: Copy Source Code ke Laptop

Setelah SSH aktif, saya bisa push code ini ke GitHub, atau Anda bisa:

**Option A: Download dari GitHub (Recommended)**
1. Saya akan push code ke GitHub
2. Anda clone/download di laptop
3. Build pakai `build.bat`

**Option B: Manual Copy**
1. Copy folder `qwen-desktop-app` via network share
2. Atau zip dan transfer manual

---

### Step 3: Build di Laptop Windows

Setelah code ada di laptop:

```powershell
# Cara Mudah - Pakai build.bat
cd C:\path\to\qwen-desktop-app
.\build.bat

# Pilih option 1 (Build Installer)
# Tunggu ~5-10 menit
```

**ATAU manual:**

```powershell
# Install dependencies
npm install

# Build
npm run build
```

---

### Step 4: Install & Pakai!

1. Buka folder `build\dist\`
2. Double-click `Qwen Code Desktop Setup x64.exe`
3. Install seperti biasa
4. Buka aplikasi dari Start Menu
5. **Add Sandbox Folder** - pilih folder kerja Anda
6. **Done!** Mulai pakai! 🎉

---

## 🎯 Fitur Lengkap

| Fitur | Status |
|-------|--------|
| Sandbox Security | ✅ |
| File Browser | ✅ |
| Edit Files | ✅ |
| Terminal (Qwen CLI) | ✅ |
| Dark Theme UI | ✅ |
| System Folder Block | ✅ |
| Portable Build | ✅ |

---

## 🆘 Kalau Ada Masalah

### SSH Tidak Bisa Enable
- Pastikan Windows 10/11 Pro (Home perlu cara lain)
- Atau pakai remote desktop manual

### Build Error
- Pastikan Node.js 18+ terinstall
- Jalankan `npm install` ulang

### Qwen CLI Tidak Terinstall
```powershell
npm install -g @qwen-code/qwen-code
```

---

## 📞 Next Steps

1. **Enable SSH** di Windows dulu ✅
2. Kasih tahu saya kalau sudah selesai
3. Saya push ke GitHub (atau cara transfer lain)
4. Anda build & install
5. **TESTING** - pastikan semua fitur jalan
6. Pakai untuk kerja! 🚀

---

**Semoga bermanfaat!** 😊
