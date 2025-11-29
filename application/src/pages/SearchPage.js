import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import ProductCard from '../components/ProductCard';
import StoreCard from '../components/StoreCard';
import { apiSlice } from '../store/api';
import debounce from 'lodash/debounce';

// Add search endpoint to API
const searchApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query({
      query: (searchTerm) => `/search?query=${encodeURIComponent(searchTerm)}`,
    }),
  }),
});

const { useSearchQuery, useLazySearchQuery } = searchApiSlice;

const SearchPage = ({ onBack, onProductPress, onStorePress }) => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products'); // products, stores, categories

  const [triggerSearch, { data: searchResults, isLoading, isFetching }] = useLazySearchQuery();

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.length >= 2) {
        triggerSearch(term);
      }
    }, 500),
    []
  );

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    debouncedSearch(text);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const results = searchResults?.data || {};
  const products = results.products || [];
  const stores = results.stores || [];
  const categories = results.categories || [];

  const renderEmptyState = () => {
    if (searchTerm.length < 2) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={60} color={additionalColors.textLight} />
          <CustomText variant="h3" style={styles.emptyTitle}>
            {t('search_prompt')}
          </CustomText>
          <CustomText variant="body" color={additionalColors.textLight} style={styles.emptyText}>
            {t('search_hint')}
          </CustomText>
        </View>
      );
    }

    if (!isLoading && !isFetching && products.length === 0 && stores.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={60} color={additionalColors.textLight} />
          <CustomText variant="h3" style={styles.emptyTitle}>
            {t('no_results')}
          </CustomText>
          <CustomText variant="body" color={additionalColors.textLight} style={styles.emptyText}>
            {t('try_different_search')}
          </CustomText>
        </View>
      );
    }

    return null;
  };

  const renderTab = (tabKey, label, count) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tabKey && styles.activeTab]}
      onPress={() => setActiveTab(tabKey)}
    >
      <CustomText
        variant="body"
        color={activeTab === tabKey ? colors.primary : additionalColors.textLight}
        style={activeTab === tabKey && styles.activeTabText}
      >
        {label} {count > 0 && `(${count})`}
      </CustomText>
    </TouchableOpacity>
  );

  const renderProducts = () => (
    <View style={styles.gridContainer}>
      {products.map((product) => (
        <View key={product.id} style={styles.productCardWrapper}>
          <ProductCard
            product={product}
            onPress={() => onProductPress && onProductPress(product.id)}
          />
        </View>
      ))}
    </View>
  );

  const renderStores = () => (
    <View style={styles.listContainer}>
      {stores.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          onPress={() => onStorePress && onStorePress(store.id)}
        />
      ))}
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryItem}
          onPress={() => {
            // Navigate to products with category filter
          }}
        >
          <View style={styles.categoryIcon}>
            <Ionicons name="grid-outline" size={24} color={colors.primary} />
          </View>
          <CustomText variant="body" style={styles.categoryName}>
            {category.name}
          </CustomText>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={additionalColors.textLight} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={additionalColors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={additionalColors.textLight} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, isRTL && styles.searchInputRTL]}
            placeholder={t('search_placeholder')}
            placeholderTextColor={additionalColors.textLight}
            value={searchTerm}
            onChangeText={handleSearchChange}
            autoFocus
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={additionalColors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      {searchTerm.length >= 2 && (products.length > 0 || stores.length > 0 || categories.length > 0) && (
        <View style={styles.tabsContainer}>
          {renderTab('products', t('products'), products.length)}
          {renderTab('stores', t('stores'), stores.length)}
          {renderTab('categories', t('categories'), categories.length)}
        </View>
      )}

      {/* Loading */}
      {(isLoading || isFetching) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Results */}
      {!isLoading && !isFetching && (
        <ScrollView 
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          {renderEmptyState()}
          
          {activeTab === 'products' && products.length > 0 && renderProducts()}
          {activeTab === 'stores' && stores.length > 0 && renderStores()}
          {activeTab === 'categories' && categories.length > 0 && renderCategories()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: additionalColors.divider,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Cairo-Regular',
    color: additionalColors.text,
  },
  searchInputRTL: {
    textAlign: 'right',
  },
  clearButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
  },
  tab: {
    marginRight: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: `${colors.primary}15`,
  },
  activeTabText: {
    fontFamily: 'Cairo-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 15,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 15,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  productCardWrapper: {
    width: '50%',
    padding: 5,
  },
  listContainer: {
    gap: 10,
  },
  categoriesContainer: {
    gap: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  categoryIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontFamily: 'Cairo-SemiBold',
  },
});

export default SearchPage;

