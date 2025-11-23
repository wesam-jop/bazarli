# Screens

هذا المجلد يحتوي على شاشات التطبيق.

## الشاشات المتوفرة

### HomeScreen
الشاشة الرئيسية للتطبيق.

## إضافة شاشة جديدة

1. أنشئ ملف جديد في هذا المجلد
2. استورد الشاشة في `src/navigation/AppNavigator.js`
3. أضفها إلى Stack Navigator

```jsx
import { View, Text } from 'react-native';

export default function MyScreen() {
  return (
    <View className="flex-1 bg-white">
      <Text>My Screen</Text>
    </View>
  );
}
```

