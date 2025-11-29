import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetFavoritesQuery, useRemoveFromFavoritesMutation } from '../../store/slices/productsSlice';
import { useAddToCartMutation } from '../../store/slices/cartSlice';
import { useLanguage } from '../../context/LanguageContext';
import { colors, additionalColors } from '../../constants/colors';
import CustomText from '../../components/CustomText';
import DashboardLayout from '../../components/DashboardLayout';

const FavoritesPage = ({ onBack, embedded = false }) => {
  const { t, isRTL } = useLanguage();
  
  const { data: favoritesData, isLoading, refetch } = useGetFavoritesQuery();
  const [removeFromFavorites, { isLoading: isRemoving }] = useRemoveFromFavoritesMutation();
  const [addToCart] = useAddToCartMutation();

  const favorites = favoritesData?.data || [];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleRemoveFavorite = async (productId) => {
    try {
      await removeFromFavorites(productId).unwrap();
      refetch();
    } catch (error) {
      Alert.alert(t('error'), t('removeFavoriteFailed') || 'فشل إزالة المنتج من المفضلة');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart({ product_id: product.id, quantity: 1 }).unwrap();
      Alert.alert(t('success'), t('addedToCart') || 'تمت الإضافة إلى السلة');
    } catch (error) {
      Alert.alert(t('error'), error?.data?.message || t('addToCartFailed') || 'فشلت الإضافة إلى السلة');
    }
  };

  const renderProductCard = (product) => (
    <View key={product.id} style={styles.productCard}>
      {/* Product Image */}
      <View style={styles.productImageContainer}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={additionalColors.textLight} />
          </View>
        )}
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleRemoveFavorite(product.id)}
          disabled={isRemoving}
        >
          <Ionicons name="heart" size={18} color={additionalColors.error} />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <CustomText variant="body" color={additionalColors.text} style={styles.productName} numberOfLines={2}>
            {product.name}
          </CustomText>
        </View>

        {product.store?.name && (
          <View style={[styles.storeInfo, isRTL && styles.storeInfoRTL]}>
            <Ionicons name="storefront-outline" size={12} color={additionalColors.textLight} />
            <CustomText variant="caption" color={additionalColors.textLight}>
              {product.store.name}
            </CustomText>
          </View>
        )}

        <View style={[styles.productFooter, isRTL && styles.productFooterRTL]}>
          <View style={styles.priceContainer}>
            <CustomText variant="h3" color={colors.primary}>
              {(product.price || 0).toFixed(0)}
            </CustomText>
            <CustomText variant="caption" color={additionalColors.textLight}>
              ل.س
            </CustomText>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(product)}
          >
            <Ionicons name="cart-outline" size={18} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {isLoading && favorites.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={48} color={additionalColors.textLight} />
          </View>
          <CustomText variant="h3" color={additionalColors.text} style={styles.emptyTitle}>
            {t('noFavorites') || 'لا توجد منتجات مفضلة'}
          </CustomText>
          <CustomText variant="body" color={additionalColors.textLight} style={styles.emptyText}>
            {t('noFavoritesDesc') || 'احفظ منتجاتك المفضلة للوصول السريع إليها'}
          </CustomText>
          <TouchableOpacity style={styles.browseButton} onPress={onBack}>
            <Ionicons name="bag-outline" size={20} color={colors.background} />
            <CustomText variant="body" color={colors.background}>
              {t('browseProducts') || 'تصفح المنتجات'}
            </CustomText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.productsGrid}>
          {favorites.map(renderProductCard)}
        </View>
      )}
    </ScrollView>
  );

  if (embedded) {
    return content;
  }

  return (
    <DashboardLayout
      title={t('favorites') || 'المفضلة'}
      subtitle={t('dashboard')}
      onBack={onBack}
    >
      {content}
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: additionalColors.border,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: additionalColors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    fontFamily: 'Cairo-Bold',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  productImageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 12,
  },
  productHeader: {
    marginBottom: 4,
  },
  productName: {
    fontFamily: 'Cairo-SemiBold',
    lineHeight: 20,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  storeInfoRTL: {
    flexDirection: 'row-reverse',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productFooterRTL: {
    flexDirection: 'row-reverse',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FavoritesPage;

