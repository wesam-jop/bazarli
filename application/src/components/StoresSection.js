import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { useGetStoresQuery } from '../store/slices/storesSlice';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from './CustomText';
import CustomButton from './CustomButton';
import StoreCard from './StoreCard';
import Container from './Container';

const StoresSection = ({ onViewAll }) => {
  const { t, isRTL } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Fetch featured stores
  const { data: storesData, isLoading } = useGetStoresQuery({
    per_page: 3,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const stores = storesData?.data?.data || [];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  if (isLoading || stores.length === 0) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <Container style={styles.container}>
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <CustomText variant="h2" color={colors.primary} style={styles.title}>
            {t('featuredStores')}
          </CustomText>
          <CustomButton
            variant="text"
            onPress={() => onViewAll && onViewAll()}
            style={styles.viewAllButton}
          >
            <CustomText variant="body" color={colors.primary}>
              {t('viewAllStores')}
            </CustomText>
          </CustomButton>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {stores.map((store, index) => {
            const storeCopy = { ...store };
            return (
              <StoreCard
                key={storeCopy.id}
                store={storeCopy}
                index={index}
                onPress={onViewAll ? () => onViewAll(storeCopy.id) : undefined}
              />
            );
          })}
        </ScrollView>
      </Container>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  viewAllButton: {
    padding: 0,
    minHeight: 'auto',
  },
  scrollView: {
    marginHorizontal: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
});

export default StoresSection;
