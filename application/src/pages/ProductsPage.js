import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useGetProductsQuery, useGetCategoriesQuery } from '../store/slices/productsSlice';
import { useGetGovernoratesQuery, useGetCitiesQuery } from '../store/slices/locationSlice';
import { setProductFilters, clearProductFilters, setSelectedCategoryId } from '../store/slices/productsSlice';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import SearchBar from '../components/SearchBar';
import FilterModal from '../components/FilterModal';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const { t, isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const { filters, sortBy, sortOrder, selectedCategoryId } = useAppSelector((state) => state.products);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [page, setPage] = useState(1);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build query params
  const queryParams = {
    page,
    per_page: 20,
    sort_by: sortBy,
    sort_order: sortOrder,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCategoryId && { category_id: selectedCategoryId }),
    ...(filters.governorate_id && { governorate_id: filters.governorate_id }),
    ...(filters.city_id && { city_id: filters.city_id }),
    ...(filters.store_id && { store_id: filters.store_id }),
  };

  // Fetch products
  const {
    data: productsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery(queryParams);

  // Fetch filter options
  const { data: governoratesData } = useGetGovernoratesQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: citiesData } = useGetCitiesQuery(filters.governorate_id || null);

  const products = productsData?.data?.data || [];
  const totalProducts = productsData?.data?.total || 0;
  const governorates = governoratesData?.data || [];
  const categories = categoriesData?.data || [];
  const cities = citiesData?.data || [];

  const handleFilterChange = (newFilters) => {
    dispatch(setProductFilters(newFilters));
    if (newFilters.category_id !== undefined) {
      dispatch(setSelectedCategoryId(newFilters.category_id));
    }
    setPage(1);
  };

  const handleClearFilters = () => {
    dispatch(clearProductFilters());
    dispatch(setSelectedCategoryId(null));
    setPage(1);
  };

  const handleRefresh = () => {
    setPage(1);
    refetch();
  };

  const handleLoadMore = () => {
    if (productsData?.data?.next_page_url && !isFetching) {
      setPage(page + 1);
    }
  };

  const handleCategorySelect = (categoryId) => {
    dispatch(setSelectedCategoryId(selectedCategoryId === categoryId ? null : categoryId));
    setPage(1);
  };

  const activeFiltersCount = [
    filters.governorate_id,
    filters.city_id,
  ].filter(Boolean).length;

  const renderProduct = ({ item, index }) => {
    const product = { ...item };
    return (
      <View style={styles.productWrapper}>
        <ProductCard product={product} index={index} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="cube-outline" size={48} color={additionalColors.textLight} />
        </View>
        <CustomText variant="h3" color={additionalColors.textLight} style={styles.emptyTitle}>
          {t('noProductsFound')}
        </CustomText>
        <CustomText variant="body" color={additionalColors.textLight} style={styles.emptySubtitle}>
          {debouncedSearch || selectedCategoryId ? t('try_different_search') : ''}
        </CustomText>
      </View>
    );
  };

  const ListHeader = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Page Title */}
      <View style={styles.titleSection}>
        <LinearGradient
          colors={['#e85a1f', '#f07a32', '#f5923e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleGradient}
        >
          <View style={styles.titleContent}>
            <Ionicons name="cube" size={28} color={colors.background} />
            <CustomText variant="h2" color={colors.background} style={styles.pageTitle}>
              {t('products')}
            </CustomText>
          </View>
        </LinearGradient>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchSection}>
        <View style={[styles.searchRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.searchBarWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('searchProducts')}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFiltersCount > 0 && styles.filterButtonActive
            ]}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons
              name="filter"
              size={20}
              color={activeFiltersCount > 0 ? colors.background : colors.primary}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <CustomText variant="small" color={colors.background} style={styles.filterBadgeText}>
                  {activeFiltersCount}
                </CustomText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.categoriesSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategoryId && styles.categoryChipActive
              ]}
              onPress={() => handleCategorySelect(null)}
            >
              <Ionicons 
                name="apps" 
                size={16} 
                color={!selectedCategoryId ? colors.background : additionalColors.text} 
              />
              <CustomText 
                variant="body" 
                color={!selectedCategoryId ? colors.background : additionalColors.text}
                style={styles.categoryChipText}
              >
                {t('allCategories')}
              </CustomText>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategoryId === cat.id && styles.categoryChipActive
                ]}
                onPress={() => handleCategorySelect(cat.id)}
              >
                <CustomText
                  variant="body"
                  color={selectedCategoryId === cat.id ? colors.background : additionalColors.text}
                >
                  {isRTL ? cat.name_ar || cat.name : cat.name_en || cat.name}
                </CustomText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Count */}
      <View style={[styles.resultsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <CustomText variant="h3" color={additionalColors.text}>
          {t('products')}
        </CustomText>
        <View style={styles.resultsCountBadge}>
          <CustomText variant="body" color={colors.primary}>
            {`${totalProducts} ${t('results')}`}
          </CustomText>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && page === 1}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : <View style={styles.bottomSpacing} />
        }
      />

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
        categories={categories}
        governorates={governorates}
        areas={cities}
        cities={cities}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  listContent: {
    flexGrow: 1,
  },

  // Title Section
  titleSection: {
    marginBottom: 16,
  },
  titleGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  titleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageTitle: {
    letterSpacing: 0.5,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBarWrapper: {
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: additionalColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: additionalColors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Categories Section
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: additionalColors.border,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    marginLeft: 4,
  },

  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsCountBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  // Products
  productWrapper: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: additionalColors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },

  // Footer
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProductsPage;

