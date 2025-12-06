# Quick Setup Guide - Offline PWA for Trip Doctype

## 🚀 Quick Start (5 Minutes)

### Step 1: Build Assets
```bash
cd /path/to/your/bench
bench build --app refex
```

### Step 2: Restart Bench
```bash
bench restart
```

### Step 3: Clear Browser Cache
- Open ERPNext in browser
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) for hard refresh
- Or clear browser cache manually

### Step 4: Test Offline Mode
1. Open browser DevTools (F12)
2. Go to **Application** tab → **Service Workers**
3. Check **"Offline"** checkbox
4. Navigate to Trip list and create a new Trip
5. Fill in the form - it should save locally
6. Uncheck "Offline" - data should sync automatically

## ✅ Verification Checklist

- [ ] Service Worker registered (check DevTools → Application → Service Workers)
- [ ] Manifest.json loaded (check DevTools → Application → Manifest)
- [ ] IndexedDB created (check DevTools → Application → IndexedDB → RefexTripDB)
- [ ] Offline indicator appears when network is disconnected
- [ ] Trip form saves when offline
- [ ] Data syncs when connection restored

## 📱 For Mobile Users

### Android (Chrome)
1. Open ERPNext in Chrome
2. Menu (3 dots) → "Add to Home screen"
3. App will work offline

### iOS (Safari)
1. Open ERPNext in Safari
2. Share button → "Add to Home Screen"
3. App will work offline

## 🔧 Troubleshooting

### Service Worker Not Working?
```bash
# Check if files are accessible
curl http://your-domain/assets/refex/public/sw.js
curl http://your-domain/assets/refex/public/manifest.json
```

### Files Not Loading?
1. Check `hooks.py` has:
   ```python
   app_include_js = "/assets/refex/js/pwa-init.js"
   doctype_js = {"Trip" : "public/js/trip-offline.js"}
   ```

2. Rebuild assets:
   ```bash
   bench build --app refex
   bench restart
   ```

### Data Not Syncing?
1. Check browser console for errors
2. Verify API endpoints are whitelisted
3. Check server logs: `bench --site [site-name] logs`

## 🎯 Key Features

✅ **Works Completely Offline**
- Create, edit, delete trips without internet
- All dropdowns work from cached data
- Auto-saves every 5 seconds

✅ **Automatic Sync**
- Syncs when connection restored
- Background sync every 30 seconds
- Handles connection loss gracefully

✅ **Installable PWA**
- Can be installed as app
- Works like native app
- Offline by default

## 📊 Monitoring

### Check Sync Status
Open browser console and run:
```javascript
// Check sync queue
window.OfflineDB.getSyncQueue('pending').then(console.log);

// Check offline trips
window.OfflineDB.getAllTrips({sync_status: 'pending'}).then(console.log);

// Manual sync
window.OfflineSyncManager.startSync();
```

### View Stored Data
1. Open DevTools → Application → IndexedDB
2. Expand `RefexTripDB`
3. View `trips`, `syncQueue`, and reference data stores

## 🚨 Important Notes

1. **First Time**: Users need internet to cache reference data
2. **HTTPS Required**: Service Workers only work on HTTPS (or localhost)
3. **Browser Support**: Chrome/Edge recommended, Safari iOS 11.3+
4. **Data Limits**: IndexedDB has size limits (usually 50% of disk space)

## 📞 Support

If you face issues:
1. Check browser console for errors
2. Verify all files are in correct locations
3. Ensure `bench build` completed successfully
4. Check server logs for API errors

## 🎉 You're Done!

Your Trip doctype now works completely offline. Users in rural areas can:
- Create trips without internet
- Edit existing trips
- View all linked records
- Sync automatically when online

Happy coding! 🚀

