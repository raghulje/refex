import frappe
import json

# Offline Sync API endpoints for PWA

@frappe.whitelist()
def sync_offline_trip(trip_data):
    """
    Sync offline trip data to server
    """
    try:
        # Validate data
        if not trip_data:
            frappe.throw("No trip data provided")

        # Parse if string
        if isinstance(trip_data, str):
            trip_data = json.loads(trip_data)

        # Check if trip exists
        if frappe.db.exists("Trip", trip_data.get("name")):
            # Update existing
            doc = frappe.get_doc("Trip", trip_data.get("name"))
            doc.update(trip_data)
            doc.save()
            frappe.db.commit()
            return {"status": "success", "name": doc.name, "action": "updated"}
        else:
            # Create new
            doc = frappe.get_doc(trip_data)
            doc.insert()
            frappe.db.commit()
            return {"status": "success", "name": doc.name, "action": "created"}

    except Exception as e:
        frappe.log_error(f"Offline sync error: {str(e)}", "Offline Sync Error")
        return {"status": "error", "message": str(e)}

@frappe.whitelist()
def get_offline_reference_data(doctype, filters=None):
    """
    Get reference data for offline use
    """
    try:
        if filters and isinstance(filters, str):
            filters = json.loads(filters)

        data = frappe.get_list(
            doctype,
            fields=["*"],
            filters=filters or {},
            limit_page_length=1000
        )

        return {"status": "success", "data": data}

    except Exception as e:
        frappe.log_error(f"Reference data error: {str(e)}", "Offline Reference Data Error")
        return {"status": "error", "message": str(e)}

@frappe.whitelist()
def bulk_sync_offline_data(sync_data):
    """
    Bulk sync multiple offline records
    """
    try:
        if isinstance(sync_data, str):
            sync_data = json.loads(sync_data)

        results = []
        for item in sync_data:
            try:
                if item.get("action") == "delete":
                    frappe.delete_doc(item.get("doctype"), item.get("docname"))
                    results.append({
                        "id": item.get("id"),
                        "status": "success",
                        "action": "deleted"
                    })
                else:
                    result = sync_offline_trip(item.get("data"))
                    results.append({
                        "id": item.get("id"),
                        "status": result.get("status"),
                        "name": result.get("name")
                    })
            except Exception as e:
                results.append({
                    "id": item.get("id"),
                    "status": "error",
                    "message": str(e)
                })

        frappe.db.commit()
        return {"status": "success", "results": results}

    except Exception as e:
        frappe.log_error(f"Bulk sync error: {str(e)}", "Bulk Sync Error")
        return {"status": "error", "message": str(e)}
