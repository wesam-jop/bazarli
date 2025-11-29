import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useGetStoresQuery } from '../store/slices/storesSlice';
import { useGetGovernoratesQuery, useGetCitiesQuery } from '../store/slices/locationSlice';
import { useGetCategoriesQuery } from '../store/slices/productsSlice';
import { setFilters, clearFilters } from '../store/slices/storesSlice';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import SearchBar from '../components/SearchBar';
import FilterModal from '../components/FilterModal';
import StoreCard from '../components/StoreCard';

const StoresPage = ({ onStorePress }) => {
  const { t, isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.stores);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [page, setPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build query params
  const queryParams = {
    page,
    per_page: 20,
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    ...(filters.category_id && { category_id: filters.category_id }),
    ...(filters.governorate_id && { governorate_id: filters.governorate_id }),
    ...(filters.city_id && { city_id: filters.city_id }),
  };

  // Fetch stores
  const {
    data: storesData,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetStoresQuery(queryParams, {
    skip: false,
  });

  // Fetch filter options
  const { data: governoratesData } = useGetGovernoratesQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: citiesData } = useGetCitiesQuery(filters.governorate_id || null);

  const stores = storesData?.data?.data || [];
  const governorates = governoratesData?.data || [];
  const categories = categoriesData?.data || [];
  const cities = citiesData?.data || [];

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    setPage(1);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setPage(1);
  };

  const handleRefresh = () => {
    setPage(1);
    refetch();
  };


  const handleLoadMore = () => {
    if (storesData?.data?.next_page_url && !isFetching) {
      setPage(page + 1);
    }
  };

  const renderStore = ({ item, index }) => {
    // Create fresh copy to avoid frozen object issues
    const store = { ...item };
    return (
      <StoreCard
        store={store}
        index={index}
        fullWidth={true}
        onPress={onStorePress ? () => onStorePress(store.id) : undefined}
      />
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
        <Ionicons name="storefront-outline" size={64} color={additionalColors.textLight} />
        <CustomText variant="h3" color={additionalColors.textLight} style={styles.emptyText}>
          {t('noStoresFound')}
        </CustomText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.searchBarContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('searchStores')}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }
            ]}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <Ionicons 
              name="filter" 
              size={20} 
              color={filters.category_id || filters.governorate_id || filters.city_id ? colors.primary : additionalColors.text} 
            />
            {(filters.category_id || filters.governorate_id || filters.city_id) && (
              <View style={styles.filterBadge}>
                <CustomText variant="small" color={colors.background} style={styles.filterBadgeText}>
                  {[filters.category_id, filters.governorate_id, filters.city_id].filter(Boolean).length}
                </CustomText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={stores}
          renderItem={renderStore}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          style={styles.list}
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
            ) : null
          }
        />
      </View>

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
        categories={categories}
        governorates={governorates}
        cities={cities}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  searchBarContainer: {
    flex: 1,
    minWidth: 0,
  },
  list: {
    flex: 1,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: additionalColors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
  },
});

export default StoresPage;
