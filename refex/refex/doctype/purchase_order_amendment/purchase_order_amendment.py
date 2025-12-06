import frappe
import json
from frappe.model.document import Document
from frappe.utils import flt

class PurchaseOrderAmendment(Document):
    def autoname(self):
        source_val = self.get("source")
        original_purchase_order = self.get("original_purchase_order")
        amended_purchase_order_amendment = self.get("amended_purchase_order_amendment")
        
        if source_val == "Purchase Order":
            self.name = f"{original_purchase_order}-1"
        
        elif source_val == "Purchase Order Amendment" and amended_purchase_order_amendment:
            base_name = original_purchase_order
            latest = frappe.db.sql("""
                SELECT name 
                FROM `tabPurchase Order Amendment`
                WHERE name LIKE %s
                ORDER BY CAST(SUBSTRING_INDEX(name, '-', -1) AS UNSIGNED) DESC
                LIMIT 1
            """, (f"{base_name}-%",))
            
            if latest:
                last_num = int(latest[0][0].split("-")[-1])
                next_num = last_num + 1
                self.name = f"{base_name}-{next_num}"
            else:
                self.name = f"{base_name}-1"

@frappe.whitelist()
def calculate_grand_total(items):
    if isinstance(items, str):
        items = json.loads(items)
    total_sum = sum(flt(row.get("total_amount")) for row in items)
    return total_sum