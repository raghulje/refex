frappe.ui.form.on("Sales Order", {
    refresh: function(frm) {
        if (frm.doc.docstatus === 1) {
          frm.add_custom_button(__('Amend'), function() {
                frappe.new_doc('Sales Order Amendment', {
                     source: 'Sales Order',
                     original_so: frm.doc.name
                });
            });
        }
        else if(frm.doc.docstatus == 2){
            setTimeout(function(){
                $("[data-label='Amend']").hide()
            },250)
        }
    }
})

