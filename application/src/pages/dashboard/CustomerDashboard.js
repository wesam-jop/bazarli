import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useGetCustomerStatsQuery } from '../../store/slices/dashboardSlice';
import { useGetUserOrdersQuery } from '../../store/slices/ordersSlice';
import { logout } from '../../store/slices/authSlice';
import { useLanguage } from '../../context/LanguageContext';
import { colors, additionalColors, statusColors } from '../../constants/colors';
import CustomText from '../../components/CustomText';
import DashboardMenu from '../../components/DashboardMenu';
import ProfilePage from './ProfilePage';
import OrdersPage from './OrdersPage';
import FavoritesPage from './FavoritesPage';
import AddressesPage from './AddressesPage';
import NotificationsPage from './NotificationsPage';

const CustomerDashboard = ({ onBack }) => {
  const { t, isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetCustomerStatsQuery();

  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useGetUserOrdersQuery({ per_page: 5 });

  const stats = statsData?.data?.stats || {};
  const recentOrders = ordersData?.data?.data?.slice(0, 3) || [];

  const handleLogout = async () => {
    await dispatch(logout());
  };

  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchOrders();
  }, [refetchStats, refetchOrders]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage onBack={() => setActiveTab('dashboard')} embedded />;
      case 'orders':
        return <OrdersPage onBack={() => setActiveTab('dashboard')} embedded />;
      case 'favorites':
        return <FavoritesPage onBack={() => setActiveTab('dashboard')} embedded />;
      case 'addresses':
        return <AddressesPage onBack={() => setActiveTab('dashboard')} embedded />;
      case 'notifications':
        return <NotificationsPage onBack={() => setActiveTab('dashboard')} embedded />;
      default:
        return renderDashboard();
    }
  };

  const getStatusStyle = (status) => {
    return statusColors[status] || statusColors.pending;
  };

  const statCards = [
    {
      id: 'total',
      label: t('totalOrders'),
      value: stats.total_orders || 0,
      icon: 'receipt-outline',
      color: colors.primary,
      bgColor: colors.secondary,
    },
    {
      id: 'pending',
      label: t('pending'),
      value: stats.pending_orders || 0,
      icon: 'time-outline',
      color: additionalColors.warning,
      bgColor: '#fff7ed',
    },
    {
      id: 'delivered',
      label: t('delivered'),
      value: stats.delivered_orders || 0,
      icon: 'checkmark-circle-outline',
      color: additionalColors.success,
      bgColor: '#f0fdf4',
    },
    {
      id: 'spent',
      label: t('totalSpent'),
      value: `${(stats.total_spent || 0).toFixed(0)} ل.س`,
      icon: 'wallet-outline',
      color: colors.accent,
      bgColor: '#eff6ff',
    },
  ];

  const quickActions = [
    { id: 'shop', icon: 'bag-outline', label: t('shopNow') || 'تسوق الآن', onPress: onBack },
    { id: 'orders', icon: 'receipt-outline', label: t('myOrders'), onPress: () => setActiveTab('orders') },
    { id: 'favorites', icon: 'heart-outline', label: t('favorites') || 'المفضلة', onPress: () => setActiveTab('favorites') },
    { id: 'addresses', icon: 'location-outline', label: t('deliveryAddresses') || 'العناوين', onPress: () => setActiveTab('addresses') },
  ];

  const renderDashboard = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={statsLoading || ordersLoading}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <View style={[styles.welcomeHeader, isRTL && styles.welcomeHeaderRTL]}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <CustomText variant="h2" color={colors.primary}>
                  {(user?.name || 'U')[0].toUpperCase()}
                </CustomText>
              </View>
            </View>
            <View style={styles.welcomeText}>
              <CustomText variant="caption" color={additionalColors.textLight}>
                {t('welcome')} 👋
              </CustomText>
              <CustomText variant="h2" color={additionalColors.text}>
                {user?.name || t('customer')}
              </CustomText>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={22} color={additionalColors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((card) => (
          <View key={card.id} style={[styles.statCard, { backgroundColor: card.bgColor }]}>
            <View style={[styles.statIconContainer, { backgroundColor: `${card.color}20` }]}>
              <Ionicons name={card.icon} size={24} color={card.color} />
            </View>
            <CustomText variant="h2" color={additionalColors.text} style={styles.statValue}>
              {card.value}
            </CustomText>
            <CustomText variant="caption" color={additionalColors.textLight}>
              {card.label}
            </CustomText>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <CustomText variant="h3" color={additionalColors.text} style={styles.sectionTitle}>
          {t('quickActions') || 'الإجراءات السريعة'}
        </CustomText>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={action.onPress}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name={action.icon} size={24} color={colors.primary} />
              </View>
              <CustomText variant="small" color={additionalColors.text} style={styles.quickActionLabel}>
                {action.label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
          <CustomText variant="h3" color={additionalColors.text}>
            {t('recentOrders')}
          </CustomText>
          <TouchableOpacity onPress={() => setActiveTab('orders')}>
            <CustomText variant="small" color={colors.primary}>
              {t('viewAllStores') || 'عرض الكل'}
            </CustomText>
          </TouchableOpacity>
        </View>

        {ordersLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : recentOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={40} color={additionalColors.textLight} />
            </View>
            <CustomText variant="body" color={additionalColors.textLight} style={styles.emptyText}>
              {t('noOrders')}
            </CustomText>
            <TouchableOpacity style={styles.shopButton} onPress={onBack}>
              <CustomText variant="body" color={colors.background}>
                {t('shopNow') || 'ابدأ التسوق'}
              </CustomText>
            </TouchableOpacity>
          </View>
        ) : (
          recentOrders.map((order) => {
            const statusStyle = getStatusStyle(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => setActiveTab('orders')}
              >
                <View style={[styles.orderHeader, isRTL && styles.orderHeaderRTL]}>
                  <View>
                    <CustomText variant="body" color={colors.primary} style={styles.orderNumber}>
                      {order.order_number || `#${order.id}`}
                    </CustomText>
                    <CustomText variant="caption" color={additionalColors.textLight}>
                      {new Date(order.created_at).toLocaleDateString('ar-SY')}
                    </CustomText>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.background, borderColor: statusStyle.border }]}>
                    <CustomText variant="small" color={statusStyle.text}>
                      {t(order.status)}
                    </CustomText>
                  </View>
                </View>
                <View style={[styles.orderFooter, isRTL && styles.orderFooterRTL]}>
                  <CustomText variant="caption" color={additionalColors.textLight}>
                    {order.items_count || order.order_items?.length || 0} {t('products')}
                  </CustomText>
                  <CustomText variant="h3" color={colors.primary}>
                    {(order.total_amount || 0).toFixed(0)} ل.س
                  </CustomText>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Upgrade Cards */}
      <View style={styles.upgradeSection}>
        {/* Store Upgrade Card */}
        <TouchableOpacity style={[styles.upgradeCard, styles.storeUpgradeCard]}>
          <View style={styles.upgradeIconContainer}>
            <Ionicons name="storefront-outline" size={28} color={colors.primary} />
          </View>
          <View style={styles.upgradeContent}>
            <CustomText variant="body" color={additionalColors.text} style={styles.upgradeTitle}>
              {t('becomeStoreOwner') || 'أصبح صاحب متجر'}
            </CustomText>
            <CustomText variant="caption" color={additionalColors.textLight}>
              {t('storeOwnerDesc') || 'ابدأ ببيع منتجاتك'}
            </CustomText>
          </View>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Driver Upgrade Card */}
        <TouchableOpacity style={[styles.upgradeCard, styles.driverUpgradeCard]}>
          <View style={[styles.upgradeIconContainer, { backgroundColor: `${colors.accent}15` }]}>
            <Ionicons name="car-outline" size={28} color={colors.accent} />
          </View>
          <View style={styles.upgradeContent}>
            <CustomText variant="body" color={additionalColors.text} style={styles.upgradeTitle}>
              {t('becomeDriver') || 'أصبح سائق توصيل'}
            </CustomText>
            <CustomText variant="caption" color={additionalColors.textLight}>
              {t('driverDesc') || 'اربح مع كل توصيل'}
            </CustomText>
          </View>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons
              name={isRTL ? "chevron-forward" : "chevron-back"}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <CustomText variant="caption" color={additionalColors.textLight} style={styles.headerSubtitle}>
              {t('dashboard')}
            </CustomText>
            <CustomText variant="h3" color={additionalColors.text}>
              {activeTab === 'dashboard' ? t('dashboard') : 
               activeTab === 'profile' ? t('profile') :
               activeTab === 'orders' ? t('myOrders') :
               activeTab === 'favorites' ? (t('favorites') || 'المفضلة') :
               activeTab === 'addresses' ? (t('deliveryAddresses') || 'العناوين') :
               activeTab === 'notifications' ? (t('notifications') || 'الإشعارات') :
               t('dashboard')}
            </CustomText>
          </View>
        </View>
      </View>

      {/* Dashboard Menu */}
      <DashboardMenu
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Content */}
      {renderTabContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerContentRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  welcomeHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  welcomeText: {
    flex: 1,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${additionalColors.error}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: additionalColors.borderLight,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    marginBottom: 4,
    fontFamily: 'Cairo-Bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontFamily: 'Cairo-Bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    textAlign: 'center',
    fontFamily: 'Cairo-SemiBold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: additionalColors.border,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: additionalColors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  orderNumber: {
    fontFamily: 'Cairo-Bold',
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: additionalColors.borderLight,
  },
  orderFooterRTL: {
    flexDirection: 'row-reverse',
  },
  upgradeSection: {
    gap: 12,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    borderWidth: 1,
  },
  storeUpgradeCard: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.secondary,
  },
  driverUpgradeCard: {
    borderColor: colors.accentLight,
    backgroundColor: '#f0f9ff',
  },
  upgradeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontFamily: 'Cairo-Bold',
    marginBottom: 2,
  },
});

export default CustomerDashboard;
