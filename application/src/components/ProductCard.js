import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../store/hooks';
import { useAddToCartMutation } from '../store/slices/cartSlice';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from './CustomText';
import CustomButton from './CustomButton';

const ProductCard = ({ product, onPress, index = 0 }) => {
  const { t, isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  
  // Create fresh Animated.Value instances to avoid frozen object issues
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Create a safe copy of product data
  const productData = useMemo(() => {
    const finalPrice = product?.final_price || product?.discount_price || product?.price || 0;
    return {
      id: product?.id || 0,
      name: product?.name || '',
      price: product?.price || 0,
      final_price: finalPrice,
      discount_price: product?.discount_price,
      category: product?.category || null,
      categoryLabel: product?.category?.name || product?.categoryLabel || '',
      governorate: product?.store?.governorate || null,
      governorateLabel: product?.store?.governorate?.name_ar || product?.store?.governorate?.name || product?.governorateLabel || '',
      city: product?.store?.city || null,
      cityLabel: product?.store?.city?.name_ar || product?.store?.city?.name || product?.areaLabel || '',
      image: product?.image || null,
    };
  }, [product]);

  useEffect(() => {
    // Stagger animation based on index - only run once
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]);
    
    animation.start();
    
    // Cleanup function
    return () => {
      animation.stop();
    };
  }, [index, fadeAnim, slideAnim]);

  const animatedStyle = useMemo(() => {
    return {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    };
  }, [fadeAnim, slideAnim]);

  const handleAddToCart = async () => {
    try {
      await addToCart({ product_id: productData.id, quantity: 1 }).unwrap();
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={onPress}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {productData.image ? (
            <Image
              source={{ uri: productData.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <CustomText variant="h3" color={additionalColors.textLight}>
                {productData.name ? productData.name.charAt(0) : '?'}
              </CustomText>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <CustomText
            variant="h3"
            color={additionalColors.text}
            style={styles.productName}
          >
            {productData.name}
          </CustomText>
          
          {productData.categoryLabel && (
            <CustomText
              variant="caption"
              color={additionalColors.textLight}
              style={styles.productCategory}
            >
              {productData.categoryLabel}
            </CustomText>
          )}

          <View style={styles.priceContainer}>
            {productData.discount_price && productData.discount_price < productData.price && (
              <CustomText
                variant="caption"
                color={additionalColors.textLight}
                style={styles.originalPrice}
              >
                {productData.price} ل.س
              </CustomText>
            )}
            <CustomText
              variant="body"
              color={colors.primary}
              style={styles.productPrice}
            >
              {productData.final_price} ل.س
            </CustomText>
          </View>

          {(productData.cityLabel || productData.governorateLabel) && (
            <View style={[styles.locationContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons
                name="location"
                size={14}
                color={additionalColors.textLight}
                style={{ marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }}
              />
              <CustomText variant="small" color={additionalColors.textLight} style={styles.locationText}>
                {productData.cityLabel && productData.governorateLabel
                  ? `${productData.cityLabel}, ${productData.governorateLabel}`
                  : productData.cityLabel || productData.governorateLabel}
              </CustomText>
            </View>
          )}
          
          {/* Add to Cart Button */}
          <CustomButton
            variant="primary"
            size="medium"
            onPress={handleAddToCart}
            loading={isAdding}
            disabled={isAdding}
            style={styles.addToCartButton}
          >
            <Ionicons name="cart" size={18} color={colors.background} style={styles.cartIcon} />
            <CustomText variant="body" color={colors.background} style={styles.addToCartText}>
              {t('addToCart')}
            </CustomText>
          </CustomButton>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: additionalColors.divider,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: additionalColors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  productName: {
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  productCategory: {
    opacity: 0.8,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
  },
  productPrice: {
    letterSpacing: 0.3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
  },
  addToCartButton: {
    marginTop: 8,
    width: '100%',
  },
  addToCartText: {
    marginHorizontal: 6,
  },
  cartIcon: {
    marginHorizontal: 0,
  },
});

export default ProductCard;
