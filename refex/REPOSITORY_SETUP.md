# Repository Setup - Complete Codebase

## 🎯 Two Repositories Configured

### 1. **PWA-Only Repository** (Lightweight)
**URL**: https://github.com/raghulje/refex_pwa.git
- **Purpose**: PWA code only (19 files)
- **Branch**: `pwa-main` → `pwa/main`
- **Push Command**: `git pushpwa`
- **Use Case**: Share PWA code separately

### 2. **Complete Codebase Repository** (Full App) ⭐
**URL**: https://github.com/raghulje/refex.git
- **Purpose**: Complete Refex app with PWA (226 files)
- **Branch**: `refex-main` → `refex/main`
- **Push Command**: `git pushrefex`
- **Use Case**: Full application deployment

## 📊 What's in Complete Repository

### Total Files: **226 files**

#### Core App Structure
- ✅ All doctypes (Trip, Project, LOA Contract, etc.)
- ✅ All custom fields and fixtures
- ✅ All workflows and permissions
- ✅ All print formats
- ✅ All reports
- ✅ All notifications

#### PWA Implementation
- ✅ Service Worker (`sw.js`)
- ✅ PWA Manifest (`manifest.json`)
- ✅ All offline JS files (6 files)
- ✅ Offline database and sync
- ✅ File upload support
- ✅ Complete documentation

#### Configuration
- ✅ GitHub Actions workflows (CI + Linter)
- ✅ ERPNext hooks
- ✅ API endpoints
- ✅ All customizations

## 🚀 Push Commands

### Push to Complete Repository (Main)
```bash
git pushrefex
# or
git push refex HEAD:main
```

### Push to PWA-Only Repository
```bash
git pushpwa
# or
git push pwa HEAD:main
```

## 📋 Current Branch Status

- **refex-main**: Complete codebase (226 files) → https://github.com/raghulje/refex.git
- **pwa-main**: PWA code only (19 files) → https://github.com/raghulje/refex_pwa.git
- **develop**: Local development branch (has vendor code - don't push)

## 🔄 Workflow

### For Complete App Updates
```bash
# Switch to refex-main branch
git checkout refex-main

# Make changes
# ... edit files ...

# Stage and commit
git add .
git commit -m "your message"

# Push to complete repository
git pushrefex
```

### For PWA-Only Updates
```bash
# Switch to pwa-main branch
git checkout pwa-main

# Make changes
# ... edit files ...

# Stage and commit
git add .
git commit -m "your message"

# Push to PWA repository
git pushpwa
```

## ✅ Verification

### Check Remotes
```bash
git remote -v
```

**Should show:**
```
pwa    https://github.com/raghulje/refex_pwa.git (fetch)
pwa    https://github.com/raghulje/refex_pwa.git (push)
refex  https://github.com/raghulje/refex.git (fetch)
refex  https://github.com/raghulje/refex.git (push)
```

### Check Branches
```bash
git branch -a
```

### Check What's Pushed
- **Complete Repo**: Visit https://github.com/raghulje/refex
- **PWA Repo**: Visit https://github.com/raghulje/refex_pwa

## 🎯 Recommended Workflow

**For daily development:**
1. Work on `refex-main` branch (has everything)
2. Make your changes
3. Commit and push: `git pushrefex`
4. All code goes to: https://github.com/raghulje/refex.git

## 🔒 Security

- ✅ **Vendor Remote Removed** - No connection to vendor repository
- ✅ **Both Repositories Safe** - Only your repositories
- ✅ **Clean History** - Fresh commits in both repos

---

**Your complete codebase is now in: https://github.com/raghulje/refex.git** 🎉

