/**
 * IndexedDB Wrapper for Offline Storage
 * Handles all Trip-related data storage locally
 */

class OfflineDB {
  constructor() {
    this.dbName = 'RefexTripDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineDB] Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Trip store
        if (!db.objectStoreNames.contains('trips')) {
          const tripStore = db.createObjectStore('trips', { keyPath: 'name', autoIncrement: false });
          tripStore.createIndex('project_code', 'project_code', { unique: false });
          tripStore.createIndex('trip_status', 'trip_status', { unique: false });
          tripStore.createIndex('sync_status', 'sync_status', { unique: false });
          tripStore.createIndex('modified', 'modified', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('doctype', 'doctype', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Reference data stores (for offline access)
        const referenceStores = [
          'projects', 'sales_orders', 'sales_order_amendments',
          'purchase_orders', 'purchase_order_amendments',
          'items', 'suppliers', 'vehicles', 'vehicle_types',
          'lead_surveys', 'employees', 'uom', 'uom_conversion_matrix'
        ];

        // File uploads store
        if (!db.objectStoreNames.contains('file_uploads')) {
          const fileStore = db.createObjectStore('file_uploads', { keyPath: 'id', autoIncrement: true });
          fileStore.createIndex('doctype', 'doctype', { unique: false });
          fileStore.createIndex('docname', 'docname', { unique: false });
          fileStore.createIndex('status', 'status', { unique: false });
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        referenceStores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'name', autoIncrement: false });
            store.createIndex('modified', 'modified', { unique: false });
          }
        });

        // Child table stores
        const childStores = [
          'trip_loading_details',
          'trip_transportation_details',
          'trip_unloading_details'
        ];

        childStores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            store.createIndex('parent', 'parent', { unique: false });
            store.createIndex('sync_status', 'sync_status', { unique: false });
          }
        });

        console.log('[OfflineDB] Database structure created');
      };
    });
  }

  // Trip operations
  async saveTrip(tripData) {
    const transaction = this.db.transaction(['trips'], 'readwrite');
    const store = transaction.objectStore('trips');
    
    // Mark as pending sync if new
    if (!tripData.name || tripData.name.startsWith('TEMP-')) {
      tripData.sync_status = 'pending';
      tripData.name = tripData.name || `TEMP-${Date.now()}`;
    } else {
      tripData.sync_status = tripData.sync_status || 'synced';
    }
    
    tripData.modified = new Date().toISOString();
    tripData._offline = true;

    return new Promise((resolve, reject) => {
      const request = store.put(tripData);
      request.onsuccess = () => {
        console.log('[OfflineDB] Trip saved:', tripData.name);
        this.addToSyncQueue('Trip', tripData.name, tripData);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getTrip(tripName) {
    const transaction = this.db.transaction(['trips'], 'readonly');
    const store = transaction.objectStore('trips');
    
    return new Promise((resolve, reject) => {
      const request = store.get(tripName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTrips(filters = {}) {
    const transaction = this.db.transaction(['trips'], 'readonly');
    const store = transaction.objectStore('trips');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        let trips = request.result;
        
        // Apply filters
        if (filters.project_code) {
          trips = trips.filter(t => t.project_code === filters.project_code);
        }
        if (filters.trip_status) {
          trips = trips.filter(t => t.trip_status === filters.trip_status);
        }
        if (filters.sync_status) {
          trips = trips.filter(t => t.sync_status === filters.sync_status);
        }
        
        resolve(trips);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTrip(tripName) {
    const transaction = this.db.transaction(['trips'], 'readwrite');
    const store = transaction.objectStore('trips');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(tripName);
      request.onsuccess = () => {
        this.addToSyncQueue('Trip', tripName, null, 'delete');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Reference data operations
  async saveReferenceData(doctype, data) {
    const storeName = this.getStoreName(doctype);
    if (!storeName) return;

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Handle array or single object
    const dataArray = Array.isArray(data) ? data : [data];
    
    return Promise.all(
      dataArray.map(item => {
        return new Promise((resolve, reject) => {
          item._cached = true;
          item._cached_at = new Date().toISOString();
          const request = store.put(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  async getReferenceData(doctype, name) {
    const storeName = this.getStoreName(doctype);
    if (!storeName) return null;

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllReferenceData(doctype) {
    const storeName = this.getStoreName(doctype);
    if (!storeName) return [];

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Child table operations
  async saveChildTableRows(parent, childTableName, rows) {
    const storeName = this.getChildStoreName(childTableName);
    if (!storeName) return;

    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Delete existing rows for this parent
    const index = store.index('parent');
    const range = IDBKeyRange.only(parent);
    
    return new Promise((resolve, reject) => {
      index.openCursor(range).onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          // Now add new rows
          Promise.all(
            rows.map((row, idx) => {
              return new Promise((resolveRow, rejectRow) => {
                const rowData = {
                  id: `${parent}-${childTableName}-${idx}`,
                  parent: parent,
                  ...row,
                  sync_status: 'pending',
                  modified: new Date().toISOString()
                };
                const request = store.add(rowData);
                request.onsuccess = () => resolveRow();
                request.onerror = () => rejectRow(request.error);
              });
            })
          ).then(() => resolve()).catch(reject);
        }
      };
    });
  }

  async getChildTableRows(parent, childTableName) {
    const storeName = this.getChildStoreName(childTableName);
    if (!storeName) return [];

    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index('parent');
    const range = IDBKeyRange.only(parent);
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(range);
      request.onsuccess = () => {
        const rows = request.result.map(row => {
          const { id, parent, sync_status, modified, ...rowData } = row;
          return rowData;
        });
        resolve(rows);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sync queue operations
  async addToSyncQueue(doctype, docname, data, action = 'save') {
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    const queueItem = {
      doctype: doctype,
      docname: docname,
      data: data,
      action: action,
      status: 'pending',
      timestamp: new Date().toISOString(),
      retry_count: 0
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => {
        console.log('[OfflineDB] Added to sync queue:', queueItem);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(status = 'pending') {
    const transaction = this.db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const index = store.index('status');
    const range = IDBKeyRange.only(status);
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncQueueItem(id, updates) {
    const transaction = this.db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        Object.assign(item, updates);
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Helper methods
  getStoreName(doctype) {
    const mapping = {
      'Project': 'projects',
      'Sales Order': 'sales_orders',
      'Sales Order Amendment': 'sales_order_amendments',
      'Purchase Order': 'purchase_orders',
      'Purchase Order Amendment': 'purchase_order_amendments',
      'Item': 'items',
      'Supplier': 'suppliers',
      'Vehicle': 'vehicles',
      'Vehicle Type': 'vehicle_types',
      'Lead Survey': 'lead_surveys',
      'Employee': 'employees',
      'UOM': 'uom',
      'UOM Conversion Matrix': 'uom_conversion_matrix'
    };
    return mapping[doctype] || null;
  }

  getChildStoreName(childTableName) {
    const mapping = {
      'Trip Loading Details': 'trip_loading_details',
      'Trip Transportation Details': 'trip_transportation_details',
      'Trip Unloading Details': 'trip_unloading_details'
    };
    return mapping[childTableName] || null;
  }

  // File upload operations
  async saveOfflineFile(fileData, fileBlob) {
    const transaction = this.db.transaction(['file_uploads'], 'readwrite');
    const store = transaction.objectStore('file_uploads');
    
    const fileRecord = {
      ...fileData,
      blob: fileBlob,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(fileRecord);
      request.onsuccess = () => {
        console.log('[OfflineDB] File saved offline:', fileData.filename);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineFiles(status = 'pending') {
    const transaction = this.db.transaction(['file_uploads'], 'readonly');
    const store = transaction.objectStore('file_uploads');
    const index = store.index('status');
    const range = IDBKeyRange.only(status);
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateFileUploadStatus(id, updates) {
    const transaction = this.db.transaction(['file_uploads'], 'readwrite');
    const store = transaction.objectStore('file_uploads');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const file = getRequest.result;
        Object.assign(file, updates);
        const putRequest = store.put(file);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteOfflineFile(id) {
    const transaction = this.db.transaction(['file_uploads'], 'readwrite');
    const store = transaction.objectStore('file_uploads');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
window.OfflineDB = new OfflineDB();

