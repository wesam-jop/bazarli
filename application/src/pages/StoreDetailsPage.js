import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useGetStoreQuery, useGetStoreProductsQuery } from '../store/slices/storesSlice';
import { useGetCategoriesQuery } from '../store/slices/productsSlice';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 220;

const StoreDetailsPage = ({ storeId, onBack }) => {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Fetch store details
  const {
    data: storeData,
    isLoading: storeLoading,
    refetch: refetchStore,
  } = useGetStoreQuery(storeId, {
    skip: !storeId,
  });

  const store = storeData?.data || {};

  // Build query params for products
  const queryParams = {
    storeId,
    page,
    per_page: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCategory && { category_id: selectedCategory }),
  };

  // Fetch store products
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching,
    refetch: refetchProducts,
  } = useGetStoreProductsQuery(queryParams, {
    skip: !storeId,
  });

  // Fetch categories for filter
  const { data: categoriesData } = useGetCategoriesQuery();

  const products = productsData?.data?.data || [];
  const categories = categoriesData?.data || [];
  const totalProducts = productsData?.data?.total || 0;

  const handleRefresh = () => {
    refetchStore();
    refetchProducts();
  };

  const isLoading = storeLoading || productsLoading;

  // Check if store is open
  const isStoreOpen = () => {
    if (store?.is_active === false) return false;
    if (!store?.opening_time || !store?.closing_time) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = store.opening_time.split(':').map(Number);
    const [closeH, closeM] = store.closing_time.split(':').map(Number);
    const openingMinutes = openH * 60 + openM;
    const closingMinutes = closeH * 60 + closeM;
    
    return currentTime >= openingMinutes && currentTime <= closingMinutes;
  };

  // Header opacity animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderProduct = ({ item, index }) => {
    const productCopy = { ...item };
    return (
      <View style={styles.productWrapper}>
        <ProductCard product={productCopy} index={index} />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.headerGradient}
        >
          <TouchableOpacity 
            onPress={onBack} 
            style={styles.headerBackButton}
          >
            <Ionicons 
              name={isRTL ? "arrow-forward" : "arrow-back"} 
              size={24} 
              color={colors.background} 
            />
          </TouchableOpacity>
          <CustomText variant="h3" color={colors.background} style={styles.headerTitle} numberOfLines={1}>
            {store.name}
          </CustomText>
          <View style={styles.headerSpacer} />
        </LinearGradient>
      </Animated.View>

      {/* Fixed Back Button (for hero) */}
      <TouchableOpacity 
        onPress={onBack} 
        style={styles.floatingBackButton}
      >
        <View style={styles.backButtonCircle}>
          <Ionicons 
            name={isRTL ? "arrow-forward" : "arrow-back"} 
            size={22} 
            color={colors.primary} 
          />
        </View>
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={isFetching} 
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#e85a1f', '#f07a32', '#f5923e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            {/* Decorative circles */}
            <View style={[styles.decorCircle, styles.decorCircle1]} />
            <View style={[styles.decorCircle, styles.decorCircle2]} />
          </LinearGradient>
        </View>

        {/* Store Info Card */}
        <Animated.View style={[styles.storeCard, { opacity: fadeAnim }]}>
          {/* Store Logo */}
          <View style={styles.logoContainer}>
            {store.logo_path || store.image ? (
              <Image
                source={{ uri: store.logo_path || store.image }}
                style={styles.storeLogo}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <CustomText variant="h1" color={colors.primary} style={styles.logoText}>
                  {store.name ? store.name.charAt(0) : '?'}
                </CustomText>
              </View>
            )}
            {/* Status Badge */}
            <View style={[
              styles.statusBadge, 
              isStoreOpen() ? styles.statusOpen : styles.statusClosed
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isStoreOpen() ? additionalColors.success : additionalColors.error }
              ]} />
              <CustomText 
                variant="small" 
                color={isStoreOpen() ? additionalColors.success : additionalColors.error}
                style={styles.statusText}
              >
                {isStoreOpen() ? t('open') : t('closed')}
              </CustomText>
            </View>
          </View>

          {/* Store Name & Type */}
          <CustomText variant="h1" color={additionalColors.text} style={styles.storeName}>
            {store.name}
          </CustomText>
          
          {store.store_type_label && (
            <View style={styles.categoryChip}>
              <Ionicons name="pricetag" size={14} color={colors.primary} />
              <CustomText variant="body" color={colors.primary} style={styles.categoryText}>
                {store.store_type_label}
              </CustomText>
            </View>
          )}

          {/* Store Details */}
          <View style={styles.detailsContainer}>
            {/* Location */}
            {(store.city?.name || store.governorate?.name) && (
              <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.detailIcon}>
                  <Ionicons name="location" size={18} color={colors.primary} />
                </View>
                <CustomText variant="body" color={additionalColors.textSecondary} style={styles.detailText}>
                  {store.city?.name && store.governorate?.name
                    ? `${store.city.name}، ${store.governorate.name}`
                    : store.city?.name || store.governorate?.name}
                </CustomText>
              </View>
            )}

            {/* Phone */}
            {store.phone && (
              <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.detailIcon}>
                  <Ionicons name="call" size={18} color={colors.primary} />
                </View>
                <CustomText variant="body" color={additionalColors.textSecondary} style={styles.detailText}>
                  {store.phone}
                </CustomText>
              </View>
            )}

            {/* Working Hours */}
            {store.opening_time && store.closing_time && (
              <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.detailIcon}>
                  <Ionicons name="time" size={18} color={colors.primary} />
                </View>
                <CustomText variant="body" color={additionalColors.textSecondary} style={styles.detailText}>
                  {store.opening_time} - {store.closing_time}
                </CustomText>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <CustomText variant="h2" color={colors.primary} style={styles.statNumber}>
                {totalProducts}
              </CustomText>
              <CustomText variant="small" color={additionalColors.textLight}>
                {t('products')}
              </CustomText>
            </View>
            {store.rating && (
              <View style={styles.statItem}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={18} color="#FFD700" />
                  <CustomText variant="h2" color={colors.primary} style={styles.statNumber}>
                    {store.rating}
                  </CustomText>
                </View>
                <CustomText variant="small" color={additionalColors.textLight}>
                  التقييم
                </CustomText>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={[styles.searchRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.searchBarWrapper}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('searchProducts')}
              />
            </View>
          </View>

          {/* Categories Filter */}
          {categories.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
              style={styles.categoriesContainer}
            >
              <TouchableOpacity
                style={[
                  styles.categoryFilterChip,
                  !selectedCategory && styles.categoryFilterChipActive
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <CustomText 
                  variant="body" 
                  color={!selectedCategory ? colors.background : additionalColors.text}
                >
                  {t('allCategories')}
                </CustomText>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryFilterChip,
                    selectedCategory === cat.id && styles.categoryFilterChipActive
                  ]}
                  onPress={() => setSelectedCategory(
                    selectedCategory === cat.id ? null : cat.id
                  )}
                >
                  <CustomText 
                    variant="body" 
                    color={selectedCategory === cat.id ? colors.background : additionalColors.text}
                  >
                    {isRTL ? cat.name_ar || cat.name : cat.name_en || cat.name}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Products Section */}
        <View style={styles.productsSection}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <CustomText variant="h2" color={additionalColors.text}>
              {t('products')}
            </CustomText>
            <View style={styles.productsCount}>
              <CustomText variant="body" color={colors.primary}>
                {`${totalProducts} ${t('results')}`}
              </CustomText>
            </View>
          </View>

          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={48} color={additionalColors.textLight} />
              </View>
              <CustomText variant="h3" color={additionalColors.textLight} style={styles.emptyTitle}>
                {t('noProductsFound')}
              </CustomText>
              <CustomText variant="body" color={additionalColors.textLight} style={styles.emptySubtitle}>
                {searchQuery ? t('try_different_search') : ''}
              </CustomText>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.map((item, index) => (
                <View key={item.id} style={styles.productWrapper}>
                  <ProductCard product={{ ...item }} index={index} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  // Animated Header
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },

  // Floating Back Button
  floatingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 16,
    zIndex: 50,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  scrollView: {
    flex: 1,
  },

  // Hero Section
  heroSection: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroGradient: {
    flex: 1,
    position: 'relative',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -30,
  },
  decorCircle2: {
    width: 150,
    height: 150,
    bottom: -40,
    left: -30,
  },

  // Store Card
  storeCard: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginTop: -80,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  storeLogo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: colors.background,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.background,
  },
  logoText: {
    fontSize: 40,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -35 }],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusOpen: {
    backgroundColor: `${additionalColors.success}15`,
    borderWidth: 1,
    borderColor: `${additionalColors.success}30`,
  },
  statusClosed: {
    backgroundColor: `${additionalColors.error}15`,
    borderWidth: 1,
    borderColor: `${additionalColors.error}30`,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: '600',
  },
  storeName: {
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  categoryText: {
    fontWeight: '500',
  },

  // Store Details
  detailsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: additionalColors.border,
    paddingTop: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    flex: 1,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: additionalColors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBarWrapper: {
    flex: 1,
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesScroll: {
    gap: 10,
    paddingRight: 16,
  },
  categoryFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  categoryFilterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Products Section
  productsSection: {
    padding: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsCount: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  productsGrid: {
    flexDirection: 'column',
  },
  productWrapper: {
    width: '100%',
    marginBottom: 16,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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

  bottomSpacing: {
    height: 40,
  },
});

export default StoreDetailsPage;
