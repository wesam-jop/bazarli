import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../hooks/useCurrency';
import { colors, additionalColors } from '../constants/colors';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import Header from '../components/Header';
import { useGetProductQuery, useAddToFavoritesMutation, useRemoveFromFavoritesMutation, useGetFavoritesQuery } from '../store/slices/productsSlice';
import { useAddToCartMutation } from '../store/slices/cartSlice';

const { width } = Dimensions.get('window');

const ProductDetailsPage = ({ productId, onBack, onStorePress }) => {
  const { t, isRTL, language } = useLanguage();
  const currency = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // API calls
  const { data: productData, isLoading, error } = useGetProductQuery(productId);
  const { data: favoritesData } = useGetFavoritesQuery();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addToFavorites, { isLoading: isAddingFav }] = useAddToFavoritesMutation();
  const [removeFromFavorites, { isLoading: isRemovingFav }] = useRemoveFromFavoritesMutation();

  const product = productData?.data;
  const favorites = favoritesData?.data || [];
  const isFavorite = favorites.some(fav => fav.product_id === productId || fav.id === productId);

  const handleAddToCart = async () => {
    try {
      await addToCart({ product_id: productId, quantity }).unwrap();
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(productId).unwrap();
      } else {
        await addToFavorites(productId).unwrap();
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={additionalColors.error} />
        <CustomText variant="h3" style={styles.errorText}>
          {t('product_not_found')}
        </CustomText>
        <CustomButton title={t('go_back')} onPress={onBack} />
      </View>
    );
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const finalPrice = hasDiscount ? product.discount_price : product.price;

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={[styles.backButton, isRTL && styles.backButtonRTL]} onPress={onBack}>
        <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image && !imageError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={80} color={additionalColors.textLight} />
            </View>
          )}
          
          {/* Discount Badge */}
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <CustomText variant="small" color={colors.background}>
                -{product.discount_percentage}%
              </CustomText>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
            disabled={isAddingFav || isRemovingFav}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? additionalColors.error : additionalColors.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          {/* Category */}
          {product.category && (
            <View style={styles.categoryBadge}>
              <CustomText variant="caption" color={colors.primary}>
                {product.category.name}
              </CustomText>
            </View>
          )}

          {/* Name */}
          <CustomText variant="h2" style={styles.productName}>
            {product.name}
          </CustomText>

          {/* Price */}
          <View style={styles.priceContainer}>
            <CustomText variant="h2" color={colors.primary} style={styles.price}>
              {finalPrice?.toFixed(0)} {currency}
            </CustomText>
            {hasDiscount && (
              <CustomText variant="body" color={additionalColors.textLight} style={styles.originalPrice}>
                {product.price?.toFixed(0)} {currency}
              </CustomText>
            )}
            {product.unit && (
              <CustomText variant="caption" color={additionalColors.textLight}>
                / {product.unit}
              </CustomText>
            )}
          </View>

          {/* Availability */}
          <View style={styles.availabilityContainer}>
            <View style={[
              styles.availabilityDot,
              { backgroundColor: product.is_available ? additionalColors.success : additionalColors.error }
            ]} />
            <CustomText variant="caption" color={product.is_available ? additionalColors.success : additionalColors.error}>
              {product.is_available ? t('available') : t('not_available')}
            </CustomText>
          </View>

          {/* Store Info */}
          {product.store && (
            <TouchableOpacity 
              style={styles.storeCard}
              onPress={() => onStorePress && onStorePress(product.store.id)}
            >
              <View style={styles.storeIcon}>
                <Ionicons name="storefront-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.storeInfo}>
                <CustomText variant="body" style={styles.storeName}>
                  {product.store.name}
                </CustomText>
                {product.store.governorate && (
                  <CustomText variant="caption" color={additionalColors.textLight}>
                    {language === 'ar' ? product.store.governorate.name_ar : product.store.governorate.name_en}
                  </CustomText>
                )}
              </View>
              <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={additionalColors.textLight} />
            </TouchableOpacity>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <CustomText variant="h4" style={styles.sectionTitle}>
                {t('description')}
              </CustomText>
              <CustomText variant="body" color={additionalColors.text} style={styles.description}>
                {product.description}
              </CustomText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {product.is_available && (
        <View style={styles.bottomBar}>
          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
              <Ionicons name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <CustomText variant="h3" style={styles.quantityText}>
              {quantity}
            </CustomText>
            <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <CustomButton
            title={`${t('add_to_cart')} - ${(finalPrice * quantity).toFixed(0)} ${currency}`}
            onPress={handleAddToCart}
            loading={isAddingToCart}
            style={styles.addToCartButton}
          />
        </View>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    marginVertical: 20,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    backgroundColor: colors.background,
    borderRadius: 25,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonRTL: {
    left: 'auto',
    right: 15,
  },
  imageContainer: {
    width: width,
    height: width * 0.8,
    backgroundColor: additionalColors.divider,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: additionalColors.divider,
  },
  discountBadge: {
    position: 'absolute',
    top: 50,
    right: 15,
    backgroundColor: additionalColors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: colors.background,
    borderRadius: 25,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  productName: {
    fontFamily: 'Cairo-Bold',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  price: {
    fontFamily: 'Cairo-Bold',
    marginRight: 10,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: additionalColors.divider,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  storeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 2,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 10,
  },
  description: {
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: additionalColors.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: additionalColors.divider,
    borderRadius: 25,
    marginRight: 15,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    minWidth: 30,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
  },
});

export default ProductDetailsPage;

