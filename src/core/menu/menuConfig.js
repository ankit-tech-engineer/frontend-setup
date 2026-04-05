export const menuConfig = [
    {
        "title": "Dashboard",
        "key": "dashboard",
        "link": "/",
        "icon": "Home",
        "description": "This is dashboard menu",
        "status": "active",
        "is_deleted": false,
        "children": [],
        "allowed_roles": [
            "*"
        ],
        "order_by": 1
    },
    {
        "title": "Vendors",
        "key": "vendor",
        "link": "/vendors",
        "description": "vendors",
        "icon": "UserKey",
        "status": "active",
        "is_deleted": false,
        "allowed_roles": [
            "super_admin"
        ],
        "order_by": 2,
        "children": []
    },
    {
        "title": "Users",
        "key": "users",
        "link": "/users",
        "description": "Users",
        "icon": "Users",
        "status": "active",
        "is_deleted": false,
        "allowed_roles": [
            "super_admin", "admin","manager"
        ],
        "order_by": 3
    },
    {
        "title": "Access Control",
        "key": "acl",
        "link": "/",
        "icon": "ShieldCheck",
        "description": "This is Access Control Menu",
        "status": "active",
        "children": [
            {
                "title": "Roles",
                "key": "roles",
                "link": "/acl/roles",
                "description": "This is Roles Menu",
                "status": "active",
                "icon": "UserRoundSearch",
                "allowed_roles": ["super_admin","admin"]
            },
            {
                "title": "Resources",
                "key": "resources",
                "link": "/acl/resources",
                "description": "This is Resources Menu",
                "status": "active",
                "icon": "Ambulance",
                "allowed_roles": ["super_admin"]
            },
            {
                "title": "Actions",
                "key": "actions",
                "link": "/acl/actions",
                "description": "This is Actions Menu",
                "status": "active",
                "icon": "ShieldPlus",
                "allowed_roles": ["super_admin"]
            },
            {
                "title": "Resource Action Mapping",
                "key": "resource-action-mapping",
                "link": "/acl/resource-action-mapping",
                "description": "This is Resource Action Mapping Menu",
                "status": "active",
                "icon": "CirclePile",
                "allowed_roles": ["super_admin"]
            },
            {
                "title": "Resource Mapping",
                "key": "resource-mapping",
                "link": "/acl/resource-mapping",
                "description": "This is Resource Mapping Menu",
                "status": "active",
                "icon": "CirclePile",
                "allowed_roles": ["super_admin"]
            },
            {
                "title": "Role Management",
                "key": "role-management",
                "link": "/acl/role-management",
                "description": "This is Role Management Menu",
                "status": "active",
                "icon": "ShieldUser",
                "allowed_roles": ["super_admin","admin"]
            }
        ],
        "allowed_roles": ["super_admin","admin"],
        "order_by": 4
    },
    {
        "title": "Settings",
        "key": "settings",
        "link": "/settings",
        "description": "Settings",
        "icon": "Settings",
        "status": "active",
        "is_deleted": false,
        "allowed_roles": [
            "super_admin", "admin"
        ],
        "order_by": 5,
        "children": []
    },
    {
        "title": "Masters",
        "key": "masters",
        "link": "/masters",
        "description": "Masters",
        "icon": "GraduationCap",
        "status": "active",
        "is_deleted": false,
        "allowed_roles": [
            "super_admin"
        ],
        "order_by": 6,
        "children": [
            {
                "title": "Vendor Type",
                "key": "vendor-type",
                "link": "/masters/vendor-type",
                "description": "This is Vendor Type Menu",
                "status": "active",
                "icon": "Anvil",
                "allowed_roles": ["super_admin"]
            },
            {
                "title": "Subscriptions",
                "key": "subscriptions",
                "link": "/masters/subscriptions",
                "description": "This is Subscriptions Menu",
                "status": "active",
                "icon": "Anvil",
                "allowed_roles": ["super_admin"],
                "children": [
                    {
                        "title": "Features",
                        "key": "features",
                        "link": "/masters/subscriptions/features",
                        "description": "This is Features Menu",
                        "status": "active",
                        "icon": "Anvil",
                        "allowed_roles": ["super_admin"],
                        "children": []
                    },
                    {
                        "title": "Plans",
                        "key": "plans",
                        "link": "/masters/subscriptions/plans",
                        "description": "This is Plans Menu",
                        "status": "active",
                        "icon": "Anvil",
                        "allowed_roles": ["super_admin"],
                        "children": []
                    },
                    {
                        "title": "Coupons",
                        "key": "coupons",
                        "link": "/masters/subscriptions/coupons",
                        "description": "This is Coupons Menu",
                        "status": "active",
                        "icon": "Anvil",
                        "allowed_roles": ["super_admin"],
                        "children": []
                    }
                ]
            }
        ]
    },

]