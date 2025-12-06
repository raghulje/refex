# Copyright (c) 2025, tharun and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class SaleOrderAmendmentItem(Document):
	pass

def validate(self):  # assuming 'items' is the child table fieldname
        if revised_rate and revised_quantity:
            revised_amount = revised_rate * revised_quantity
