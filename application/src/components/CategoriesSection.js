import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { useGetCategoriesQuery, useGetProductsByCategoryQuery } from '../store/slices/productsSlice';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from './CustomText';
import CustomButton from './CustomButton';
import ProductCard from './ProductCard';
import Container from './Container';

const CategoriesSection = ({ onViewAll, onCategoryPress }) => {
  const { t, isRTL } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();

  const categories = categoriesData?.data || [];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  if (categoriesLoading) {
    return (
      <Container style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </Container>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <Container style={styles.container}>
        {categories.slice(0, 5).map((category) => (
          <CategoryWithProducts
            key={`category-${category.id}`}
            category={category}
            onViewAll={() => onCategoryPress && onCategoryPress(category)}
            onProductPress={(productId) => {
              // Navigate to product details
            }}
          />
        ))}

        {categories.length > 5 && (
          <View style={[styles.viewAllContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <CustomButton
              variant="outline"
              onPress={onViewAll}
              style={styles.viewAllButton}
            >
              <CustomText variant="body" color={colors.primary}>
                {t('viewAllCategories')}
              </CustomText>
            </CustomButton>
          </View>
        )}
      </Container>
    </Animated.View>
  );
};

const CategoryWithProducts = ({ category, onViewAll, onProductPress }) => {
  const { t, isRTL } = useLanguage();
  const { data: productsData, isLoading } = useGetProductsByCategoryQuery(category.id);
  const products = productsData?.data?.data || [];

  if (isLoading) {
    return (
      <View style={styles.categoryContainer}>
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <CustomText variant="h2" color={colors.primary} style={styles.title}>
            {category.name}
          </CustomText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <View style={styles.categoryContainer}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <CustomText variant="h2" color={colors.primary} style={styles.title}>
          {category.name}
        </CustomText>
        <CustomButton
          variant="text"
          onPress={onViewAll}
          style={styles.viewAllButton}
        >
          <CustomText variant="body" color={colors.primary}>
            {t('viewAllProducts')}
          </CustomText>
        </CustomButton>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {products.map((product, index) => {
          return (
            <View key={`product-${product.id}-${index}`} style={{ marginRight: 16 }}>
              <ProductCard
                product={product}
                index={index}
                onPress={() => onProductPress && onProductPress(product.id)}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  categoryContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  viewAllButton: {
    padding: 0,
    minHeight: 'auto',
  },
  scrollView: {
    marginHorizontal: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  viewAllContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoriesSection;
