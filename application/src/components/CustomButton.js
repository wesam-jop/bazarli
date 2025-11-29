import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, additionalColors } from '../constants/colors';
import CustomText from './CustomText';

const CustomButton = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  textVariant = 'body',
  translate = false,
  translationKey = '',
  ...props
}) => {
  const { isRTL } = useLanguage();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'text':
        return styles.text;
      default:
        return styles.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.small;
      case 'medium':
        return styles.medium;
      case 'large':
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.background;
      case 'secondary':
        return colors.background;
      case 'outline':
        return colors.primary;
      case 'text':
        return colors.primary;
      default:
        return colors.background;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        disabled && styles.disabled,
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={getTextColor()} 
          size={size === 'small' ? 'small' : 'small'} 
        />
      ) : translate && translationKey ? (
        <CustomText
          variant={textVariant}
          style={[
            styles.buttonText,
            { color: getTextColor() },
            textStyle,
          ]}
          translate={translate}
          translationKey={translationKey}
        />
      ) : (
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'center' }}>
          {typeof children === 'string' ? (
            <CustomText
              variant={textVariant}
              style={[
                styles.buttonText,
                { color: getTextColor() },
                textStyle,
              ]}
            >
              {children}
            </CustomText>
          ) : (
            React.Children.toArray(children).filter(child => 
              child !== null && child !== undefined && 
              (typeof child !== 'string' || child.trim() !== '')
            )
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    // Font is handled by CustomText component
  },
});

export default CustomButton;

