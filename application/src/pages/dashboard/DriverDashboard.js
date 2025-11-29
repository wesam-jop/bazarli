import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useLanguage } from '../../context/LanguageContext';
import { colors, additionalColors, statusColors } from '../../constants/colors';
import CustomText from '../../components/CustomText';
import CustomButton from '../../components/CustomButton';
import {
  useGetDriverOrdersQuery,
  useGetDriverStatisticsQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  usePickUpOrderMutation,
  useStartDeliveryMutation,
  useCompleteDeliveryMutation,
  useGetDriverApplicationStatusQuery,
} from '../../store/slices/driverSlice';
import DriverApplicationPage from '../DriverApplicationPage';

const DriverDashboard = ({ onBack }) => {
  const { t, isRTL } = useLanguage();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // API calls
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useGetDriverOrdersQuery();
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetDriverStatisticsQuery();
  const { data: applicationData, isLoading: applicationLoading } = useGetDriverApplicationStatusQuery();

  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();
  const [pickUpOrder, { isLoading: isPickingUp }] = usePickUpOrderMutation();
  const [startDelivery, { isLoading: isStarting }] = useStartDeliveryMutation();
  const [completeDelivery, { isLoading: isCompleting }] = useCompleteDeliveryMutation();

  const orders = ordersData?.data || {};
  const stats = statsData?.data || {};
  const applicationStatus = applicationData?.data?.status;

  const pendingOrders = orders.pending_approval_orders || [];
  const acceptedOrders = orders.accepted_orders || [];
  const activeOrders = orders.active_orders || [];
  const completedOrders = orders.recent_completed_orders || [];

  const isApprovedDriver = user?.user_type === 'driver' || applicationStatus === 'approved';

  const handleLogout = async () => {
    Alert.alert(t('logout'), t('logout_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchOrders(), refetchStats()]);
    setRefreshing(false);
  }, [refetchOrders, refetchStats]);

  const handleOrderAction = async (orderId, action) => {
    try {
      switch (action) {
        case 'accept':
          await acceptOrder(orderId).unwrap();
          break;
        case 'reject':
          await rejectOrder(orderId).unwrap();
          break;
        case 'pickup':
          await pickUpOrder(orderId).unwrap();
          break;
        case 'start':
          await startDelivery(orderId).unwrap();
          break;
        case 'complete':
          await completeDelivery(orderId).unwrap();
          break;
      }
      refetchOrders();
      refetchStats();
    } catch (err) {
      Alert.alert(t('error'), err.data?.message || t('action_failed'));
    }
  };

  const getStatusStyle = (status) => {
    return statusColors[status] || statusColors.pending;
  };

  // If not an approved driver, show application page
  if (!isApprovedDriver && activeTab === 'apply') {
    return (
      <DriverApplicationPage
        onBack={() => setActiveTab('overview')}
        onSuccess={() => setActiveTab('overview')}
      />
    );
  }

  const statCards = [
    {
      id: 'today',
      label: t('orders_today'),
      value: stats.today?.completed_orders || 0,
      icon: 'today-outline',
      color: colors.primary,
      bgColor: colors.secondary,
    },
    {
      id: 'earnings_today',
      label: t('revenue_today'),
      value: `${(stats.today?.earnings || 0).toFixed(0)}`,
      icon: 'cash-outline',
      color: additionalColors.success,
      bgColor: '#f0fdf4',
    },
    {
      id: 'week',
      label: t('this_week'),
      value: stats.this_week?.completed_orders || 0,
      icon: 'calendar-outline',
      color: colors.accent,
      bgColor: '#eff6ff',
    },
    {
      id: 'total',
      label: t('totalDeliveries'),
      value: stats.total?.completed_orders || 0,
      icon: 'bicycle-outline',
      color: additionalColors.warning,
      bgColor: '#fff7ed',
    },
  ];

  const renderOrderCard = (order, type) => {
    const statusStyle = getStatusStyle(order.status);
    
    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <CustomText variant="body" color={colors.primary} style={styles.orderNumber}>
              #{order.order_number || order.id}
            </CustomText>
            <CustomText variant="caption" color={additionalColors.textLight}>
              {new Date(order.created_at).toLocaleString()}
            </CustomText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.background, borderColor: statusStyle.border }]}>
            <CustomText variant="small" color={statusStyle.text}>
              {t(order.status)}
            </CustomText>
          </View>
        </View>

        {/* Customer & Address */}
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={additionalColors.textLight} />
            <CustomText variant="caption" color={additionalColors.text} style={styles.detailText}>
              {order.customer?.name || order.user?.name || t('customer')}
            </CustomText>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={additionalColors.textLight} />
            <CustomText variant="caption" color={additionalColors.text} style={styles.detailText} numberOfLines={1}>
              {order.delivery_address || t('noAddressInfo')}
            </CustomText>
          </View>
        </View>

        {/* Total */}
        <View style={styles.orderFooter}>
          <CustomText variant="caption" color={additionalColors.textLight}>
            {order.items_count || order.order_items?.length || 0} {t('products')}
          </CustomText>
          <CustomText variant="h4" color={colors.primary}>
            {(order.total_amount || 0).toFixed(0)} {t('currency')}
          </CustomText>
        </View>

        {/* Actions */}
        <View style={styles.orderActions}>
          {type === 'pending' && (
            <>
              <CustomButton
                title={t('accept')}
                onPress={() => handleOrderAction(order.id, 'accept')}
                loading={isAccepting}
                size="small"
                style={styles.actionButton}
              />
              <CustomButton
                title={t('reject')}
                onPress={() => handleOrderAction(order.id, 'reject')}
                loading={isRejecting}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
            </>
          )}
          {type === 'accepted' && (
            <CustomButton
              title={t('pick_up_order')}
              onPress={() => handleOrderAction(order.id, 'pickup')}
              loading={isPickingUp}
              size="small"
              style={styles.fullButton}
            />
          )}
          {type === 'active' && order.status === 'driver_picked_up' && (
            <CustomButton
              title={t('start_delivery')}
              onPress={() => handleOrderAction(order.id, 'start')}
              loading={isStarting}
              size="small"
              style={styles.fullButton}
            />
          )}
          {type === 'active' && order.status === 'out_for_delivery' && (
            <CustomButton
              title={t('complete_delivery')}
              onPress={() => handleOrderAction(order.id, 'complete')}
              loading={isCompleting}
              size="small"
              style={styles.fullButton}
            />
          )}
        </View>
      </View>
    );
  };

  const isLoading = ordersLoading || statsLoading;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <CustomText variant="caption" color={additionalColors.textLight} style={styles.headerSubtitle}>
              {t('driver')}
            </CustomText>
            <CustomText variant="h3" color={additionalColors.text}>
              {t('dashboard')}
            </CustomText>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={22} color={additionalColors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons name="grid-outline" size={20} color={activeTab === 'overview' ? colors.primary : additionalColors.textLight} />
          <CustomText variant="small" color={activeTab === 'overview' ? colors.primary : additionalColors.textLight}>
            {t('overview')}
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons name="list-outline" size={20} color={activeTab === 'orders' ? colors.primary : additionalColors.textLight} />
          <CustomText variant="small" color={activeTab === 'orders' ? colors.primary : additionalColors.textLight}>
            {t('orders')}
          </CustomText>
          {(pendingOrders.length + activeOrders.length) > 0 && (
            <View style={styles.badge}>
              <CustomText variant="small" color={colors.background}>
                {pendingOrders.length + activeOrders.length}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
        {!isApprovedDriver && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'apply' && styles.activeTab]}
            onPress={() => setActiveTab('apply')}
          >
            <Ionicons name="document-text-outline" size={20} color={activeTab === 'apply' ? colors.primary : additionalColors.textLight} />
            <CustomText variant="small" color={activeTab === 'apply' ? colors.primary : additionalColors.textLight}>
              {t('driver_application')}
            </CustomText>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />
          }
        >
          {activeTab === 'overview' && (
            <>
              {/* Welcome */}
              <View style={styles.welcomeCard}>
                <View style={styles.avatar}>
                  <Ionicons name="bicycle" size={28} color={colors.primary} />
                </View>
                <View style={styles.welcomeText}>
                  <CustomText variant="caption" color={additionalColors.textLight}>
                    {t('welcome')} 👋
                  </CustomText>
                  <CustomText variant="h3" color={additionalColors.text}>
                    {user?.name || t('driver')}
                  </CustomText>
                </View>
                {stats.active_orders > 0 && (
                  <View style={styles.activeIndicator}>
                    <View style={styles.activeDot} />
                    <CustomText variant="small" color={additionalColors.success}>
                      {stats.active_orders} {t('active')}
                    </CustomText>
                  </View>
                )}
              </View>

              {/* Stats */}
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

              {/* Active Orders Summary */}
              {(activeOrders.length > 0 || pendingOrders.length > 0) && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <CustomText variant="h4" style={styles.sectionTitle}>
                      {t('active_orders')}
                    </CustomText>
                    <TouchableOpacity onPress={() => setActiveTab('orders')}>
                      <CustomText variant="small" color={colors.primary}>
                        {t('view_orders')}
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                  {activeOrders.slice(0, 2).map((order) => renderOrderCard(order, 'active'))}
                  {pendingOrders.slice(0, 2).map((order) => renderOrderCard(order, 'pending'))}
                </View>
              )}

              {/* Recent Completed */}
              {completedOrders.length > 0 && (
                <View style={styles.section}>
                  <CustomText variant="h4" style={styles.sectionTitle}>
                    {t('recentOrders')}
                  </CustomText>
                  {completedOrders.slice(0, 3).map((order) => renderOrderCard(order, 'completed'))}
                </View>
              )}

              {/* Empty State */}
              {activeOrders.length === 0 && pendingOrders.length === 0 && completedOrders.length === 0 && (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="bicycle-outline" size={48} color={additionalColors.textLight} />
                  </View>
                  <CustomText variant="h4" color={additionalColors.textLight} style={styles.emptyTitle}>
                    {t('noAvailableOrders')}
                  </CustomText>
                  <CustomText variant="body" color={additionalColors.textLight} style={styles.emptyText}>
                    {t('no_orders_description')}
                  </CustomText>
                </View>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <>
              {/* Pending Orders */}
              {pendingOrders.length > 0 && (
                <View style={styles.section}>
                  <CustomText variant="h4" style={styles.sectionTitle}>
                    {t('availableOrders')} ({pendingOrders.length})
                  </CustomText>
                  {pendingOrders.map((order) => renderOrderCard(order, 'pending'))}
                </View>
              )}

              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <View style={styles.section}>
                  <CustomText variant="h4" style={styles.sectionTitle}>
                    {t('active_orders')} ({activeOrders.length})
                  </CustomText>
                  {activeOrders.map((order) => renderOrderCard(order, 'active'))}
                </View>
              )}

              {/* Accepted Orders */}
              {acceptedOrders.length > 0 && (
                <View style={styles.section}>
                  <CustomText variant="h4" style={styles.sectionTitle}>
                    {t('accepted_orders')} ({acceptedOrders.length})
                  </CustomText>
                  {acceptedOrders.map((order) => renderOrderCard(order, 'accepted'))}
                </View>
              )}

              {/* Completed Orders */}
              {completedOrders.length > 0 && (
                <View style={styles.section}>
                  <CustomText variant="h4" style={styles.sectionTitle}>
                    {t('completedDeliveries')} ({completedOrders.length})
                  </CustomText>
                  {completedOrders.map((order) => renderOrderCard(order, 'completed'))}
                </View>
              )}

              {/* Empty */}
              {pendingOrders.length === 0 && activeOrders.length === 0 && acceptedOrders.length === 0 && completedOrders.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="list-outline" size={60} color={additionalColors.textLight} />
                  <CustomText variant="h4" color={additionalColors.textLight} style={styles.emptyText}>
                    {t('noOrders')}
                  </CustomText>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary || '#f8f9fa',
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
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${additionalColors.error}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: additionalColors.border,
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  badge: {
    backgroundColor: additionalColors.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: additionalColors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    flex: 1,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${additionalColors.success}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: additionalColors.success,
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
    borderColor: additionalColors.borderLight || additionalColors.border,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Cairo-SemiBold',
    marginBottom: 12,
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
  orderInfo: {},
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
  orderDetails: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: additionalColors.borderLight || additionalColors.border,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: additionalColors.borderLight || additionalColors.border,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: additionalColors.borderLight || additionalColors.border,
  },
  actionButton: {
    flex: 1,
  },
  fullButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: additionalColors.border,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: additionalColors.gray100 || '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default DriverDashboard;
