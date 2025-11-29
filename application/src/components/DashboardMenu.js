import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, additionalColors } from '../constants/colors';
import { useLanguage } from '../context/LanguageContext';
import CustomText from './CustomText';

const DashboardMenu = ({ activeTab, onTabChange, onLogout }) => {
  const { t, isRTL } = useLanguage();

  const menuItems = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: 'grid-outline',
      activeIcon: 'grid',
    },
    {
      id: 'orders',
      label: t('myOrders'),
      icon: 'receipt-outline',
      activeIcon: 'receipt',
    },
    {
      id: 'favorites',
      label: t('favorites') || 'المفضلة',
      icon: 'heart-outline',
      activeIcon: 'heart',
    },
    {
      id: 'addresses',
      label: t('deliveryAddresses') || 'عناوين التوصيل',
      icon: 'location-outline',
      activeIcon: 'location',
    },
    {
      id: 'profile',
      label: t('profile'),
      icon: 'person-outline',
      activeIcon: 'person',
    },
    {
      id: 'notifications',
      label: t('notifications') || 'الإشعارات',
      icon: 'notifications-outline',
      activeIcon: 'notifications',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onTabChange(item.id)}
              style={[
                styles.menuItem,
                isActive && styles.menuItemActive,
              ]}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={20}
                color={isActive ? colors.primary : additionalColors.textLight}
              />
              <CustomText
                variant="small"
                color={isActive ? colors.primary : additionalColors.textLight}
                style={[styles.menuLabel, isActive && styles.menuLabelActive]}
              >
                {item.label}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    gap: 8,
  },
  menuItemActive: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  menuLabel: {
    fontFamily: 'Cairo-SemiBold',
  },
  menuLabelActive: {
    fontFamily: 'Cairo-Bold',
  },
});

export default DashboardMenu;

