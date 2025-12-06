/**
 * Offline File Upload Handler
 * Handles file uploads when offline and syncs when online
 */

class OfflineFileManager {
  constructor() {
    this.setupFileUploadInterception();
    this.setupServiceWorkerListener();
  }

  setupFileUploadInterception() {
    // Intercept Frappe file uploads
    if (typeof frappe !== 'undefined') {
      const originalUpload = frappe.upload?.make_request || frappe.upload_file;
      
      if (originalUpload) {
        // Override upload function
        frappe.upload_file = async (file, options) => {
          if (!navigator.onLine) {
            return await this.handleOfflineUpload(file, options);
          }
          
          // Try online upload first
          try {
            return await originalUpload(file, options);
          } catch (error) {
            // If fails, save offline
            console.log('[OfflineFiles] Upload failed, saving offline:', error);
            return await this.handleOfflineUpload(file, options);
          }
        };
      }
    }

    // Intercept form file attachments
    document.addEventListener('change', (event) => {
      if (event.target.type === 'file' && !navigator.onLine) {
        this.handleFileInput(event.target);
      }
    }, true);
  }

  async handleOfflineUpload(file, options = {}) {
    try {
      // Convert file to blob
      const fileBlob = await file.arrayBuffer();
      
      // Prepare file data
      const fileData = {
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        doctype: options.doctype || '',
        docname: options.docname || '',
        folder: options.folder || 'Home',
        is_private: options.is_private || 0,
        _offline: true
      };

      // Save to IndexedDB
      const fileId = await window.OfflineDB.saveOfflineFile(fileData, fileBlob);
      
      // Add to sync queue
      await window.OfflineDB.addToSyncQueue('File', `file-${fileId}`, {
        ...fileData,
        file_id: fileId
      }, 'upload');

      // Return offline file URL
      const offlineUrl = `offline://${fileId}-${file.name}`;
      
      frappe.show_alert({
        message: `File "${file.name}" saved offline. Will upload when connection is restored.`,
        indicator: 'orange'
      }, 5);

      return {
        message: {
          file_url: offlineUrl,
          file_name: file.name,
          _offline: true
        }
      };
    } catch (error) {
      console.error('[OfflineFiles] Error saving file offline:', error);
      frappe.throw(`Failed to save file offline: ${error.message}`);
    }
  }

  async handleFileInput(input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    for (const file of files) {
      // Get form context if available
      const form = input.closest('.form-container') || input.closest('form');
      const doctype = form?.dataset?.doctype || '';
      const docname = form?.dataset?.docname || '';

      await this.handleOfflineUpload(file, {
        doctype: doctype,
        docname: docname
      });
    }
  }

  setupServiceWorkerListener() {
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data && event.data.type === 'STORE_OFFLINE_FILE') {
          const { file, formData } = event.data;
          
          // Reconstruct file from form data
          const fileBlob = await this.reconstructFile(file, formData);
          
          await window.OfflineDB.saveOfflineFile({
            filename: file.name,
            file_type: file.type,
            file_size: file.size,
            doctype: formData.doctype || '',
            docname: formData.docname || '',
            folder: formData.folder || 'Home',
            is_private: formData.is_private || 0
          }, fileBlob);
        }
      });
    }
  }

  async reconstructFile(fileInfo, formData) {
    // This would need to be handled differently based on how service worker receives the file
    // For now, we'll handle it in the main upload flow
    return null;
  }

  async syncOfflineFiles() {
    if (!navigator.onLine) {
      console.log('[OfflineFiles] Cannot sync files - offline');
      return;
    }

    try {
      const pendingFiles = await window.OfflineDB.getOfflineFiles('pending');
      
      if (pendingFiles.length === 0) {
        return;
      }

      console.log(`[OfflineFiles] Syncing ${pendingFiles.length} files...`);

      for (const fileRecord of pendingFiles) {
        try {
          await this.uploadFile(fileRecord);
          await window.OfflineDB.updateFileUploadStatus(fileRecord.id, {
            status: 'synced',
            synced_at: new Date().toISOString()
          });
        } catch (error) {
          console.error('[OfflineFiles] File sync error:', error);
          fileRecord.retry_count = (fileRecord.retry_count || 0) + 1;
          
          if (fileRecord.retry_count < 5) {
            await window.OfflineDB.updateFileUploadStatus(fileRecord.id, {
              status: 'pending',
              retry_count: fileRecord.retry_count
            });
          } else {
            await window.OfflineDB.updateFileUploadStatus(fileRecord.id, {
              status: 'failed',
              last_error: error.message
            });
          }
        }
      }

      frappe.show_alert({
        message: `Synced ${pendingFiles.length} files`,
        indicator: 'green'
      }, 3);
    } catch (error) {
      console.error('[OfflineFiles] Sync process error:', error);
    }
  }

  async uploadFile(fileRecord) {
    // Create FormData
    const formData = new FormData();
    const blob = new Blob([fileRecord.blob], { type: fileRecord.file_type });
    formData.append('file', blob, fileRecord.filename);
    formData.append('doctype', fileRecord.doctype);
    formData.append('docname', fileRecord.docname);
    formData.append('folder', fileRecord.folder);
    formData.append('is_private', fileRecord.is_private);

    // Upload to server
    return new Promise((resolve, reject) => {
      frappe.call({
        method: 'frappe.upload_file',
        args: {
          file: fileRecord.filename,
          doctype: fileRecord.doctype,
          docname: fileRecord.docname,
          folder: fileRecord.folder,
          is_private: fileRecord.is_private
        },
        callback: (response) => {
          if (response.message) {
            resolve(response.message);
          } else {
            reject(new Error('Upload failed'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
}

// Initialize file manager
window.OfflineFileManager = new OfflineFileManager();

// Integrate with sync manager
if (window.OfflineSyncManager) {
  const originalSync = window.OfflineSyncManager.startSync;
  window.OfflineSyncManager.startSync = async function() {
    await originalSync.call(this);
    await window.OfflineFileManager.syncOfflineFiles();
  };
}

