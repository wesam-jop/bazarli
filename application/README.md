# Bazarli Mobile Application

تطبيق موبايل لموقع بازارلي مبني بـ React Native و Expo و Tailwind CSS (NativeWind).

## المميزات

- ✅ React Native + Expo
- ✅ Tailwind CSS (NativeWind)
- ✅ Navigation (React Navigation)
- ✅ API Service جاهز
- ✅ Storage Service (AsyncStorage)
- ✅ بنية مشروع منظمة

## البنية

```
application/
├── src/
│   ├── screens/          # شاشات التطبيق
│   ├── components/       # المكونات القابلة لإعادة الاستخدام
│   ├── navigation/       # إعدادات التنقل
│   ├── services/         # خدمات API
│   ├── utils/            # أدوات مساعدة
│   └── constants/        # الثوابت والإعدادات
├── assets/               # الصور والموارد
├── App.js               # نقطة البداية
├── babel.config.js      # إعدادات Babel
├── tailwind.config.js   # إعدادات Tailwind
└── metro.config.js      # إعدادات Metro
```

## التثبيت والتشغيل

### 1. تثبيت الحزم
```bash
npm install
```

### 2. تشغيل التطبيق

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Web
```bash
npm run web
```

#### Development Server
```bash
npm start
```

## الإعدادات

### API Configuration
عدّل ملف `src/constants/config.js` لتغيير رابط API:
```javascript
export const API_BASE_URL = 'http://your-api-url.com/api';
```

## الملفات الأساسية

- `App.js` - نقطة البداية الرئيسية
- `src/navigation/AppNavigator.js` - إعدادات التنقل
- `src/services/api.js` - خدمة API
- `src/utils/storage.js` - خدمة التخزين المحلي
- `src/constants/config.js` - الإعدادات والثوابت

## استخدام Tailwind CSS

```jsx
import { View, Text } from 'react-native';

export default function MyComponent() {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-purple-600">
        Hello World
      </Text>
    </View>
  );
}
```

## ملاحظات

- تأكد من تحديث `API_BASE_URL` في `src/constants/config.js`
- استخدم `src/services/api.js` لجميع طلبات API
- استخدم `src/utils/storage.js` لحفظ البيانات محلياً

## الخطوات التالية

1. تصميم الشاشات الأساسية (Home, Products, Cart, Orders, etc.)
2. إعداد Authentication
3. ربط التطبيق مع API
4. إضافة المزيد من المكونات

