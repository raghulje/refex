
frappe.ui.form.on("UOM Conversion Matrix Item", {
    uom_start_period: validate_period,
    uom_end_period: validate_period,

    row_status: function(frm, cdt, cdn) {
        toggle_row_editable(frm, cdt, cdn);
    },

    form_render: function(frm, cdt, cdn) {
        toggle_row_editable(frm, cdt, cdn);
    },

    uom_conversion_factor(frm, cdt, cdn){
        Conversion_multiple(frm, cdt, cdn);

    }
});

function validate_period(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    if (row.uom_start_period && row.uom_end_period) {
        if (row.uom_start_period > row.uom_end_period) {
            frappe.throw(
                __("Row {0}: UOM Start Period cannot be after UOM End Period", [row.idx])
            );
        }
    }
}

function toggle_row_editable(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    let grid = frm.fields_dict['uom_conversion_item'].grid;
    let grid_row = grid.get_row(cdn);

    let editable_fields = grid_row.docfields.filter(df => df.fieldname !== "row_status");

    let make_editable = row.row_status !== "Disable";
    editable_fields.forEach(df => {
        grid_row.toggle_editable(df.fieldname, make_editable);
    });
}

function Conversion_multiple(frm, cdt, cdn) {
    let row = locals[cdt][cdn];

    if (row.uom_conversion_factor) {
        frappe.model.set_value(cdt,cdn, "execution_quantity", row.uom_conversion_factor * frm.doc.contract_qunatity);
    }
}



