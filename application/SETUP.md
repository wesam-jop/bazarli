# إعداد التطبيق

## ✅ ما تم إعداده

### 1. البنية الأساسية
- ✅ React Native + Expo
- ✅ Tailwind CSS (NativeWind)
- ✅ React Navigation
- ✅ بنية مشروع منظمة

### 2. الملفات الأساسية
- ✅ `App.js` - نقطة البداية
- ✅ `babel.config.js` - إعدادات Babel
- ✅ `tailwind.config.js` - إعدادات Tailwind
- ✅ `metro.config.js` - إعدادات Metro
- ✅ `global.css` - ملف Tailwind الأساسي

### 3. المجلدات
- ✅ `src/screens/` - الشاشات
- ✅ `src/components/` - المكونات
- ✅ `src/navigation/` - التنقل
- ✅ `src/services/` - خدمات API
- ✅ `src/utils/` - الأدوات المساعدة
- ✅ `src/constants/` - الثوابت

### 4. المكونات الجاهزة
- ✅ `Button` - مكون زر قابل للتخصيص
- ✅ `HomeScreen` - شاشة رئيسية مثال

### 5. الخدمات
- ✅ `api.js` - خدمة API جاهزة
- ✅ `storage.js` - خدمة التخزين المحلي

## 🚀 التشغيل

### من المجلد الرئيسي
```bash
npm run dev:app          # تشغيل Development Server
npm run dev:app:android  # تشغيل على Android
npm run dev:app:ios      # تشغيل على iOS
npm run dev:app:web      # تشغيل على Web
```

### من مجلد application
```bash
cd application
npm start                # Development Server
npm run android          # Android
npm run ios             # iOS
npm run web             # Web
```

## 📝 الخطوات التالية

1. **تصميم الشاشات:**
   - Home Screen
   - Products Screen
   - Product Details
   - Cart Screen
   - Checkout Screen
   - Orders Screen
   - Profile Screen
   - Login/Register

2. **إعداد API:**
   - تحديث `API_BASE_URL` في `src/constants/config.js`
   - ربط التطبيق مع Laravel API

3. **إضافة المكونات:**
   - ProductCard
   - CategoryCard
   - CartItem
   - OrderCard
   - Header
   - Footer

4. **إعداد Authentication:**
   - Login Screen
   - Register Screen
   - Token Management
   - Protected Routes

## 🔧 الإعدادات

### تغيير رابط API
عدّل ملف `src/constants/config.js`:
```javascript
export const API_BASE_URL = 'http://your-api-url.com/api';
```

### إضافة شاشة جديدة
1. أنشئ ملف في `src/screens/`
2. أضفها في `src/navigation/AppNavigator.js`

## 📚 الوثائق

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [NativeWind (Tailwind)](https://www.nativewind.dev/)

