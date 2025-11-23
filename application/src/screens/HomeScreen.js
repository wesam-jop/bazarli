import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بك في بازارلي
          </Text>
          <Text className="text-gray-600 mb-6">
            تسوق بسهولة واحصل على توصيل سريع
          </Text>
          
          {/* Categories Section */}
          <View className="mb-6">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              الفئات
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {[1, 2, 3, 4].map((item) => (
                <View
                  key={item}
                  className="w-[48%] bg-purple-50 rounded-xl p-4 border border-purple-100"
                >
                  <Text className="text-purple-700 font-semibold">
                    فئة {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Products Section */}
          <View>
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              المنتجات المميزة
            </Text>
            <View className="gap-4">
              {[1, 2, 3].map((item) => (
                <View
                  key={item}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                >
                  <Text className="text-gray-900 font-semibold mb-2">
                    منتج {item}
                  </Text>
                  <Text className="text-purple-600 font-bold">
                    1000 SYP
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

