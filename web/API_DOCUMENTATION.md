# 📱 Bazarli API Documentation

## 🌐 Base URL
```
Production: https://your-domain.com/api/v1
Development: http://127.0.0.1:8000/api/v1
```

## 🔐 Authentication
All protected endpoints require Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

## 📋 Response Format
All responses follow this format:
```json
{
    "success": true|false,
    "data": { ... },
    "message": "Optional message"
}
```

---

# 📑 Table of Contents

1. [Authentication](#1-authentication)
2. [Home & Settings](#2-home--settings)
3. [Categories](#3-categories)
4. [Products](#4-products)
5. [Stores](#5-stores)
6. [Cart](#6-cart)
7. [Orders](#7-orders)
8. [Favorites](#8-favorites)
9. [Delivery Locations](#9-delivery-locations)
10. [User Profile](#10-user-profile)
11. [Notifications](#11-notifications)
12. [Driver Routes](#12-driver-routes)
13. [Store Owner Routes](#13-store-owner-routes)
14. [Location Data](#14-location-data)

---

# 1. Authentication

## 1.1 Register New User
**POST** `/register`

**Request Body:**
```json
{
    "name": "اسم المستخدم",
    "email": "user@example.com",  // optional
    "phone": "0599999999",
    "user_type": "customer",  // customer | store_owner | driver
    "address": "العنوان",
    "latitude": 31.5,
    "longitude": 35.5,
    "governorate_id": 1,
    "city_id": 1,
    "area_id": 1
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "user": { ... },
        "phone": "0599999999",
        "user_type": "customer",
        "action": "register",
        "verification_required": true,
        "otp": "12345"  // Only in debug mode
    },
    "message": "تم التسجيل بنجاح. يرجى التحقق من رقم الهاتف"
}
```

---

## 1.2 Login
**POST** `/login`

**Request Body:**
```json
{
    "phone": "0599999999"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "phone": "0599999999",
        "user_type": "customer",
        "action": "login",
        "otp": "12345"  // Only in debug mode
    },
    "message": "تم إرسال رمز التحقق إلى رقم هاتفك"
}
```

---

## 1.3 Verify Phone (OTP)
**POST** `/verify-phone`

**Request Body:**
```json
{
    "phone": "0599999999",
    "code": "12345",
    "action": "login"  // login | register
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "user": { ... },
        "token": "Bearer token here",
        "token_type": "Bearer",
        "is_verified": true
    },
    "message": "تم التحقق من الهاتف بنجاح"
}
```

---

## 1.4 Resend Verification Code
**POST** `/resend-verification`

**Request Body:**
```json
{
    "phone": "0599999999",
    "action": "login"
}
```

---

## 1.5 Get Current User 🔒
**GET** `/user`

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "اسم المستخدم",
        "email": "user@example.com",
        "phone": "0599999999",
        "user_type": "customer",
        "address": "العنوان",
        "governorate": { ... },
        "city": { ... },
        "area": { ... }
    }
}
```

---

## 1.6 Logout 🔒
**POST** `/logout`

---

# 2. Home & Settings

## 2.1 Get Home Page Data
**GET** `/home`

**Response:**
```json
{
    "success": true,
    "data": {
        "categories": [
            {
                "id": 1,
                "name": "فئة",
                "slug": "category",
                "image": "url",
                "icon": "icon",
                "products_count": 50
            }
        ],
        "featured_products": [ ... ],
        "featured_stores": [ ... ],
        "new_products": [ ... ],
        "discounted_products": [ ... ]
    }
}
```

---

## 2.2 Search
**GET** `/search?query=بحث`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search term (min 2 chars) |

**Response:**
```json
{
    "success": true,
    "data": {
        "products": [ ... ],
        "stores": [ ... ],
        "categories": [ ... ]
    }
}
```

---

## 2.3 Nearby Stores
**GET** `/nearby-stores`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | float | Yes | User latitude |
| longitude | float | Yes | User longitude |
| radius | float | No | Search radius in km (default: 10) |

---

## 2.4 App Settings
**GET** `/settings`

**Response:**
```json
{
    "success": true,
    "data": {
        "app_name": "Bazarli",
        "app_version": "1.0.0",
        "min_order_amount": 0,
        "default_delivery_fee": 0,
        "default_estimated_delivery_time": 15,
        "payment_methods": [
            {"key": "cash", "name_ar": "الدفع نقداً", "name_en": "Cash", "enabled": true}
        ],
        "support_phone": "",
        "support_email": ""
    }
}
```

---

# 3. Categories

## 3.1 Get All Categories
**GET** `/categories`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| per_page | int | No | Items per page (default: 20) |

---

## 3.2 Get Category Details
**GET** `/categories/{id}`

---

# 4. Products

## 4.1 Get All Products
**GET** `/products`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category_id | int | No | Filter by category |
| store_id | int | No | Filter by store |
| featured | bool | No | Only featured products |
| governorate_id | int | No | Filter by governorate |
| city_id | int | No | Filter by city |
| search | string | No | Search in name/description |
| sort_by | string | No | sort_order, name, price, created_at, sales_count |
| sort_order | string | No | asc, desc |
| per_page | int | No | Items per page (max: 100) |

---

## 4.2 Get Product Details
**GET** `/products/{id}`

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "اسم المنتج",
        "slug": "product-slug",
        "description": "وصف المنتج",
        "price": 10.00,
        "discount_price": 8.00,
        "final_price": 8.00,
        "discount_percentage": 20,
        "image": "url",
        "images": ["url1", "url2"],
        "unit": "piece",
        "is_available": true,
        "is_featured": false,
        "category": { ... },
        "store": { ... }
    }
}
```

---

# 5. Stores

## 5.1 Get All Stores
**GET** `/stores`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search by name/address |
| category_id | int | No | Filter by product category |
| governorate_id | int | No | Filter by governorate |
| city_id | int | No | Filter by city |
| store_type | string | No | Filter by store type |
| latitude | float | No | User latitude for distance |
| longitude | float | No | User longitude for distance |
| radius | float | No | Search radius in km |
| per_page | int | No | Items per page |

---

## 5.2 Get Store Details
**GET** `/stores/{id}`

---

## 5.3 Get Store Products
**GET** `/stores/{id}/products`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category_id | int | No | Filter by category |
| search | string | No | Search in name |
| per_page | int | No | Items per page |

---

# 6. Cart 🔒

## 6.1 Get Cart
**GET** `/cart`

**Response:**
```json
{
    "success": true,
    "data": {
        "items": [
            {
                "id": 1,
                "product": { ... },
                "quantity": 2,
                "subtotal": 20.00
            }
        ],
        "total": 20.00,
        "items_count": 2
    }
}
```

---

## 6.2 Get Cart Count
**GET** `/cart/count`

---

## 6.3 Add to Cart
**POST** `/cart/add`

**Request Body:**
```json
{
    "product_id": 1,
    "quantity": 2
}
```

---

## 6.4 Update Cart Item
**PUT** `/cart/update`

**Request Body:**
```json
{
    "product_id": 1,
    "quantity": 3  // Set to 0 to remove
}
```

---

## 6.5 Remove from Cart
**DELETE** `/cart/remove/{product_id}`

---

## 6.6 Clear Cart
**DELETE** `/cart/clear`

---

# 7. Orders 🔒

## 7.1 Get My Orders
**GET** `/orders/my-orders`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| per_page | int | No | Items per page |

---

## 7.2 Create Order
**POST** `/orders`

**Request Body:**
```json
{
    "stores": [
        {
            "store_id": 1,
            "items": [
                {"product_id": 1, "quantity": 2},
                {"product_id": 2, "quantity": 1}
            ]
        },
        {
            "store_id": 2,
            "items": [
                {"product_id": 5, "quantity": 3}
            ]
        }
    ],
    "delivery_address": "عنوان التوصيل",
    "delivery_latitude": 31.5,
    "delivery_longitude": 35.5,
    "customer_phone": "0599999999",
    "payment_method": "cash",  // cash | card | wallet
    "location_notes": "ملاحظات الموقع",
    "notes": "ملاحظات عامة"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "order_number": "ORD-123456",
        "status": "pending_driver_approval",
        "total_amount": 50.00,
        ...
    },
    "message": "تم إنشاء الطلب بنجاح"
}
```

---

## 7.3 Get Order Details
**GET** `/orders/{order_id}`

---

## 7.4 Cancel Order
**POST** `/orders/{order_id}/cancel`

---

## 7.5 Track Order
**GET** `/orders/{order_id}/track`

**Response:**
```json
{
    "success": true,
    "data": {
        "order": { ... },
        "status": "out_for_delivery",
        "estimated_delivery_time": 15,
        "delivery_driver": {
            "id": 1,
            "name": "اسم السائق",
            "phone": "0599999999"
        }
    }
}
```

---

# 8. Favorites 🔒

## 8.1 Get Favorites
**GET** `/favorites`

---

## 8.2 Add to Favorites
**POST** `/favorites`

**Request Body:**
```json
{
    "product_id": 1
}
```

---

## 8.3 Remove from Favorites
**DELETE** `/favorites/{product_id}`

---

# 9. Delivery Locations 🔒

## 9.1 Get Locations
**GET** `/delivery-locations`

---

## 9.2 Add Location
**POST** `/delivery-locations`

**Request Body:**
```json
{
    "label": "المنزل",
    "address": "العنوان الكامل",
    "latitude": 31.5,
    "longitude": 35.5,
    "notes": "ملاحظات",
    "is_default": true
}
```

---

## 9.3 Update Location
**PUT** `/delivery-locations/{id}`

---

## 9.4 Delete Location
**DELETE** `/delivery-locations/{id}`

---

## 9.5 Set Default Location
**POST** `/delivery-locations/{id}/default`

---

# 10. User Profile 🔒

## 10.1 Get Profile
**GET** `/profile`

---

## 10.2 Update Profile
**PUT** `/profile`

**Request Body:**
```json
{
    "name": "اسم المستخدم",
    "email": "user@example.com",
    "phone": "0599999999",
    "address": "العنوان",
    "latitude": 31.5,
    "longitude": 35.5,
    "governorate_id": 1,
    "city_id": 1,
    "area_id": 1
}
```

---

## 10.3 Change Password
**POST** `/profile/change-password`

**Request Body:**
```json
{
    "current_password": "old_password",
    "new_password": "new_password",
    "new_password_confirmation": "new_password"
}
```

---

## 10.4 User Role Info
**GET** `/role`

**Response:**
```json
{
    "success": true,
    "data": {
        "current_role": "customer",
        "can_upgrade_to_store_owner": true,
        "can_upgrade_to_driver": true,
        "has_store": false,
        "has_driver_application": false,
        "driver_application_status": null
    }
}
```

---

## 10.5 Request Role Upgrade
**POST** `/role/upgrade`

**Request Body:**
```json
{
    "target_role": "store_owner"  // store_owner | driver
}
```

---

# 11. Notifications 🔒

## 11.1 Get Notifications
**GET** `/notifications`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| unread_only | bool | No | Only unread notifications |
| type | string | No | Filter by type |
| per_page | int | No | Items per page |

---

## 11.2 Get Unread Count
**GET** `/notifications/unread-count`

---

## 11.3 Mark as Read
**POST** `/notifications/{id}/read`

---

## 11.4 Mark All as Read
**POST** `/notifications/read-all`

---

## 11.5 Delete Notification
**DELETE** `/notifications/{id}`

---

## 11.6 Subscribe to Push Notifications
**POST** `/notifications/subscribe`

**Request Body:**
```json
{
    "endpoint": "https://...",
    "keys": {
        "p256dh": "...",
        "auth": "..."
    },
    "device_type": "mobile"
}
```

---

## 11.7 Unsubscribe
**POST** `/notifications/unsubscribe`

**Request Body:**
```json
{
    "endpoint": "https://..."
}
```

---

# 12. Driver Routes 🔒

## 12.1 Get Driver Application Form
**GET** `/driver/apply`

**Response:**
```json
{
    "success": true,
    "data": {
        "application": null,
        "governorates": [ ... ],
        "cities": [ ... ],
        "profile": {
            "name": "...",
            "phone": "...",
            "address": "...",
            "governorate_id": 1,
            "city_id": 1
        }
    }
}
```

---

## 12.2 Submit Driver Application
**POST** `/driver/apply`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | Yes | Full name |
| phone | string | Yes | Phone number |
| address | string | Yes | Address |
| birth_date | date | Yes | Birth date |
| governorate_id | int | Yes | Governorate ID |
| city_id | int | Yes | City ID |
| vehicle_type | string | No | Vehicle type |
| personal_photo | file | Yes* | Personal photo |
| vehicle_photo | file | Yes* | Vehicle photo |
| id_photo | file | Yes* | ID photo |

*Required on first submission, optional on update.

---

## 12.3 Get Application Status
**GET** `/driver/application-status`

---

## 12.4 Get Driver Orders
**GET** `/driver/orders`

**Response:**
```json
{
    "success": true,
    "data": {
        "pending_approval_orders": [ ... ],
        "accepted_orders": [ ... ],
        "active_orders": [ ... ],
        "recent_completed_orders": [ ... ]
    }
}
```

---

## 12.5 Get Order Details
**GET** `/driver/orders/{order_id}`

---

## 12.6 Accept Order
**POST** `/driver/orders/{order_id}/accept`

---

## 12.7 Reject Order
**POST** `/driver/orders/{order_id}/reject`

---

## 12.8 Pick Up Order
**POST** `/driver/orders/{order_id}/pick-up`

---

## 12.9 Start Delivery
**POST** `/driver/orders/{order_id}/start-delivery`

---

## 12.10 Complete Delivery
**POST** `/driver/orders/{order_id}/complete`

---

## 12.11 Update Driver Location
**POST** `/driver/location`

**Request Body:**
```json
{
    "latitude": 31.5,
    "longitude": 35.5
}
```

---

## 12.12 Get Driver Statistics
**GET** `/driver/statistics`

**Response:**
```json
{
    "success": true,
    "data": {
        "today": {
            "completed_orders": 5,
            "earnings": 50.00
        },
        "this_week": { ... },
        "this_month": { ... },
        "total": { ... },
        "active_orders": 2
    }
}
```

---

# 13. Store Owner Routes 🔒

## 13.1 Get Store Setup Form
**GET** `/store/setup`

**Response:**
```json
{
    "success": true,
    "data": {
        "has_store": false,
        "store_types": [
            {"key": "grocery", "name_ar": "بقالة", "name_en": "Grocery", "icon": "..."}
        ],
        "governorates": [ ... ],
        "cities": [ ... ],
        "user_phone": "...",
        "user_governorate_id": 1,
        "user_city_id": 1
    }
}
```

---

## 13.2 Create Store
**POST** `/store/setup`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Store name |
| store_type | string | Yes | Store type key |
| address | string | Yes | Address |
| latitude | float | Yes | Latitude |
| longitude | float | Yes | Longitude |
| governorate_id | int | Yes | Governorate ID |
| city_id | int | Yes | City ID |
| phone | string | No | Phone number |
| logo | file | No | Store logo |

---

## 13.3 Get Store Details
**GET** `/store/details`

---

## 13.4 Update Store Details
**PUT** `/store/details`

---

## 13.5 Get Working Hours
**GET** `/store/working-hours`

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "day_of_week": "sunday",
            "opening_time": "08:00",
            "closing_time": "22:00",
            "is_closed": false
        },
        ...
    ]
}
```

---

## 13.6 Update Working Hours
**PUT** `/store/working-hours`

**Request Body:**
```json
{
    "working_hours": [
        {
            "day_of_week": "sunday",
            "is_closed": false,
            "opening_time": "08:00",
            "closing_time": "22:00"
        },
        {
            "day_of_week": "friday",
            "is_closed": true,
            "opening_time": null,
            "closing_time": null
        },
        ...
    ]
}
```

---

## 13.7 Get Store Products
**GET** `/store/products`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category_id | int | No | Filter by category |
| search | string | No | Search in name |
| available | bool | No | Filter by availability |
| per_page | int | No | Items per page |

---

## 13.8 Add Product
**POST** `/store/products`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| category_id | int | Yes | Category ID |
| price | float | Yes | Price |
| discount_price | float | No | Discount price |
| unit | string | No | Unit (piece, kg, etc.) |
| description | string | No | Description |
| image | file | No | Product image |
| is_available | bool | No | Availability (default: true) |

---

## 13.9 Update Product
**PUT** `/store/products/{product_id}`

---

## 13.10 Delete Product
**DELETE** `/store/products/{product_id}`

---

## 13.11 Get Categories for Products
**GET** `/store/categories`

---

## 13.12 Get Store Orders
**GET** `/store/orders`

**Response:**
```json
{
    "success": true,
    "data": {
        "pending_orders": [ ... ],
        "preparing_orders": [ ... ],
        "ready_orders": [ ... ],
        "completed_orders": [ ... ]
    }
}
```

---

## 13.13 Get Order Details
**GET** `/store/orders/{order_store_id}`

---

## 13.14 Approve Order
**POST** `/store/orders/{order_store_id}/approve`

---

## 13.15 Reject Order
**POST** `/store/orders/{order_store_id}/reject`

---

## 13.16 Start Preparing Order
**POST** `/store/orders/{order_store_id}/start-preparing`

---

## 13.17 Finish Preparing Order
**POST** `/store/orders/{order_store_id}/finish-preparing`

---

## 13.18 Get Store Statistics
**GET** `/store/statistics`

**Response:**
```json
{
    "success": true,
    "data": {
        "today": {
            "orders": 10,
            "completed_orders": 8,
            "revenue": 500.00
        },
        "this_week": { ... },
        "this_month": { ... },
        "total": {
            "orders": 1000,
            "completed_orders": 950,
            "revenue": 50000.00,
            "products": 100,
            "available_products": 95
        },
        "pending_orders": 2,
        "preparing_orders": 3
    }
}
```

---

# 14. Location Data

## 14.1 Get Governorates
**GET** `/governorates`

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name_ar": "رام الله والبيرة",
            "name_en": "Ramallah & Al-Bireh"
        }
    ]
}
```

---

## 14.2 Get Cities
**GET** `/cities`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| governorate_id | int | No | Filter by governorate |

---

## 14.3 Get Areas
**GET** `/areas`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| governorate_id | int | No | Filter by governorate |

---

# 📊 Order Status Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ORDER STATUS FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Customer creates order                                             │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────────┐                                           │
│  │ pending_driver_     │◄──────── Driver can see available orders │
│  │ approval            │                                           │
│  └─────────┬───────────┘                                           │
│            │                                                        │
│            ▼ Driver accepts                                         │
│  ┌─────────────────────┐                                           │
│  │ driver_accepted     │──────────► Stores receive orders          │
│  └─────────┬───────────┘                                           │
│            │                                                        │
│            ▼ Store approves                                         │
│  ┌─────────────────────┐                                           │
│  │ pending_store_      │                                           │
│  │ approval            │                                           │
│  └─────────┬───────────┘                                           │
│            │                                                        │
│            ▼ Store starts preparing                                 │
│  ┌─────────────────────┐                                           │
│  │ store_preparing     │                                           │
│  └─────────┬───────────┘                                           │
│            │                                                        │
│            ▼ Store finishes                                         │
│  ┌─────────────────────┐                                           │
│  │ ready_for_delivery  │                                           │
│  └─────────┬───────────┘                                           │
│            │                                                        │
│            ▼ Driver picks up                                        │
│  ┌─────────────────────┐                                           │
│  │ driver_picked_up    │                                           │
│  └─────────┬───────────┘                                           │
│            │                                                        │
│            ▼ Driver starts delivery                                 │
│  ┌─────────────────────┐                                           │
│  │ out_for_delivery    │                                           │
│  └─────────┬───────────┘                                           │
│            │                                                        │
│            ▼ Driver delivers                                        │
│  ┌─────────────────────┐                                           │
│  │ delivered           │  ✅ Order completed!                      │
│  └─────────────────────┘                                           │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  Possible Rejection States:                                         │
│  • driver_rejected   - Driver rejected the order                   │
│  • store_rejected    - Store rejected the order                    │
│  • cancelled         - Customer cancelled the order                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# 🔑 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - No/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

# 📝 Notes

1. **Language Support**: Send `Accept-Language: ar` or `Accept-Language: en` header for localized responses.

2. **Pagination**: Most list endpoints support pagination with `per_page` and return pagination metadata.

3. **File Uploads**: Use `multipart/form-data` for endpoints that accept file uploads.

4. **Timestamps**: All timestamps are in ISO 8601 format.

5. **Currency**: All prices are in the default currency (configured in settings).

---

# 📱 Mobile App Integration Tips

1. **Token Storage**: Store the Bearer token securely (e.g., Keychain on iOS, EncryptedSharedPreferences on Android).

2. **Push Notifications**: Subscribe to push notifications after login using the `/notifications/subscribe` endpoint.

3. **Real-time Updates**: For order tracking, poll the `/orders/{id}/track` endpoint or implement WebSocket support.

4. **Offline Support**: Cache categories, products, and user favorites for offline browsing.

5. **Image Caching**: All image URLs are absolute - implement proper image caching.

---

*Last Updated: November 2024*
