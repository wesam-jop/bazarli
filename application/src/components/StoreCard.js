import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from './CustomText';
import CustomButton from './CustomButton';

const StoreCard = ({ store, onPress, index = 0, fullWidth = false }) => {
  const { t, isRTL } = useLanguage();
  
  // Create fresh Animated.Value instances to avoid frozen object issues
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Create a safe copy of store data
  const storeData = useMemo(() => {
    // Check if store is open based on opening/closing times
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    let isOpen = true;
    
    if (store?.opening_time && store?.closing_time) {
      const opening = store.opening_time.split(':').map(Number);
      const closing = store.closing_time.split(':').map(Number);
      const openingMinutes = opening[0] * 60 + opening[1];
      const closingMinutes = closing[0] * 60 + closing[1];
      isOpen = currentTime >= openingMinutes && currentTime <= closingMinutes;
    }
    
    return {
      id: store?.id || 0,
      name: store?.name || '',
      category: store?.store_type || '',
      categoryLabel: store?.store_type_label || store?.store_type || '',
      governorate: store?.governorate || null,
      governorateLabel: store?.governorate?.name || '',
      city: store?.city || null,
      cityLabel: store?.city?.name || '',
      image: store?.logo_path || store?.image || null,
      isOpen: store?.is_active !== undefined ? (store.is_active && isOpen) : true,
    };
  }, [store]);

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

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.card, fullWidth && styles.cardFullWidth]}
        onPress={onPress}
      >
        {/* Store Image */}
        <View style={styles.imageContainer}>
          {storeData.image ? (
            <Image
              source={{ uri: storeData.image }}
              style={styles.storeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <CustomText variant="h3" color={additionalColors.textLight}>
                {storeData.name ? storeData.name.charAt(0) : '?'}
              </CustomText>
            </View>
          )}
        </View>

        {/* Store Info */}
        <View style={styles.infoContainer}>
          <View style={[styles.storeHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <CustomText
              variant="h3"
              color={additionalColors.text}
              style={[styles.storeName, { marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }]}
            >
              {storeData.name}
            </CustomText>
            {storeData.isOpen !== undefined && (
              <View style={[styles.statusBadge, storeData.isOpen && styles.statusOpen]}>
                <CustomText 
                  variant="small" 
                  color={storeData.isOpen ? additionalColors.success : additionalColors.error} 
                  style={styles.statusText}
                >
                  {storeData.isOpen ? t('open') : t('closed')}
                </CustomText>
              </View>
            )}
          </View>
          {storeData.categoryLabel && (
            <CustomText
              variant="caption"
              color={additionalColors.textLight}
              style={styles.storeCategory}
            >
              {storeData.categoryLabel}
            </CustomText>
          )}
          {(storeData.cityLabel || storeData.governorateLabel) && (
            <View style={[styles.locationContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Ionicons
                name="location"
                size={14}
                color={additionalColors.textLight}
                style={{ marginRight: isRTL ? 0 : 4, marginLeft: isRTL ? 4 : 0 }}
              />
              <CustomText variant="small" color={additionalColors.textLight} style={styles.locationText}>
                {storeData.cityLabel && storeData.governorateLabel
                  ? `${storeData.cityLabel}, ${storeData.governorateLabel}`
                  : storeData.cityLabel || storeData.governorateLabel}
              </CustomText>
            </View>
          )}
          {onPress && (
            <CustomButton
              onPress={onPress}
              style={styles.viewButton}
            >
              <View style={[styles.viewButtonContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <CustomText variant="body" color={colors.background} translate={true} translationKey="viewStore" />
                <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={16} color={colors.background} style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }} />
              </View>
            </CustomButton>
          )}
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
    width: 280,
    marginRight: 16,
  },
  cardFullWidth: {
    width: '100%',
    marginRight: 0,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: additionalColors.divider,
    overflow: 'hidden',
  },
  storeImage: {
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
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    flex: 1,
    letterSpacing: 0.2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: additionalColors.divider,
  },
  statusOpen: {
    backgroundColor: `${additionalColors.success}20`,
  },
  statusText: {
    fontSize: 11,
  },
  storeCategory: {
    opacity: 0.8,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
  },
  viewButton: {
    marginTop: 12,
    width: '100%',
  },
  viewButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StoreCard;
