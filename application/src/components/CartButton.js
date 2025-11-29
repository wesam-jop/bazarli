import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../store/hooks';
import { openCart, useGetCartCountQuery } from '../store/slices/cartSlice';
import { colors, additionalColors } from '../constants/colors';
import CustomText from './CustomText';

const CartButton = () => {
  const dispatch = useAppDispatch();
  const { data: countData } = useGetCartCountQuery();
  const count = countData?.data?.count || 0;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (count > 0) {
      // Pulse animation when count changes
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count]);

  const handleOpenCart = () => {
    dispatch(openCart());
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleOpenCart}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="cart" size={24} color={colors.background} />
      </Animated.View>
      {count > 0 && (
        <View style={styles.badge}>
          <CustomText variant="small" color={colors.background} style={styles.badgeText}>
            {count > 99 ? '99+' : count}
          </CustomText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    position: 'relative',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: additionalColors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
});

export default CartButton;
