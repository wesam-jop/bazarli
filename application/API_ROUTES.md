# 📍 API Routes المستخدمة في التطبيق

## 🔗 Base URL
```
http://localhost:8000/api/v1
```

**ملاحظة:** يجب تحديث BASE_URL في:
- `src/store/api.js` (سطر 5)
- `src/services/api.js` (سطر 5)

---

## 🔐 Authentication Routes (Public)

### 1. Register - إنشاء حساب
```
POST /api/v1/register
```
**يستخدم في:** `RegisterPage.js`

### 2. Login - تسجيل الدخول
```
POST /api/v1/login
```
**يستخدم في:** `LoginPage.js`

### 3. Verify Phone - التحقق من الهاتف
```
POST /api/v1/verify-phone
Body: { phone, code }
```
**يستخدم في:** `OTPVerificationPage.js`

### 4. Resend Verification - إعادة إرسال الرمز
```
POST /api/v1/resend-verification
Body: { phone }
```
**يستخدم في:** `OTPVerificationPage.js`

---

## ⚙️ Settings Routes (Public)

### 1. Get App Settings
```
GET /api/v1/settings
```
**Response:**
```json
{
  "success": true,
  "data": {
    "app_name": "DeliGo",
    "app_description": "",
    "app_logo": "",
    "app_version": "1.0.0",
    "default_language": "ar",
    "default_currency": "SYP",
    "currency_symbol": "ل.س",
    "min_order_amount": 0,
    "default_delivery_fee": 0,
    "default_estimated_delivery_time": 15,
    "maintenance_mode": false,
    "maintenance_message": "",
    "payment_methods": [],
    "support_phone": "",
    "support_email": ""
  }
}
```
**يستخدم في:**
- `App.js` (useGetSettingsQuery - جلب الإعدادات عند بدء التطبيق)
- `Header.js` (useGetSettingsQuery - عرض اسم التطبيق)

---

## 👤 User Routes (Protected - auth:sanctum)

### 5. Get User - بيانات المستخدم
```
GET /api/v1/user
```
**يستخدم في:** `App.js` (loadUser)

### 6. Logout - تسجيل الخروج
```
POST /api/v1/logout
```
**يستخدم في:** جميع صفحات Dashboard

---

## 👤 Profile Routes (Protected)

### 7. Get Profile
```
GET /api/v1/profile
```
**يستخدم في:** Profile pages

### 8. Update Profile
```
PUT /api/v1/profile
```
**يستخدم في:** Profile pages

### 9. Change Password
```
POST /api/v1/profile/change-password
```
**يستخدم في:** Profile pages

---

## 🏪 Stores Routes

### 10. Get Stores (Public)
```
GET /api/v1/stores
Query Params:
  - search: البحث بالاسم
  - category_id: فلترة حسب الفئة
  - governorate_id: فلترة حسب المحافظة
  - city_id: فلترة حسب المدينة
  - store_type: فلترة حسب نوع المتجر
  - latitude, longitude, radius: البحث الجغرافي
  - sort_by: ترتيب (created_at, name, orders_count, products_count)
  - sort_order: asc/desc
  - per_page: عدد العناصر (افتراضي: 20)
  - page: رقم الصفحة
```
**يستخدم في:** 
- `StoresPage.js` (useGetStoresQuery)
- `StoresSection.js` (useGetStoresQuery)

### 11. Get Store Details (Public)
```
GET /api/v1/stores/{id}
```
**يستخدم في:** Store details page

### 12. Get Store Products (Public)
```
GET /api/v1/stores/{id}/products
Query Params:
  - category_id: فلترة حسب الفئة
  - search: البحث
  - per_page, page: Pagination
```
**يستخدم في:** `StoreController.js` (useGetStoreProductsQuery)

---

## 📦 Products Routes

### 13. Get Products (Public)
```
GET /api/v1/products
Query Params:
  - search: البحث بالاسم أو الوصف
  - category_id: فلترة حسب الفئة
  - store_id: فلترة حسب المتجر
  - governorate_id: فلترة حسب المحافظة (من خلال المتجر)
  - city_id: فلترة حسب المدينة (من خلال المتجر)
  - featured: true/false (المنتجات المميزة فقط)
  - sort_by: sort_order, name, price, created_at, sales_count
  - sort_order: asc/desc
  - per_page, page: Pagination
```
**يستخدم في:**
- `ProductsPage.js` (useGetProductsQuery)
- `ProductsSection.js` (useGetProductsQuery)

### 14. Get Product Details (Public)
```
GET /api/v1/products/{id}
```
**يستخدم في:** Product details page

---

## 📋 Categories Routes (Public)

### 15. Get Categories
```
GET /api/v1/categories
```
**يستخدم في:**
- `StoresPage.js` (useGetCategoriesQuery)
- `ProductsPage.js` (useGetCategoriesQuery)
- FilterModal

### 16. Get Category Details
```
GET /api/v1/categories/{id}
```
**يستخدم في:** Category details page

---

## 📍 Location Routes (Public)

### 17. Get Governorates
```
GET /api/v1/governorates
```
**يستخدم في:**
- `StoresPage.js` (useGetGovernoratesQuery)
- `ProductsPage.js` (useGetGovernoratesQuery)
- FilterModal

### 18. Get Cities
```
GET /api/v1/cities?governorate_id={id}
```
**يستخدم في:**
- FilterModal
- Location selection

---

## 🛒 Cart Routes (Protected)

### 19. Get Cart
```
GET /api/v1/cart
```
**يستخدم في:** `Cart.js` (useGetCartQuery)

### 20. Get Cart Count
```
GET /api/v1/cart/count
```
**يستخدم في:** `BottomNavigation.js` (useGetCartCountQuery)

### 21. Add to Cart
```
POST /api/v1/cart/add
Body: { product_id, quantity }
```
**يستخدم في:** `ProductCard.js` (useAddToCartMutation)

### 22. Update Cart
```
PUT /api/v1/cart/update
Body: { product_id, quantity }
```
**يستخدم في:** `Cart.js` (useUpdateCartMutation)

### 23. Remove from Cart
```
DELETE /api/v1/cart/remove/{productId}
```
**يستخدم في:** `Cart.js` (useRemoveFromCartMutation)

### 24. Clear Cart
```
DELETE /api/v1/cart/clear
```
**يستخدم في:** `Cart.js` (useClearCartMutation)

---

## 🛍️ Orders Routes (Protected)

### 25. Get User Orders
```
GET /api/v1/user/orders
Query Params:
  - status: فلترة حسب الحالة
  - per_page, page: Pagination
```
**يستخدم في:**
- `CustomerDashboard.js` (useGetUserOrdersQuery)
- Orders page

### 26. Get Order Details
```
GET /api/v1/orders/{id}
```
**يستخدم في:** Order details page

### 27. Create Order
```
POST /api/v1/orders
Body: {
  store_id,
  delivery_address,
  delivery_latitude,
  delivery_longitude,
  customer_phone,
  payment_method: 'cash' | 'card' | 'wallet',
  notes,
  items: [{ product_id, quantity }]
}
```
**يستخدم في:** `CheckoutPage.js` (useCreateOrderMutation)

### 28. Cancel Order
```
POST /api/v1/orders/{id}/cancel
```
**يستخدم في:** Order details page

### 29. Track Order
```
GET /api/v1/orders/{id}/track
```
**يستخدم في:** Order tracking page

---

## 📊 Dashboard Routes (Protected)

### 30. Customer Dashboard Stats
```
GET /api/v1/dashboard/customer
```
**يستخدم في:** `CustomerDashboard.js` (useGetCustomerStatsQuery)

### 31. Store Dashboard Stats
```
GET /api/v1/dashboard/store
```
**يستخدم في:** Store owner dashboard

### 32. Admin Dashboard Stats
```
GET /api/v1/dashboard/admin
```
**يستخدم في:** `AdminDashboard.js` (useGetAdminStatsQuery)

---

## 📍 Delivery Locations Routes (Protected)

### 33. Get Delivery Locations
```
GET /api/v1/delivery-locations
```
**يستخدم في:** `CheckoutPage.js` (useGetDeliveryLocationsQuery)

### 34. Create Delivery Location
```
POST /api/v1/delivery-locations
Body: { name, address, latitude, longitude, is_default }
```

### 35. Update Delivery Location
```
PUT /api/v1/delivery-locations/{id}
```

### 36. Delete Delivery Location
```
DELETE /api/v1/delivery-locations/{id}
```

### 37. Set Default Location
```
POST /api/v1/delivery-locations/{id}/default
```

---

## 📝 ملاحظات مهمة

### Headers المطلوبة:
- **Protected Routes:** `Authorization: Bearer {token}`
- **Language:** `Accept-Language: ar` أو `en`
- **Content-Type:** `application/json`

### Response Format:
```json
{
  "success": true,
  "data": {...},
  "message": "رسالة نجاح"
}
```

### Error Format:
```json
{
  "success": false,
  "message": "رسالة الخطأ"
}
```

---

## ⚙️ Settings Routes (Public)

### 1. Get App Settings
```
GET /api/v1/settings
```
**Response:**
```json
{
  "success": true,
  "data": {
    "app_name": "DeliGo",
    "app_description": "",
    "app_logo": "",
    "app_version": "1.0.0",
    "default_language": "ar",
    "default_currency": "SYP",
    "currency_symbol": "ل.س",
    "min_order_amount": 0,
    "default_delivery_fee": 0,
    "default_estimated_delivery_time": 15,
    "maintenance_mode": false,
    "maintenance_message": "",
    "payment_methods": [],
    "support_phone": "",
    "support_email": ""
  }
}
```
**يستخدم في:**
- `App.js` (useGetSettingsQuery - جلب الإعدادات عند بدء التطبيق)
- `Header.js` (useGetSettingsQuery - عرض اسم التطبيق)

---

## 🔄 كيف يعمل Redux مع الـ Routes

### مثال: جلب المتاجر
```javascript
// في StoresPage.js
const { data, isLoading, refetch } = useGetStoresQuery({
  search: 'متجر',
  governorate_id: 1,
  per_page: 20,
  page: 1
});

// Redux يقوم تلقائياً بـ:
// 1. إرسال GET request إلى: /api/v1/stores?search=متجر&governorate_id=1&per_page=20&page=1
// 2. إضافة Authorization header تلقائياً
// 3. إضافة Accept-Language header تلقائياً
// 4. Cache النتيجة
// 5. تحديث الواجهة تلقائياً عند تغيير البيانات
```

### مثال: إضافة منتج للسلة
```javascript
// في ProductCard.js
const [addToCart] = useAddToCartMutation();

await addToCart({ product_id: 1, quantity: 1 }).unwrap();

// Redux يقوم تلقائياً بـ:
// 1. إرسال POST request إلى: /api/v1/cart/add
// 2. Body: { product_id: 1, quantity: 1 }
// 3. إضافة Authorization header
// 4. عند النجاح: invalidate 'Cart' tag
// 5. إعادة جلب السلة تلقائياً (useGetCartQuery)
// 6. تحديث عدد المنتجات في BottomNavigation تلقائياً
```

---

## ✅ جميع الـ Routes جاهزة ومستخدمة في التطبيق!

