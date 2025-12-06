app_name = "refex"
app_title = "Refex"
app_publisher = "tharun"
app_description = "ash disposal"
app_email = "tharun@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "refex",
# 		"logo": "/assets/refex/logo.png",
# 		"title": "Refex",
# 		"route": "/refex",
# 		"has_permission": "refex.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/refex/css/refex.css"
app_include_js = [
    "/assets/refex/js/pwa-init.js",
    "/assets/refex/js/offline-db.js",
    "/assets/refex/js/offline-sync.js",
    "/assets/refex/js/offline-files.js",
    "/assets/refex/js/offline-listview.js"
]

# include js, css files in header of web template
# web_include_css = "/assets/refex/css/refex.css"
# web_include_js = "/assets/refex/js/refex.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "refex/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"Purchase Order" : "public/js/purchase_order.js"}
doctype_js = {"Trip" : "public/js/trip-offline.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "refex/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "refex.utils.jinja_methods",
# 	"filters": "refex.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "refex.install.before_install"
# after_install = "refex.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "refex.uninstall.before_uninstall"
# after_uninstall = "refex.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "refex.utils.before_app_install"
# after_app_install = "refex.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "refex.utils.before_app_uninstall"
# after_app_uninstall = "refex.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "refex.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

permission_query_conditions = {
	"Item": "refex.refex.permission_query_condition.get_permission_query_conditions_item",
	"Supplier": "refex.refex.permission_query_condition.get_permission_query_conditions_supplier",
	"Customer": "refex.refex.permission_query_condition.get_permission_query_conditions_customer",
	"Sales Order": "refex.refex.permission_query_condition.get_permission_query_conditions_so",
	"Sales Order Amendment": "refex.refex.permission_query_condition.get_permission_query_conditions_soa",
	"Purchase Order": "refex.refex.permission_query_condition.get_permission_query_conditions_po",
	"Purchase Order Amendment": "refex.refex.permission_query_condition.get_permission_query_conditions_poa",
	"UOM conversion matrix": "refex.refex.permission_query_condition.get_permission_query_conditions_uom",
	"Material Request": "refex.refex.permission_query_condition.get_permission_query_conditions_mr",
    "Company": "refex.refex.permission_query_condition.get_permission_query_conditions_company",
    "Lead Survey": "refex.refex.permission_query_condition.get_permission_query_conditions_ls",
    "Trip": "refex.refex.permission_query_condition.get_permission_query_conditions_trip",
    "LOA Contract": "refex.refex.permission_query_condition.get_permission_query_conditions_loa_contract",
    "LOA Contract Amendment": "refex.refex.permission_query_condition.get_permission_query_conditions_loa_amend",
    "Project": "refex.refex.permission_query_condition.get_permission_query_conditions_project",
    "Purchase Invoice": "refex.refex.permission_query_condition.get_permission_query_conditions_pi",
    "Payment Terms Template": "refex.refex.permission_query_condition.get_permission_query_conditions_ptt",
    "Asset Maintenance": "refex.refex.permission_query_condition.get_permission_query_conditions_asset_main",
    "Journal Entry": "refex.refex.permission_query_condition.get_permission_query_conditions_journal_entry",
    "Stock Entry": "refex.refex.permission_query_condition.get_permission_query_conditions_stock_entry",
    "Expense Entry": "refex.refex.permission_query_condition.get_permission_query_conditions_expense_entry",
    
	# "Item": "refex.refex.permission_query_condition.approver_query_condition",
	# "Supplier": "refex.refex.permission_query_condition.supplier_query_condition",
	# "Customer": "refex.refex.permission_query_condition.customer_query_condition",
	# "Sales Order": "refex.refex.permission_query_condition.so_query_condition",
	# "Purchase Order": "refex.refex.permission_query_condition.po_query_condition",
	# "Material Request": "refex.refex.permission_query_condition.mr_query_condition",
	# "Purchase Order Amendment": "refex.refex.permission_query_condition.poa_query_condition",
	# "Sales Order Amendment": "refex.refex.permission_query_condition.soa_query_condition",
}
  
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }
# has_permission = {
#     # "Item": "refex.refex.permission_query_condition.has_permission_item",
#     "Supplier": "refex.refex.permission_query_condition.has_permission_supplier",
#     "Customer": "refex.refex.permission_query_condition.has_permission_customer",
#     "Sales Order": "refex.refex.permission_query_condition.has_permission_sale_order",
#     "Sales Order Amendment": "refex.refex.permission_query_condition.has_permission_sale_order_amend",
#     "Purchase Order": "refex.refex.permission_query_condition.has_permission_purchase_order",
#     "Purchase Order Amendment": "refex.refex.permission_query_condition.has_permission_purchase_order_amend",
#     "UOM conversion matrix": "refex.refex.permission_query_condition.has_permission_uom"
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
	# "all": [
	# 	"refex.tasks.all"
	# ],
	# "daily": [
	# 	"refex.refex.schedular_events.uom_converion_update"
	# ],
	# "hourly": [
	# 	"refex.tasks.hourly"
	# ],
	# "weekly": [
	# 	"refex.tasks.weekly"
	# ],
	# "monthly": [
	# 	"refex.tasks.monthly"
	# ],
# }

# Testing
# -------

# before_tests = "refex.install.before_tests"

# Overriding Methods
# ------------------------------
# pandiaraj added for pdf merge functionality
override_whitelisted_methods = {
	# "frappe.desk.doctype.event.event.get_events": "refex.event.get_events"
    # 'frappe.utils.print_format.download_pdf':"refex.refex.api.download_pdf"
}
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "refex.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["refex.utils.before_request"]
# after_request = ["refex.utils.after_request"]

# Job Events
# ----------
# before_job = ["refex.utils.before_job"]
# after_job = ["refex.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"refex.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }


doctype_js = {
    "Sales Order": "public/js/sales_order.js",
    "Purchase Order": "public/js/purchase_order.js",
    "Purchase Invoice": "public/js/purchase_invoice.js",
    "Item": "public/js/item.js",
    "Customer": "public/js/customer.js",
    "Supplier": "public/js/supplier.js",
    "Project": "public/js/project.js",
    "Vehicle":"public/js/vehicle.js",
    "Company": "public/js/company.js",
    "Asset Maintenance": "public/js/asset_maintenance.js",
    "Terms and Conditions" : "public/js/terms_and_conditions.js"
}

doc_events = {
    "Purchase Invoice": {
        "validate":"refex.refex.api.check_trip_completed_sts",
        "before_save": [
            "refex.refex.api.calculate_retention_PI",
            "refex.refex.api.track_approval_history"
        ],
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
    },
    "Sales Invoice": {
        "before_save": [
            "refex.refex.api.calculate_retention_SI",
            "refex.refex.api.track_approval_history"
        ],
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
    },
    "Project":{
        "before_save": [
            # "refex.refex.api.calculate_balance_qty",
            "refex.refex.api.notification_for_team",
            "refex.refex.api.track_approval_history",
            # "refex.refex.api.notification_for_team",
            # "refex.refex.api.emp_approver_details",
        ],
        "before_insert": "refex.utils.project.validate_project",
        "on_update": "refex.utils.project.link_project_to_loa",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
        "on_cancel": "refex.utils.project.clear_links_on_cancel",
        # "on_submit": "refex.utils.project.link_project_to_sales_orders"
    },
    "Item": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
        "autoname": "refex.refex.api.item_autoname",
        # "before_naming": "refex.refex.api.custom_item_autoname"
    },
    "Supplier": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
        # "validate": "refex.refex.api.validate_unique_gstin"
        
    },
    "Customer": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
        # "validate": "refex.refex.api.validate_unique_gstin"
        
    },
    "Company": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
        # "validate": "refex.refex.api.validate_unique_gstin"
    },
    "Sales Order": {
        "before_save": [
            # "refex.refex.api.restrict_so_creation",
            "refex.refex.api.track_approval_history",
            "refex.refex.api.emp_approver_details",
            "refex.refex.api.update_total_qty"

        ],
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
        "before_insert": "refex.refex.api.restrict_so_creation"
    },
    "Sales Order Amendment": {
        "before_save": "refex.refex.api.track_approval_history",
        # "on_submit": "refex.refex.doctype.sales_order_amendment.sales_order_amendment.on_submit",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",

    },
    "Purchase Order":{
        # "before_insert":"refex.refex.api.restrict_po_creation",
        "before_save":"refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
    },
    "Purchase Order Amendment": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
    },
    "LOA Contract": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
    },
    "LOA Contract Amendment": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
        # "on_submit": "refex.refex.doctype.loa_contract_amendment.loa_contract_amendment.on_submit",
    },
    "UOM Conversion Matrix": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
    },
    "Material Request": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history"
    },
    "Lead Survey": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
    },
    "Trip": {
        # "before_insert": "refex.refex.api.restrict_trip_creation",
        "before_save": [
            "refex.refex.api.track_approval_history",
            # "refex.refex.api.update_unloaded_qty"
            ],
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
    },
    "Payment Terms Template": {
        "before_save": "refex.refex.api.emp_approver_details"
    },
    "Asset Maintenance": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",
    },
    "Journal Entry": {
        "before_save": "refex.refex.api.emp_approver_details"
    },
    "Stock Entry": {
        "before_save": "refex.refex.api.emp_approver_details"    
    },
    "Expense Entry": {
        "before_save": "refex.refex.api.emp_approver_details"    
    },
    "Asset Maintenance": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",       
    },
    "Maintenance Work Order": {
        "before_save": "refex.refex.api.track_approval_history",
        "before_submit": "refex.refex.api.track_approval_history",
        "before_cancel": "refex.refex.api.track_approval_history",       
    },
    "Budget": {
        "before_save": 
        ["refex.refex.api.emp_approver_details",       
        "refex.refex.api.validate_budget"]       
    },
    # "Maintenance Job Card": {
    #     "before_save": "refex.refex.api.track_approval_history",
    #     "before_submit": "refex.refex.api.track_approval_history",
    #     "before_cancel": "refex.refex.api.track_approval_history",       
    # },
    "Expense Category": {
        "before_save": "refex.refex.api.emp_approver_details"       
    },
    "Vehicle": {
        "autoname": "refex.refex.api.rename",
        "before_save": ["refex.refex.api.update_vehicle_log",
                        "refex.refex.api.update_project_log"]     
    }
    #    "Budget": {
    #   "before_save": ["refex.refex.api.cal_no_of_months",
    #                     "refex.refex.api.maintain_status"]
    # }
}


website_context = {
    "favicon": "/assets/refex/img/logo.png",
    "splash_image": "/assets/refex/img/logo.png",
}

app_include_js = "/assets/refex/js/navbar.js"

fixtures = [
    {
        "doctype": "Workflow",
        "filters": {
            "document_type": [
                "in",
                [
                    "item","Lead Survey","Project","LOA Contract",
                    "Sales Order","Lead Survey","BD Handover Sheet",
                    "Maintenance Work Order", "Maintenance Job Card",
                    "Sales Order Amendment","Vehicle","Journal Entry",
                    "Purchase Order","Expense Entry","Material Request",
                    "Supplier", "Asset Movement", "Trip","Payment Term",
                    "Purchase Order Amendment","Payment Terms Template",
                    "UOM Conversion Matrix","UOM Conversion Matrix Item",
                    "Stock Entry","UOM","Purchase Invoice","Asset Maintenance",
                    "Customer","Company","Lead Survey","LOA Contract Amendment",
                ]
            ]
        }
    },
    {
        "doctype": "Supplier Group",
        "filters": [
            ["name", "in", [
                "Loading Vendor","Transportation Vendor","Unloading Vendor",
                "Vehicle Vendor","Weighment Vendor","Diesel Vendor"
            ]]
        ]
    },
    # {
    #     "doctype": "Item Group",
    #     "filters": [
    #         ["name", "in", [
    #             "Transportation", "Battery", "Tyre","Products"
    #             "Spares", "Asset Maintenance", "Raw Materials", "Services",
    #         ]]
    #     ]
    # },
    {"doctype": "Position Code"},
    {"doctype": "Workflow Action Master"},
    {"doctype": "Workflow State"},
    # {"doctype":"Custom Field","filters":{"module":["in","Refex"]}},
    # {"doctype":"Property Setter","filters":{"module":["in","Refex"]}},
    {
        "doctype": "Custom Field",
        "filters": [
            ["module", "=", "Refex"],
            ["dt", "!=", "Customer"],
            ["dt", "!=", "Company"]
        ]
    },
    {
        "doctype": "Property Setter",
        "filters": [
            ["module", "=", "Refex"],
            ["doc_type", "!=", "Customer"],
            ["doc_type", "!=", "Company"]
        ]   
    },
    {"doctype":"Workspace", "filters":{"module":["in","Refex"]}},
    {"doctype": "Role",},  
    # {"doctype": "Custom DocPerm" }, 
    {"doctype": "Translation"}
] 

scheduler_events = {
    "daily": [
        "refex.refex.doctype.loa_contract.loa_contract.send_expiry_notifications",
        "refex.utils.vehicle.send_vehicle_expiry_notifications",
        # "refex.refex.schedular_events.uom_converion_update",
        "refex.refex.doctype.trip.trip.check_overdue_trips",
    ],
    # "Sales Order": {
    #     "after_save": "refex.refex.utils.project.update_project_checkbox"
    # }
}
