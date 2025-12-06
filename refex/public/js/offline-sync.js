/**
 * Offline Sync Manager
 * Handles synchronization of offline data with server
 */

class OfflineSyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncInterval = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Network status listeners
    window.addEventListener('online', () => {
      console.log('[SyncManager] Connection restored');
      this.isOnline = true;
      this.showNotification('Connection restored. Syncing data...', 'success');
      this.startSync();
    });

    window.addEventListener('offline', () => {
      console.log('[SyncManager] Connection lost');
      this.isOnline = false;
      this.showNotification('Working offline. Changes will sync when connection is restored.', 'warning');
    });

    // Periodic sync check (every 30 seconds when online)
    if (this.isOnline) {
      this.startPeriodicSync();
    }
  }

  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.startSync();
      }
    }, 30000); // 30 seconds
  }

  async startSync() {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    console.log('[SyncManager] Starting sync...');

    try {
      const queue = await window.OfflineDB.getSyncQueue('pending');
      
      if (queue.length === 0) {
        console.log('[SyncManager] No pending items to sync');
        this.syncInProgress = false;
        return;
      }

      console.log(`[SyncManager] Found ${queue.length} items to sync`);

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await window.OfflineDB.updateSyncQueueItem(item.id, {
            status: 'synced',
            synced_at: new Date().toISOString()
          });
        } catch (error) {
          console.error('[SyncManager] Sync error for item:', item, error);
          item.retry_count = (item.retry_count || 0) + 1;
          
          if (item.retry_count < 5) {
            await window.OfflineDB.updateSyncQueueItem(item.id, {
              status: 'pending',
              retry_count: item.retry_count,
              last_error: error.message
            });
          } else {
            await window.OfflineDB.updateSyncQueueItem(item.id, {
              status: 'failed',
              last_error: error.message
            });
          }
        }
      }

      this.showNotification('Sync completed successfully', 'success');
    } catch (error) {
      console.error('[SyncManager] Sync process error:', error);
      this.showNotification('Sync failed. Will retry automatically.', 'error');
    } finally {
      this.syncInProgress = false;
    }
  }

  async syncItem(item) {
    const { doctype, docname, data, action } = item;

    if (action === 'delete') {
      return await this.deleteDocument(doctype, docname);
    }

    if (action === 'save') {
      // Check if document exists (update) or is new (insert)
      const isNew = docname.startsWith('TEMP-');
      
      if (isNew) {
        return await this.insertDocument(doctype, data);
      } else {
        return await this.updateDocument(doctype, docname, data);
      }
    }
  }

  async insertDocument(doctype, data) {
    // Remove offline markers
    const cleanData = this.cleanOfflineData(data);
    
    return new Promise((resolve, reject) => {
      frappe.call({
        method: 'frappe.client.insert',
        args: {
          doc: cleanData
        },
        callback: (response) => {
          if (response.message) {
            // Update local DB with server name
            if (data.name && data.name.startsWith('TEMP-')) {
              window.OfflineDB.saveTrip({
                ...data,
                name: response.message.name,
                sync_status: 'synced'
              });
            }
            resolve(response.message);
          } else {
            reject(new Error('Insert failed'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  async updateDocument(doctype, docname, data) {
    const cleanData = this.cleanOfflineData(data);
    
    return new Promise((resolve, reject) => {
      frappe.call({
        method: 'frappe.client.set_value',
        args: {
          doctype: doctype,
          name: docname,
          fieldname: cleanData
        },
        callback: (response) => {
          if (response.message) {
            resolve(response.message);
          } else {
            reject(new Error('Update failed'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  async deleteDocument(doctype, docname) {
    return new Promise((resolve, reject) => {
      frappe.call({
        method: 'frappe.client.delete',
        args: {
          doctype: doctype,
          name: docname
        },
        callback: (response) => {
          resolve(response);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  cleanOfflineData(data) {
    const cleaned = { ...data };
    delete cleaned._offline;
    delete cleaned.sync_status;
    delete cleaned._cached;
    delete cleaned._cached_at;
    return cleaned;
  }

  async syncReferenceData(doctype) {
    if (!this.isOnline) {
      console.log('[SyncManager] Cannot sync reference data - offline');
      return;
    }

    try {
      const response = await frappe.call({
        method: 'frappe.client.get_list',
        args: {
          doctype: doctype,
          fields: ['*'],
          limit_page_length: 1000
        }
      });

      if (response.message) {
        await window.OfflineDB.saveReferenceData(doctype, response.message);
        console.log(`[SyncManager] Synced ${response.message.length} ${doctype} records`);
      }
    } catch (error) {
      console.error(`[SyncManager] Error syncing ${doctype}:`, error);
    }
  }

  async preloadReferenceData() {
    const doctypes = [
      'Project',
      'Sales Order',
      'Sales Order Amendment',
      'Purchase Order',
      'Purchase Order Amendment',
      'Item',
      'Supplier',
      'Vehicle',
      'Vehicle Type',
      'Lead Survey',
      'Employee',
      'UOM'
    ];

    console.log('[SyncManager] Preloading reference data...');
    
    for (const doctype of doctypes) {
      await this.syncReferenceData(doctype);
    }

    console.log('[SyncManager] Reference data preload complete');
  }

  showNotification(message, type = 'info') {
    if (typeof frappe !== 'undefined' && frappe.show_alert) {
      frappe.show_alert({
        message: message,
        indicator: type === 'success' ? 'green' : type === 'error' ? 'red' : 'orange'
      }, 5);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress
    };
  }
}

// Export singleton instance
window.OfflineSyncManager = new OfflineSyncManager();

