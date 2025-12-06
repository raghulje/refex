// Copyright (c) 2025, tharun and contributors
// For license information, please see license.txt

frappe.ui.form.on("Purchase Order Amendment", {
    refresh: function(frm) {
        set_amendment_filter(frm);
        limit_items_rows(frm);
        frm.toggle_display("revised_from_date", !!frm.doc.tenure)
        frm.toggle_display("revised_to_date", !!frm.doc.tenure)
        frm.toggle_display("revised_terms_and_conditions", !!frm.doc.terms_and_conditions);
        toggle_revised_column(frm);
        toggle_revised_column(frm);
        if (frm.doc.amended_from) {
            frm.set_df_property('grand_total', 'read_only', 1);
        }
        if(frm.doc.docstatus == 2){
            setTimeout(function(){
                $("[data-label='Amend']").hide()
            },250)
        }
    },
	original_purchase_order: function(frm) {
         set_amendment_filter(frm);
         if (!frm.doc.amended_purchase_order_amendment) {
            fetch_all_data(frm, "Purchase Order", frm.doc.original_purchase_order)
         }
	},
    amended_purchase_order_amendment: function(frm) {
        if (frm.doc.amended_purchase_order_amendment) {
            fetch_all_data(frm, "Purchase Order Amendment", frm.doc.amended_purchase_order_amendment);
        }
    },
    tenure: function(frm) {
        frm.toggle_display("revised_from_date", frm.doc.tenure);
        frm.toggle_display("revised_to_date", frm.doc.tenure);        
    },
    terms_and_conditions: function(frm) {
        frm.toggle_display("revised_terms_and_conditions", frm.doc.terms_and_conditions);
    },
    rate: function(frm) {
        toggle_revised_column(frm);
    },
    quantity: function(frm) {
        toggle_revised_column(frm);
    },
    items_add: function(frm) {
        limit_items_rows(frm);
    }, 
    items_remove: function(frm) {
        limit_items_rows(frm);
    },
});

function set_amendment_filter(frm) {
    frm.set_query("amended_purchase_order_amendment", function() {
        return {
            filters: {
                original_purchase_order: frm.doc.original_purchase_order || ""
            }
        };
    });
}
function toggle_revised_column(frm) {
    let rate_checked = frm.doc.rate === 1;
    let qty_checked = frm.doc.quantity === 1;
    frm.fields_dict["items"].grid.toggle_display("revised_rate", !!frm.doc.rate);
    frm.fields_dict["items"].grid.toggle_display("revised_quantity", !!frm.doc.quantity);
    frm.fields_dict["items"].grid.update_docfield_property("discount","read_only",(rate_checked || qty_checked) ? 0 : 1);
}
function limit_items_rows(frm) {
    if ((frm.doc.items || []).length >= 1) {
        frm.fields_dict["items"].grid.wrapper.find('.grid-add-row').hide();
        frm.fields_dict["items"].grid.wrapper.find('.grid-footer').hide();
    } else {
        frm.fields_dict["items"].grid.wrapper.find('.grid-add-row').show();
        frm.fields_dict["items"].grid.wrapper.find('.grid-footer').show();
    }
}
let preferred_dates = { from: null, to: null };

function fetch_all_data(frm, doctype, docname) {
    if (!docname) return;

    frappe.call({
        method: "frappe.client.get",
        args: { doctype: doctype, name: docname },
        callback: function(r) {
            if (!r.message) return;
            let source_doc = r.message;
            
            frm.clear_table("items");
            (source_doc.items || []).forEach(row => {
                let child = frm.add_child("items");
                if (doctype === "Purchase Order") {
                    console.log(row);
                    child.lead_km = row.lead_km;
                    child.item_group = row.item_group;
                    child.item_code = row.item_code;
                    child.item_name = row.item_name;
                    child.quantity= row.qty;
                    child.rate_per_unit = row.rate;
                    child.amount = row.net_amount;
                    child.discount = row.discount_percentage; 
                    child.discount_amount = row.discount_amount;
                    child.base_price_after_discount = row.net_amount;
                    child.total_base_value = row.total_base_value;
                    child.gst = row.igst_rate + row.cgst_rate + row.sgst_rate;
                    child.gst_amount = row.igst_amount + row.cgst_amount + row.sgst_amount;
                    child.vehicle_type = row.custom_vehicle_type;
                    child.vehicle = row.custom_vehicle;
                    child.vendor = row.custom_vendor;
                    child.billing_type = row.custom_biiling_type;
                    child.hourly_rate_per_month = row.custom_hourly_rate_per_month;
                    child.rate_per_mt = row.custom_rate_per_mt;
                    child.rent_per_month = row.custom_rent_per_month;
                    child.diesel_claimable = row.custom_diesel_claimable;
                    child.refex_diesel_slip_no = row.custom_refex_diesel_slip_no;
                    child.diesel_vendor_po_no = row.custom_diesel_vendor_po_no;
                    child.diesel_vendor_bill_no = row.custom_diesel_vendor_bill_no;
                    child.claimable_diesel_quantity = row.custom_claimable_diesel_quantity;
                    child.diesel_advance_amount = row.custom_diesel_advance_amount;
                    child.loading_vendor_po_no = row.custom_loading_vendor_po_no;
                    child.loading_vendor_bill_no = row.custom_loading_vendor_bill_no;
                    update_amount(frm, child.doctype, child.name);
                } else if (doctype ==="Purchase Order Amendment") {
                    child.lead_km = row.lead_km;
                    child.item_code = row.item_code;
                    child.item_name = row.item_name;
                    child.quantity= row.qty;
                    child.rate_per_unit = row.rate;
                    child.amount = row.net_amount;
                    child.discount = row.discount_percentage; 
                    child.discount_amount = row.discount_amount;
                    child.base_price_after_discount = row.net_amount;
                    child.total_base_value = row.total_base_value;
                    child.gst = row.igst_rate + row.cgst_rate + row.sgst_rate;
                    child.gst_amount = row.igst_amount + row.cgst_amount + row.sgst_amount;
                    update_amount(frm, child.doctype, child.name);
                }
            });
            frm.refresh_field("items");
            limit_items_rows(frm);
            
            if (doctype === "Purchase Order") {
                frm.set_value('contract_from_date', source_doc.contract_from || null);
                frm.set_value('contract_to_date', source_doc.contract_to || null);
                frm.set_value('terms_and_conditions', source_doc.tc_name || null);    
            } else if (doctype === "Purchase Order Amendment") {
                frm.set_value('contract_from_date', source_doc.revised_from_date || source_doc.contract_from || null);
                frm.set_value('contract_to_date', source_doc.revised_to_date || source_doc.contract_to || null);
                frm.set_value('terms_and_conditions', source_doc.revised_terms_and_conditions || null);
            }
            preferred_dates.from = frm.doc.contract_from_date;
            preferred_dates.to = frm.doc.contract_to_date;

        }
    })
}

frappe.ui.form.on("Purchase Order Amendment Item", {
    form_render: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (!row._original_amount) {
            row._original_amount = row.amount;
        }
    },
    discount: function(frm, cdt, cdn) {
        update_amount(frm, cdt, cdn);
    },
    revised_rate: function(frm, cdt, cdn) {
        update_amount(frm, cdt, cdn);
    },
    revised_quantity: function(frm, cdt, cdn) {
        update_amount(frm, cdt, cdn);
    },
});

function update_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    let discount_percentage = row.discount || 0;
    let qty = row.revised_quantity || row.quantity || 0;
    let rate = row.revised_rate || row.rate_per_unit || 0;
    let gst_amount_to = row.gst_amount || 0;
    let base_amount = qty * rate;
    let discount_amount = (base_amount * discount_percentage) / 100;
        discount_amount = parseFloat(discount_amount).toFixed(2);

    let final_amount = base_amount - discount_amount;
        final_amount = parseFloat(final_amount).toFixed(2);

    let total_amount_with_gst = parseFloat(final_amount || 0) + parseFloat(gst_amount_to || 0);
    total_amount_with_gst = parseFloat(total_amount_with_gst).toFixed(2);

    let total_amount_without_discount = base_amount + parseFloat(gst_amount_to || 0);
    total_amount_without_discount = parseFloat(total_amount_without_discount).toFixed(2);

    let rate_checked = frm.doc.rate === 1;
    let qty_checked = frm.doc.quantity === 1;

    if (!(rate_checked && qty_checked)) {
    if (rate_checked && !qty_checked && row.rate_per_unit == row.revised_rate) {
        frappe.msgprint({
            title: __("Alert"),
            message: __("Revised Rate cannot be same as Rate per Unit."),
            indicator: "orange"
        });
        return;
    }
    if (qty_checked && !rate_checked && row.quantity == row.revised_quantity) {
        frappe.msgprint({
            title: __("Alert"),
            message: __("Revised Quantity cannot be same as Quantity."),
            indicator: "orange"
        });
        return;
       }
    }

    if (base_amount || discount_amount || final_amount) {
        frappe.model.set_value(cdt, cdn, "amount", base_amount);
        frappe.model.set_value(cdt, cdn, "discount_amount", discount_amount);
        frappe.model.set_value(cdt, cdn, "base_price_after_discount", final_amount);
    } else {
        frappe.model.set_value(cdt, cdn, "amount", row._original_amount || 0);
    }
    if (final_amount && final_amount > 0) {
        frappe.model.set_value(cdt, cdn, "total_amount", total_amount_with_gst);
    } 
    else if ((!final_amount || final_amount === 0) && total_amount_without_discount) {
        frappe.model.set_value(cdt, cdn, "total_amount", total_amount_without_discount);
    }

    frappe.call({
        method: "refex.refex.doctype.purchase_order_amendment.purchase_order_amendment.calculate_grand_total",
        args: {
            items: frm.doc.items
        },
        callback: function(r) {
            if (r.message) {
                 frm.set_value("grand_total", r.message);
                 frm.refresh_field("grand_total");
            }
        }
    });
    return;
}
