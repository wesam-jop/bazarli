# Components

هذا المجلد يحتوي على المكونات القابلة لإعادة الاستخدام.

## المكونات المتوفرة

### Button
مكون زر قابل للتخصيص مع حالات مختلفة.

```jsx
import Button from './components/Button';

<Button
  title="اضغط هنا"
  onPress={() => console.log('Pressed')}
  variant="primary"
/>
```

**Props:**
- `title` (string) - نص الزر
- `onPress` (function) - دالة عند الضغط
- `variant` ('primary' | 'secondary' | 'outline') - نوع الزر
- `loading` (boolean) - حالة التحميل
- `disabled` (boolean) - تعطيل الزر
- `className` (string) - كلاسات Tailwind إضافية

