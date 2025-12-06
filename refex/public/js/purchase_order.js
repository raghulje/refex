frappe.ui.form.on("Purchase Order", {
    refresh: function(frm) {
        frm.set_query("custom_loading_vendor_po_no", function() {
            return {
                filters: {
                    custom_purchase_order_type: "Diesel Procurement"
                }
            }
       });
        if (frm.doc.docstatus === 1) {
          frm.add_custom_button(__('Amend'), function() {
                frappe.new_doc('Purchase Order Amendment', {
                     source: 'Purchase Order',
                     original_purchase_order: frm.doc.name 
                     
                });
            });
        } 
        else if(frm.doc.docstatus == 2){
            setTimeout(function(){
                $("[data-label='Amend']").hide()
            },250)
        }
    },
    custom_work_order_effective_from: function(frm) {
        calculate_period(frm);
    },
    service_order_completion_date: function(frm) {
        calculate_period(frm);
    }
})



function calculate_period(frm) {
    if (frm.doc.custom_work_order_effective_from && frm.doc.service_order_completion_date) {
        let from = frappe.datetime.str_to_obj(frm.doc.custom_work_order_effective_from);
        let to = frappe.datetime.str_to_obj(frm.doc.service_order_completion_date);

        if (from > to) {
            frappe.msgprint(__("From Date cannot be after To Date"));
            frm.set_value("custom_period_in_months_in_months", "");
            frm.set_value("billing_cycle", "");
            return;
        }

        let months = (to.getFullYear() - from.getFullYear()) * 12;
        months -= from.getMonth();
        months += to.getMonth();
        if (to.getDate() >= from.getDate()) {
            months += 1; 
        }

        frm.set_value("custom_period_in_months", months + " Months");
        let diff_time = to.getTime() - from.getTime();
        let diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24)) + 1; 

        frm.set_value("billing_cycle", diff_days + " Days");
    }
}

frappe.ui.form.on("Purchase Order Item", {
    custom_chainage_range_from: function(frm, cdt, cdn) {
        calculate_lead_km(cdt, cdn);
    },
    custom_chainage_range_to: function(frm, cdt, cdn) {
        calculate_lead_km(cdt, cdn);
    }
});

function calculate_lead_km(cdt, cdn) {
    let row = locals[cdt][cdn];
    if (row.custom_chainage_range_from != null && row.custom_chainage_range_to != null) {
        let lead = flt(row.custom_chainage_range_to) - flt(row.custom_chainage_range_from);
        frappe.model.set_value(cdt, cdn, "lead_km", lead >= 0 ? lead : 0);
    }
}