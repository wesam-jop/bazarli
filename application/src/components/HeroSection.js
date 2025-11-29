import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../constants/colors';
import CustomText from './CustomText';
import CustomButton from './CustomButton';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isLargeScreen = width >= 768;

const HeroSection = () => {
  const { t, isRTL } = useLanguage();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideTextAnim = useRef(new Animated.Value(50)).current;
  const slideImageAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Slide text from right/left
      Animated.timing(slideTextAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      // Slide image from left/right
      Animated.timing(slideImageAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      // Scale up
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation for the image
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#e85a1f', '#f07a32', '#f5923e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Content Container */}
        <View style={[
          styles.contentContainer,
          { flexDirection: isLargeScreen ? (isRTL ? 'row' : 'row-reverse') : 'column' }
        ]}>
          
          {/* Text Content */}
          <Animated.View
            style={[
              styles.textContent,
              isLargeScreen && styles.textContentLarge,
              {
                opacity: fadeAnim,
                transform: [
                  { translateX: slideTextAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Title */}
            <CustomText
              variant="h1"
              color={colors.background}
              style={[
                styles.title,
                { textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('heroTitle')}
            </CustomText>

            {/* Subtitle */}
            <CustomText
              variant="body"
              color={colors.background}
              style={[
                styles.subtitle,
                { textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('heroSubtitle')}
            </CustomText>

            {/* Buttons */}
            <View style={[
              styles.buttonContainer,
              { flexDirection: isRTL ? 'row-reverse' : 'row' }
            ]}>
              {/* Start Shopping Button */}
              <CustomButton
                variant="primary"
                size="large"
                style={styles.primaryButton}
                textStyle={styles.primaryButtonText}
                onPress={() => {}}
              >
                <View style={[styles.buttonContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="cart-outline" size={20} color={colors.primary} style={isRTL ? styles.iconLeft : styles.iconRight} />
                  <CustomText style={styles.primaryButtonText}>{t('shopNow')}</CustomText>
                </View>
              </CustomButton>

              {/* Get App Button */}
              <CustomButton
                variant="outline"
                size="large"
                style={styles.outlineButton}
                textStyle={styles.outlineButtonText}
                onPress={() => {}}
              >
                <View style={[styles.buttonContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="phone-portrait-outline" size={20} color={colors.background} style={isRTL ? styles.iconLeft : styles.iconRight} />
                  <CustomText style={styles.outlineButtonText}>{t('getApp')}</CustomText>
                </View>
              </CustomButton>
            </View>
          </Animated.View>

          {/* Hero Image */}
          <Animated.View
            style={[
              styles.imageContainer,
              isLargeScreen && styles.imageContainerLarge,
              {
                opacity: fadeAnim,
                transform: [
                  { translateX: slideImageAnim },
                  { translateY: floatTranslate },
                ],
              },
            ]}
          >
            <Image
              source={require('../../assets/hero-background-ar-7.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    minHeight: isLargeScreen ? 450 : 500,
    paddingVertical: isLargeScreen ? 40 : 30,
    paddingHorizontal: isLargeScreen ? 60 : 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  textContentLarge: {
    paddingHorizontal: 40,
  },
  title: {
    fontSize: isLargeScreen ? 48 : 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: isLargeScreen ? 60 : 44,
  },
  subtitle: {
    fontSize: isLargeScreen ? 20 : 16,
    marginBottom: 30,
    opacity: 0.95,
    lineHeight: isLargeScreen ? 32 : 26,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.background,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: colors.background,
    borderWidth: 2,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: 150,
  },
  outlineButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconRight: {
    marginRight: 8,
  },
  iconLeft: {
    marginLeft: 8,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  imageContainerLarge: {
    minHeight: 350,
  },
  heroImage: {
    width: isLargeScreen ? 450 : 300,
    height: isLargeScreen ? 400 : 280,
  },
});

export default HeroSection;
