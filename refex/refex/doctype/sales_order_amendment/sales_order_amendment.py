import frappe
from frappe.model.document import Document
 
class SalesOrderAmendment(Document):
    def autoname(self):
        original_so = self.original_so
        source_val = self.source
 
        if source_val == "Sales Order":
            self.name = f"{original_so}-1"
 
        elif source_val == "Sales Order Amendment":
            latest = frappe.get_all(
                "Sales Order Amendment",
                filters={"original_so": original_so},
                fields=["name"],
                order_by="CAST(SUBSTRING_INDEX(name, '-', -1) AS UNSIGNED) DESC",
                limit=1
            )
 
            if latest:
                last_num = int(latest[0].name.split("-")[-1])
                self.name = f"{original_so}-{last_num + 1}"
            else:
                self.name = f"{original_so}-1"