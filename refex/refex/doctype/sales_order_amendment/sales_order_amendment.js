frappe.ui.form.on("Sales Order Amendment", {

    original_so: function(frm) {
        set_amendment_filter(frm);

        if (!frm.doc.amendment_so) {
            fetch_all_data(frm, "Sales Order", frm.doc.original_so);
        }
    },

    amendment_so: function(frm) {
        if (frm.doc.amendment_so) {
            fetch_all_data(frm, "Sales Order Amendment", frm.doc.amendment_so);
        }
    },

    refresh: function(frm) {
        set_amendment_filter(frm);
        limit_items_rows(frm); 

        frm.toggle_display("revised_from_date", !!frm.doc.tenure)
        frm.toggle_display("revised_to_date", !!frm.doc.tenure)
        frm.toggle_display("revised_terms_and_conditions", !!frm.doc.terms_and_conditions);
        toggle_revised_column(frm);
        toggle_revised_column(frm);

        if(frm.doc.docstatus == 2){
            setTimeout(function(){
                $("[data-label='Amend']").hide()
            },250)
        }
        (frm.doc.items || []).forEach(row => {
            let rate = row.revised_rate || row.rate || 0;
            let qty  = row.revised_quantity || row.quantity || 0;
            row.amount = flt(rate) * flt(qty);
        });
        frm.refresh_field("items");
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
    }
});

// 🔹 Limit amendment_so to only show amendments for the selected original_so
function set_amendment_filter(frm) {
    frm.set_query("amendment_so", function() {
        return {
            filters: {
                original_so: frm.doc.original_so || ""
            }
        };
    });
}

function toggle_revised_column(frm) {
    frm.fields_dict["items"].grid.toggle_display("revised_rate", !!frm.doc.rate);
    frm.fields_dict["items"].grid.toggle_display("revised_quantity", !!frm.doc.quantity);
}

// 🔹 Hide Add Row if 1 or more rows exist
function limit_items_rows(frm) {
    if ((frm.doc.items || []).length >= 1) {
        frm.fields_dict["items"].grid.wrapper.find('.grid-add-row').hide();
        frm.fields_dict["items"].grid.wrapper.find('.grid-footer').hide();
    } else {
        frm.fields_dict["items"].grid.wrapper.find('.grid-add-row').show();
        frm.fields_dict["items"].grid.wrapper.find('.grid-footer').show();
    }
}

// Store fetched contract dates in memory for later
let preferred_dates = { from: null, to: null };

function fetch_all_data(frm, doctype, docname) {
    if (!docname) return;

    frappe.call({
        method: "frappe.client.get",
        args: { doctype: doctype, name: docname },
        callback: function(r) {
            if (!r.message) return;
            let source_doc = r.message;

            // Populate items table
            frm.clear_table("items");
            (source_doc.items || []).forEach(row => {
                let child = frm.add_child("items");

                if (doctype === "Sales Order") {
                    child.lead_km = row.lead_km;
                    child.item_group = row.item_group;
                    child.item_code = row.item_code;
                    child.item_name = row.item_name;
                    child.quantity = row.qty;
                    child.rate_per_unit = row.rate;
                    child.amount = row.net_amount;
                    child.total_base_value = row.total_base_value;
                    child.gst_value = row.igst_amount + row.cgst_amount + row.sgst_amount;
                    child.base_price_after_discount = row.base_price;
                    child.discount = row.discount_percentage
                    child.discount_amount = row.discount_amount
                } else if (doctype === "Sales Order Amendment") {
                    child.lead_km = row.revised_lead_km;
                    child.item_group = row.item_group;
                    child.item_code = row.item_code;
                    child.item_name = row.item_name;
                    child.quantity = row.revised_quantity;
                    child.rate_per_unit = row.revised_rate;
                    child.amount = row.revised_amount;
                    child.total_base_value = row.total_base_value;
                    child.gst_value = row.igst_amount + row.cgst_amount + row.sgst_amount;
                    child.base_price_after_discount = row.base_price;
                    child.discount = row.discount_percentage
                    child.discount_amount = row.discount_amount

                }
            });
            frm.refresh_field("items");

            // Hide Add Row after fetching
            limit_items_rows(frm);

            // Set contract dates directly
            if (doctype === "Sales Order") {
                frm.set_value('contract_from_date', source_doc.custom_sales_order_duration_from || null);
                frm.set_value('contract_to_date', source_doc.delivery_date || null);
                frm.set_value('terms_and_conditions', source_doc.tc_name || null);
            } else if (doctype === "Sales Order Amendment") {
                frm.set_value('contract_from_date', source_doc.revised_from_date || source_doc.custom_sales_order_duration_from || null);
                frm.set_value('contract_to_date', source_doc.revised_to_date || source_doc.delivery_date || null);
                frm.set_value('terms_and_conditions', source_doc.revised_terms_and_conditions || null);
            }

            // Save preferred dates for tenure toggle
            preferred_dates.from = frm.doc.contract_from_date;
            preferred_dates.to = frm.doc.contract_to_date;
            
        }
    });
}



frappe.ui.form.on("Sale Order Amendment Item", {
    form_render: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (!row._original_amount) {
            row._original_amount = row.amount;
        }
    },

    total_value: function(frm, cdt, cdn) {
        let total = 0;
        (frm.doc.items || []).forEach(row => {
            total += row.total_value || 0;
        });
        frm.set_value("grand_total", total);
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
        frappe.model.set_value(cdt, cdn, "total_value", total_amount_with_gst);
    } 
    else if ((!final_amount || final_amount === 0) && total_amount_without_discount) {
        frappe.model.set_value(cdt, cdn, "total_value", total_amount_without_discount);
    }
}