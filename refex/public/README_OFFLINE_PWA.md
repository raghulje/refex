# Offline PWA for Trip Doctype - Implementation Guide

## Overview
This implementation provides a complete offline-first Progressive Web App (PWA) solution for the Trip doctype in ERPNext. It enables users to work completely offline in rural areas with poor internet connectivity and automatically syncs data when connection is restored.

## Features
- ✅ **Complete Offline Support**: Work without internet connection
- ✅ **Auto-save**: Automatically saves data locally when connection is lost
- ✅ **Background Sync**: Automatically syncs when connection is restored
- ✅ **Offline List Views**: View and filter trips offline
- ✅ **Reference Data Caching**: All linked records (Projects, Items, Suppliers, etc.) cached for offline access
- ✅ **Conflict Resolution**: Handles sync conflicts gracefully
- ✅ **Installable PWA**: Can be installed as a native app on mobile devices

## Files Created

### 1. Core PWA Files
- `public/manifest.json` - PWA manifest for app installation
- `public/sw.js` - Service Worker for offline caching and background sync
- `public/js/pwa-init.js` - PWA initialization script

### 2. Offline Storage
- `public/js/offline-db.js` - IndexedDB wrapper for local data storage
- `public/js/offline-sync.js` - Sync manager for server synchronization

### 3. Trip Integration
- `public/js/trip-offline.js` - Trip form offline handler

### 4. Backend API
- `refex/api.py` - API endpoints for offline sync

## Installation Steps

### 1. Build Assets
```bash
cd /path/to/bench
bench build --app refex
```

### 2. Clear Browser Cache
Users need to clear browser cache or do a hard refresh (Ctrl+Shift+R)

### 3. Register Service Worker
The service worker will be automatically registered when the app loads.

### 4. Install PWA (Optional)
- On mobile: Browser will prompt to "Add to Home Screen"
- On desktop: Look for install button in browser address bar

## Usage

### For End Users

1. **First Time Setup (Online Required)**
   - Open ERPNext in browser
   - Navigate to Trip list
   - System will automatically cache reference data (Projects, Items, Suppliers, etc.)
   - Wait for "Reference data synced" message

2. **Working Offline**
   - Create new trips or edit existing ones
   - All data is saved locally
   - Orange "Working Offline" indicator appears in top-right
   - All linked records (dropdowns) work from cached data

3. **When Connection Restored**
   - Green "Online" indicator appears
   - Data automatically syncs in background
   - "Sync completed" notification appears

### For Developers

#### Testing Offline Mode
1. Open browser DevTools (F12)
2. Go to Application tab > Service Workers
3. Check "Offline" checkbox
4. Try creating/editing a Trip
5. Uncheck "Offline" to test sync

#### Viewing Offline Data
- Open DevTools > Application > IndexedDB > RefexTripDB
- View stored trips, sync queue, and reference data

#### Manual Sync
```javascript
// In browser console
window.OfflineSyncManager.startSync();
```

## Technical Architecture

### Data Flow

1. **Online Mode**
   - User creates/edits Trip → Saves to server → Also cached locally

2. **Offline Mode**
   - User creates/edits Trip → Saved to IndexedDB → Added to sync queue
   - When online: Sync manager processes queue → Updates server

3. **Connection Loss During Save**
   - Form detects connection loss → Saves to IndexedDB → Shows offline indicator
   - Auto-saves every 5 seconds when offline

### Storage Structure

```
RefexTripDB (IndexedDB)
├── trips (Trip documents)
├── syncQueue (Pending sync operations)
├── projects (Cached projects)
├── items (Cached items)
├── suppliers (Cached suppliers)
├── trip_loading_details (Child table data)
├── trip_transportation_details (Child table data)
└── trip_unloading_details (Child table data)
```

## Configuration

### Sync Interval
Default: 30 seconds when online
To change: Edit `offline-sync.js` line 25

### Auto-save Delay
Default: 5 seconds after last change
To change: Edit `trip-offline.js` line 200

### Cache Size
Service Worker caches all API responses. To limit:
- Edit `sw.js` to add cache size limits
- Implement cache eviction strategy

## Troubleshooting

### Service Worker Not Registering
1. Check browser console for errors
2. Ensure HTTPS (or localhost for development)
3. Clear browser cache and reload

### Data Not Syncing
1. Check network tab for API errors
2. View sync queue: `window.OfflineDB.getSyncQueue('pending')`
3. Check server logs for sync errors

### Reference Data Missing
1. Ensure online connection
2. Manually trigger: `window.OfflineSyncManager.preloadReferenceData()`
3. Check IndexedDB for cached data

### Form Not Saving Offline
1. Check browser console for errors
2. Verify IndexedDB is accessible
3. Check if service worker is active

## API Endpoints

### `refex.refex.api.sync_offline_trip(trip_data)`
Syncs a single trip document

### `refex.refex.api.get_offline_reference_data(doctype, filters)`
Gets reference data for caching

### `refex.refex.api.bulk_sync_offline_data(sync_data)`
Bulk syncs multiple records

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (iOS 11.3+)
- ⚠️ Older browsers may have limited support

## Security Considerations

1. **Data Encryption**: Consider encrypting sensitive data in IndexedDB
2. **Authentication**: Ensure user is authenticated before caching data
3. **Data Expiry**: Implement cache expiry for reference data
4. **Sync Validation**: Validate data before syncing to server

## Performance Optimization

1. **Lazy Loading**: Load reference data on-demand
2. **Pagination**: Implement pagination for large datasets
3. **Compression**: Compress data before storing in IndexedDB
4. **Background Sync**: Use Background Sync API for better performance

## Future Enhancements

- [ ] File attachment offline support
- [ ] Conflict resolution UI
- [ ] Offline reports
- [ ] Multi-device sync
- [ ] Data encryption
- [ ] Offline analytics

## Support

For issues or questions:
1. Check browser console for errors
2. Review server logs
3. Check IndexedDB for data integrity
4. Test with different network conditions

## License
MIT License - Same as Refex app

