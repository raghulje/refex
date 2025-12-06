/**
 * Offline List View Support
 * Enhances list views to show offline data
 */

// Override Trip list view
if (typeof frappe.listview_settings !== 'undefined') {
  frappe.listview_settings['Trip'] = {
    refresh: function(listview) {
      // Add offline filter button
      if (!listview.page.find('.offline-filter-btn').length) {
        const offlineBtn = $(`
          <button class="btn btn-sm btn-secondary offline-filter-btn" style="margin-left: 10px;">
            <i class="fa fa-database"></i> Show Offline
          </button>
        `);

        offlineBtn.on('click', async () => {
          await showOfflineTripsList(listview);
        });

        listview.page.add_inner_button(offlineBtn.html(), () => {
          offlineBtn.trigger('click');
        });
      }

      // If offline, show offline data
      if (!navigator.onLine) {
        showOfflineTripsList(listview);
      }
    },

    onload: function(listview) {
      // Listen for online/offline events
      window.addEventListener('online', () => {
        // Reload when online
        listview.refresh();
      });

      window.addEventListener('offline', () => {
        // Show offline data
        showOfflineTripsList(listview);
      });
    }
  };
}

async function showOfflineTripsList(listview) {
  try {
    // Get all offline trips
    const offlineTrips = await window.OfflineDB.getAllTrips();
    
    if (offlineTrips.length === 0) {
      frappe.show_alert({
        message: 'No offline trips found',
        indicator: 'blue'
      }, 3);
      return;
    }

    // Clear current list
    listview.data = offlineTrips.map(trip => ({
      name: trip.name,
      project_code: trip.project_code,
      trip_status: trip.trip_status,
      token_challan_no: trip.token_challan_no,
      user: trip.user,
      trip_posting_date: trip.trip_posting_date,
      _offline: true,
      _sync_status: trip.sync_status
    }));

    // Render list
    listview.render();
    
    // Add offline indicator to rows
    listview.wrapper.find('.list-row').each(function() {
      const row = $(this);
      const data = row.data('name');
      const trip = offlineTrips.find(t => t.name === data);
      
      if (trip && trip.sync_status === 'pending') {
        row.addClass('offline-row');
        row.css('border-left', '3px solid #ff9800');
        
        if (!row.find('.offline-badge').length) {
          row.find('.list-subject').append(`
            <span class="offline-badge" style="
              background: #ff9800;
              color: white;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              margin-left: 5px;
            ">OFFLINE</span>
          `);
        }
      }
    });

    frappe.show_alert({
      message: `Showing ${offlineTrips.length} offline trips`,
      indicator: 'blue'
    }, 3);
  } catch (error) {
    console.error('[Offline ListView] Error:', error);
    frappe.show_alert({
      message: 'Error loading offline trips',
      indicator: 'red'
    }, 3);
  }
}

// Override list view refresh to check offline
const originalRefresh = frappe.views.ListView.prototype.refresh;
frappe.views.ListView.prototype.refresh = function() {
  if (!navigator.onLine && this.doctype === 'Trip') {
    // Show offline data
    showOfflineTripsList(this);
  } else {
    // Normal refresh
    originalRefresh.call(this);
  }
};

