/**
 * Trip Offline Handler
 * Extends Trip form to work offline
 */

frappe.ui.form.on('Trip', {
  refresh: function(frm) {
    // Initialize offline DB if not already done
    if (!window.offlineDBInitialized) {
      initializeOfflineSupport();
    }

    // Add offline indicator
    addOfflineIndicator(frm);

    // Override save to work offline
    overrideSaveButton(frm);

    // Auto-save on field changes (debounced)
    setupAutoSave(frm);

    // Load from offline if needed
    loadFromOfflineIfNeeded(frm);

    // Handle file attachments offline
    setupOfflineFileAttachments(frm);
  },

  before_save: function(frm) {
    // Mark as offline if not connected
    if (!navigator.onLine) {
      frm.doc._offline = true;
      frm.doc._offline_save = true;
    }
  },

  after_save: function(frm) {
    // Save to offline DB
    if (frm.doc._offline_save || !navigator.onLine) {
      saveToOfflineDB(frm);
    }
  }
});

async function initializeOfflineSupport() {
  try {
    await window.OfflineDB.init();
    window.offlineDBInitialized = true;
    console.log('[Trip Offline] Offline DB initialized');

    // Start sync manager
    if (navigator.onLine) {
      window.OfflineSyncManager.startPeriodicSync();
    }
  } catch (error) {
    console.error('[Trip Offline] Failed to initialize:', error);
  }
}

function addOfflineIndicator(frm) {
  // Remove existing indicator
  const existing = frm.dashboard.wrapper.find('.offline-indicator');
  if (existing.length) existing.remove();

  const isOffline = !navigator.onLine;
  const indicator = $(`
    <div class="offline-indicator" style="
      position: fixed;
      top: 60px;
      right: 20px;
      padding: 10px 15px;
      background: ${isOffline ? '#ff9800' : '#4caf50'};
      color: white;
      border-radius: 4px;
      z-index: 1000;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      <i class="fa fa-${isOffline ? 'wifi' : 'wifi'}"></i>
      ${isOffline ? 'Working Offline' : 'Online'}
    </div>
  `);

  $('body').append(indicator);

  // Update on network change
  window.addEventListener('online', () => {
    indicator.css('background', '#4caf50').html('<i class="fa fa-wifi"></i> Online');
  });

  window.addEventListener('offline', () => {
    indicator.css('background', '#ff9800').html('<i class="fa fa-wifi"></i> Working Offline');
  });
}

function overrideSaveButton(frm) {
  // Store original save function
  if (!frm._original_save) {
    frm._original_save = frm.save;
  }

  // Override save button
  frm.page.set_primary_action(__('Save'), async function() {
    if (!navigator.onLine) {
      // Offline save
      await saveOffline(frm);
    } else {
      // Online save - try server first
      try {
        await frm._original_save();
      } catch (error) {
        // If save fails, save offline
        console.log('[Trip Offline] Online save failed, saving offline:', error);
        await saveOffline(frm);
      }
    }
  });
}

async function saveOffline(frm) {
  try {
    // Validate form
    if (!frm.validate()) {
      return;
    }

    // Show saving indicator
    frappe.show_alert({
      message: 'Saving offline...',
      indicator: 'orange'
    }, 2);

    // Prepare trip data
    const tripData = {
      doctype: 'Trip',
      ...frm.doc
    };

    // Handle child tables
    const childTables = ['loading', 'transportation', 'unloading'];
    for (const tableName of childTables) {
      if (frm.doc[tableName] && frm.doc[tableName].length > 0) {
        await window.OfflineDB.saveChildTableRows(
          frm.doc.name || `TEMP-${Date.now()}`,
          `Trip ${tableName.charAt(0).toUpperCase() + tableName.slice(1)} Details`,
          frm.doc[tableName]
        );
      }
    }

    // Save trip
    const savedName = await window.OfflineDB.saveTrip(tripData);

    // Update form with saved name
    if (savedName && savedName !== frm.doc.name) {
      frm.set_value('name', savedName);
    }

    frappe.show_alert({
      message: 'Saved offline. Will sync when connection is restored.',
      indicator: 'green'
    }, 5);

    // Mark as saved
    frm.is_dirty = false;
    frm.save_local();

  } catch (error) {
    console.error('[Trip Offline] Save error:', error);
    frappe.show_alert({
      message: 'Failed to save offline. Please try again.',
      indicator: 'red'
    }, 5);
  }
}

async function saveToOfflineDB(frm) {
  try {
    const tripData = {
      doctype: 'Trip',
      ...frm.doc
    };

    await window.OfflineDB.saveTrip(tripData);

    // Save child tables
    const childTables = ['loading', 'transportation', 'unloading'];
    for (const tableName of childTables) {
      if (frm.doc[tableName] && frm.doc[tableName].length > 0) {
        await window.OfflineDB.saveChildTableRows(
          frm.doc.name,
          `Trip ${tableName.charAt(0).toUpperCase() + tableName.slice(1)} Details`,
          frm.doc[tableName]
        );
      }
    }
  } catch (error) {
    console.error('[Trip Offline] Error saving to offline DB:', error);
  }
}

function setupAutoSave(frm) {
  let autoSaveTimeout;
  const autoSaveDelay = 5000; // 5 seconds

  // Auto-save on field changes
  frm.fields_dict.project_code.$input.on('change', () => {
    scheduleAutoSave();
  });

  frm.fields_dict.sale_order.$input.on('change', () => {
    scheduleAutoSave();
  });

  // Auto-save on child table changes
  ['loading', 'transportation', 'unloading'].forEach(tableName => {
    if (frm.fields_dict[tableName]) {
      frm.fields_dict[tableName].grid.wrapper.on('change', () => {
        scheduleAutoSave();
      });
    }
  });

  function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      if (frm.is_dirty && !navigator.onLine) {
        saveToOfflineDB(frm);
      }
    }, autoSaveDelay);
  }
}

async function loadFromOfflineIfNeeded(frm) {
  // If editing existing trip and offline, try to load from offline DB
  if (frm.doc.name && !frm.doc.__islocal && !navigator.onLine) {
    try {
      const offlineTrip = await window.OfflineDB.getTrip(frm.doc.name);
      if (offlineTrip && offlineTrip._offline) {
        // Load child tables
        const childTables = {
          'loading': 'Trip Loading Details',
          'transportation': 'Trip Transportation Details',
          'unloading': 'Trip Unloading Details'
        };

        for (const [fieldName, childTableName] of Object.entries(childTables)) {
          const rows = await window.OfflineDB.getChildTableRows(frm.doc.name, childTableName);
          if (rows.length > 0) {
            frm.clear_table(fieldName);
            rows.forEach(row => {
              const childRow = frm.add_child(fieldName);
              Object.assign(childRow, row);
            });
            frm.refresh_field(fieldName);
          }
        }

        frappe.show_alert({
          message: 'Loaded from offline cache',
          indicator: 'blue'
        }, 3);
      }
    } catch (error) {
      console.error('[Trip Offline] Error loading from offline:', error);
    }
  }
}

// Override list view to show offline trips
if (typeof frappe.listview_settings !== 'undefined') {
  frappe.listview_settings['Trip'] = {
    refresh: function(listview) {
      // Add offline filter button
      if (!listview.page.find('.offline-filter-btn').length) {
        const btn = $(`
          <button class="btn btn-sm btn-secondary offline-filter-btn" style="margin-left: 10px;">
            <i class="fa fa-database"></i> Show Offline
          </button>
        `);

        btn.on('click', async () => {
          await showOfflineTrips(listview);
        });

        listview.page.add_inner_button(btn.html(), () => {
          btn.trigger('click');
        });
      }
    }
  };
}

async function showOfflineTrips(listview) {
  try {
    const offlineTrips = await window.OfflineDB.getAllTrips({ sync_status: 'pending' });
    
    if (offlineTrips.length === 0) {
      frappe.show_alert({
        message: 'No offline trips found',
        indicator: 'blue'
      }, 3);
      return;
    }

    // Show in dialog
    const dialog = new frappe.ui.Dialog({
      title: 'Offline Trips',
      fields: [
        {
          fieldtype: 'HTML',
          options: `
            <div style="max-height: 400px; overflow-y: auto;">
              ${offlineTrips.map(trip => `
                <div style="padding: 10px; border-bottom: 1px solid #ddd;">
                  <strong>${trip.name}</strong> - ${trip.project_code || 'No Project'}<br>
                  <small>Status: ${trip.trip_status || 'Draft'}</small><br>
                  <small>Modified: ${new Date(trip.modified).toLocaleString()}</small>
                </div>
              `).join('')}
            </div>
          `
        }
      ]
    });

    dialog.show();
  } catch (error) {
    console.error('[Trip Offline] Error showing offline trips:', error);
  }
}

function setupOfflineFileAttachments(frm) {
  // Handle file attachments in Trip form
  if (frm.attachments && frm.attachments.wrapper) {
    frm.attachments.wrapper.on('change', 'input[type="file"]', async function(e) {
      if (!navigator.onLine) {
        const file = e.target.files[0];
        if (file && window.OfflineFileManager) {
          await window.OfflineFileManager.handleOfflineUpload(file, {
            doctype: 'Trip',
            docname: frm.doc.name
          });
        }
      }
    });
  }
}

