import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import { useGetCategoriesQuery } from '../store/slices/productsSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2;

const CategoriesPage = ({ onBack, onCategoryPress }) => {
  const { t, isRTL } = useLanguage();
  
  const { data: categoriesData, isLoading, error, refetch } = useGetCategoriesQuery();
  
  const categories = categoriesData?.data || [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={additionalColors.text} />
        </TouchableOpacity>
        <CustomText variant="h2" style={styles.headerTitle}>
          {t('categories')}
        </CustomText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={60} color={additionalColors.error} />
            <CustomText variant="h4" style={styles.errorText}>
              {t('failed_to_load_categories')}
            </CustomText>
            <TouchableOpacity onPress={refetch} style={styles.retryButton}>
              <CustomText variant="body" color={colors.primary}>
                {t('retry')}
              </CustomText>
            </TouchableOpacity>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="grid-outline" size={60} color={additionalColors.textLight} />
            <CustomText variant="h4" style={styles.emptyText}>
              {t('no_categories')}
            </CustomText>
          </View>
        ) : (
          <View style={styles.grid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => onCategoryPress && onCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryImageContainer}>
                  {category.image ? (
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
                  ) : category.icon ? (
                    <CustomText style={styles.categoryIcon}>{category.icon}</CustomText>
                  ) : (
                    <Ionicons name="grid-outline" size={40} color={colors.primary} />
                  )}
                </View>
                <View style={styles.categoryInfo}>
                  <CustomText variant="body" style={styles.categoryName} numberOfLines={2}>
                    {category.name}
                  </CustomText>
                  {category.products_count !== undefined && (
                    <CustomText variant="caption" color={additionalColors.textLight}>
                      {category.products_count} {t('products')}
                    </CustomText>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Cairo-Bold',
  },
  headerRight: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    textAlign: 'center',
    color: additionalColors.textLight,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: additionalColors.border,
    overflow: 'hidden',
  },
  categoryImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryIcon: {
    fontSize: 40,
  },
  categoryInfo: {
    padding: 12,
  },
  categoryName: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 4,
  },
});

export default CategoriesPage;

